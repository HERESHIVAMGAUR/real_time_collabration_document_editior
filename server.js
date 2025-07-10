const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import models and routes
const Document = require('./models/Document');
const User = require('./models/User');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Store active documents and their connected users
const activeDocuments = new Map();
const userSockets = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a document room
  socket.on('join-document', async (data) => {
    const { documentId, userId, userName } = data;
    
    try {
      // Get or create document
      let document = await Document.findById(documentId);
      if (!document) {
        document = new Document({ 
          _id: documentId, 
          title: 'Untitled Document',
          content: '',
          collaborators: []
        });
        await document.save();
      }

      // Join the document room
      socket.join(documentId);
      
      // Track user in document
      if (!activeDocuments.has(documentId)) {
        activeDocuments.set(documentId, new Map());
      }
      
      const documentUsers = activeDocuments.get(documentId);
      documentUsers.set(socket.id, { userId, userName, cursorPosition: 0 });
      userSockets.set(socket.id, { documentId, userId, userName });

      // Send current document to user
      socket.emit('document-data', {
        content: document.content,
        title: document.title,
        lastModified: document.lastModified
      });

      // Notify others about new user
      socket.to(documentId).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id
      });

      // Send current users list
      const currentUsers = Array.from(documentUsers.values());
      io.to(documentId).emit('users-update', currentUsers);

    } catch (error) {
      console.error('Error joining document:', error);
      socket.emit('error', 'Failed to join document');
    }
  });

  // Handle text changes
  socket.on('text-change', async (data) => {
    const { documentId, delta, content } = data;
    const userInfo = userSockets.get(socket.id);

    if (userInfo && userInfo.documentId === documentId) {
      // Broadcast changes to other users in the document
      socket.to(documentId).emit('text-change', {
        delta,
        content,
        userId: userInfo.userId,
        userName: userInfo.userName
      });

      // Save to database (with debouncing in real implementation)
      try {
        await Document.findByIdAndUpdate(documentId, {
          content: content,
          lastModified: new Date()
        });
      } catch (error) {
        console.error('Error saving document:', error);
      }
    }
  });

  // Handle cursor position changes
  socket.on('cursor-change', (data) => {
    const { documentId, position } = data;
    const userInfo = userSockets.get(socket.id);

    if (userInfo && userInfo.documentId === documentId) {
      const documentUsers = activeDocuments.get(documentId);
      if (documentUsers && documentUsers.has(socket.id)) {
        const user = documentUsers.get(socket.id);
        user.cursorPosition = position;
        
        // Broadcast cursor position to other users
        socket.to(documentId).emit('cursor-change', {
          userId: userInfo.userId,
          userName: userInfo.userName,
          position: position
        });
      }
    }
  });

  // Handle document title changes
  socket.on('title-change', async (data) => {
    const { documentId, title } = data;
    const userInfo = userSockets.get(socket.id);

    if (userInfo && userInfo.documentId === documentId) {
      try {
        await Document.findByIdAndUpdate(documentId, {
          title: title,
          lastModified: new Date()
        });

        // Broadcast title change to other users
        socket.to(documentId).emit('title-change', { title });
      } catch (error) {
        console.error('Error updating title:', error);
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const userInfo = userSockets.get(socket.id);
    if (userInfo) {
      const { documentId, userId, userName } = userInfo;
      
      // Remove user from active document
      const documentUsers = activeDocuments.get(documentId);
      if (documentUsers) {
        documentUsers.delete(socket.id);
        
        // Notify others about user leaving
        socket.to(documentId).emit('user-left', {
          userId,
          userName,
          socketId: socket.id
        });

        // Send updated users list
        const currentUsers = Array.from(documentUsers.values());
        io.to(documentId).emit('users-update', currentUsers);

        // Clean up empty document rooms
        if (documentUsers.size === 0) {
          activeDocuments.delete(documentId);
        }
      }
      
      userSockets.delete(socket.id);
    }
  });
});

// Serve React app in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});