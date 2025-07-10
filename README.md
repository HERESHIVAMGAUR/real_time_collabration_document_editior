# Real-Time Collaborative Document Editor

A modern, real-time collaborative document editor built with React.js, Node.js, Socket.io, and MongoDB. Multiple users can edit documents simultaneously with live updates, cursor tracking, and user presence indicators.

## 🚀 Features

### Real-time Collaboration
- **Live editing**: Multiple users can edit the same document simultaneously
- **Real-time synchronization**: Changes are instantly synchronized across all connected users
- **User presence**: See who's currently viewing and editing the document
- **Conflict resolution**: Automatic handling of simultaneous edits

### Rich Text Editing
- **Quill.js editor**: Professional rich text editing experience
- **Formatting options**: Bold, italic, underline, colors, lists, headers, and more
- **Media support**: Insert images and links
- **Auto-save**: Documents are automatically saved as you type

### User Management
- **User authentication**: Secure login and registration system
- **Guest access**: Users can join as guests without registration
- **User profiles**: Customizable profiles with themes and preferences
- **Collaboration permissions**: Control who can view and edit documents

### Modern UI/UX
- **Responsive design**: Works perfectly on desktop and mobile devices
- **Dark/Light themes**: Toggle between light and dark modes
- **Modern interface**: Clean, intuitive design with smooth animations
- **Real-time status**: Connection status and save indicators

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **styled-components** - CSS-in-JS styling
- **Quill.js** - Rich text editor
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd real_time_collabration_document_editior
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-client
```

### 3. Set up MongoDB
Make sure MongoDB is running on your system:
```bash
# Start MongoDB (varies by system)
mongod
```

### 4. Configure environment variables
Copy the `.env` file and update it with your settings:
```bash
# The .env file is already created with default values
# Update MONGODB_URI, JWT_SECRET, and other settings as needed
```

### 5. Start the application
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start them separately:
# Backend (Terminal 1)
npm start

# Frontend (Terminal 2)
cd client
npm start
```

### 6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
real_time_collabration_document_editior/
├── server.js                 # Express server entry point
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── models/                   # MongoDB schemas
│   ├── Document.js
│   └── User.js
├── routes/                   # API routes
│   ├── documents.js
│   └── users.js
└── client/                   # React frontend
    ├── package.json          # Frontend dependencies
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            # Main App component
        ├── index.js          # React entry point
        ├── components/       # React components
        │   ├── Auth/         # Authentication components
        │   ├── Dashboard/    # Dashboard components
        │   ├── Editor/       # Document editor
        │   ├── Layout/       # Layout components
        │   └── UI/           # Reusable UI components
        ├── context/          # React Context providers
        │   ├── AuthContext.js
        │   └── SocketContext.js
        └── services/         # API service functions
            ├── authService.js
            └── documentService.js
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

```bash
# Server Configuration
PORT=5000                     # Server port
NODE_ENV=development          # Environment mode

# Database
MONGODB_URI=mongodb://localhost:27017/collaborative-editor

# Authentication
JWT_SECRET=your-secret-key    # Change this in production!

# Client
CLIENT_URL=http://localhost:3000

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### MongoDB Setup

1. **Install MongoDB** on your system
2. **Start MongoDB** service
3. The application will automatically create the required database and collections

## 🎯 Usage Guide

### Creating an Account
1. Visit http://localhost:3000
2. Click "Create one here" to register
3. Fill in your name, email, and password
4. You'll be automatically logged in after registration

### Guest Access
1. Click "Continue as Guest" on the login page
2. Optionally enter your name
3. You'll have full access to create and edit documents

### Creating Documents
1. From the dashboard, click "New Document"
2. Start typing in the editor
3. The document title can be edited by clicking on it
4. Documents are automatically saved

### Collaborating
1. Share the document URL with others
2. Multiple users can edit simultaneously
3. See other users' cursors and changes in real-time
4. User presence is shown in the top-right corner

### Document Management
- **View all documents** on the dashboard
- **Search documents** using the search bar
- **Delete documents** using the trash icon (owner only)
- **Edit titles** by clicking on the document title

## 🔐 Security Features

- **Password hashing** with bcryptjs
- **JWT authentication** for secure sessions
- **Input validation** and sanitization
- **CORS protection** for API endpoints
- **Permission-based access** to documents

## 🚀 Deployment

### Production Build
```bash
# Build the React frontend
npm run build-client

# Start the production server
NODE_ENV=production npm start
```

### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Set up proper CORS origins
5. Use HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/guest` - Create guest user
- `GET /api/users/verify` - Verify JWT token

### Document Endpoints
- `GET /api/documents` - Get user's documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Real-time Events (Socket.io)
- `join-document` - Join document editing room
- `text-change` - Send/receive text changes
- `cursor-change` - Send/receive cursor position
- `title-change` - Send/receive title changes
- `user-joined` - User joined notification
- `user-left` - User left notification

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check the `MONGODB_URI` in `.env`

**Port Already in Use**
- Change the `PORT` in `.env`
- Kill the process using the port: `lsof -ti:5000 | xargs kill`

**Real-time Features Not Working**
- Check browser console for Socket.io errors
- Verify CORS settings in backend
- Ensure both frontend and backend are running

**Authentication Issues**
- Clear browser localStorage
- Check JWT_SECRET configuration
- Verify API endpoints are accessible

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Quill.js** for the excellent rich text editor
- **Socket.io** for real-time communication
- **React** team for the amazing framework
- **MongoDB** for the flexible database solution

---

**Built with ❤️ for collaborative productivity**