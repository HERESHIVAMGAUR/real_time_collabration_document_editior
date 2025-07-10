import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [collaborators, setCollaborators] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
          userName: user.name
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
        setCurrentDocument(null);
        setCollaborators([]);
      }
    }
  }, [user]);

  // Join document
  const joinDocument = useCallback((documentId) => {
    if (socket && user && connected) {
      console.log('Joining document:', documentId);
      socket.emit('join-document', {
        documentId,
        userId: user.id,
        userName: user.name
      });
      setCurrentDocument(documentId);
    }
  }, [socket, user, connected]);

  // Leave document - fixed to leave room instead of disconnecting socket
  const leaveDocument = useCallback(() => {
    if (socket && currentDocument) {
      console.log('Leaving document:', currentDocument);
      socket.emit('leave-document', {
        documentId: currentDocument,
        userId: user?.id
      });
      setCurrentDocument(null);
      setCollaborators([]);
    }
  }, [socket, currentDocument, user]);

  // Send text change
  const sendTextChange = useCallback((delta, content) => {
    if (socket && currentDocument && connected) {
      socket.emit('text-change', {
        documentId: currentDocument,
        delta,
        content,
        userId: user?.id
      });
    }
  }, [socket, currentDocument, connected, user]);

  // Send cursor change
  const sendCursorChange = useCallback((position) => {
    if (socket && currentDocument && connected) {
      socket.emit('cursor-change', {
        documentId: currentDocument,
        position,
        userId: user?.id
      });
    }
  }, [socket, currentDocument, connected, user]);

  // Send title change
  const sendTitleChange = useCallback((title) => {
    if (socket && currentDocument && connected) {
      socket.emit('title-change', {
        documentId: currentDocument,
        title,
        userId: user?.id
      });
    }
  }, [socket, currentDocument, connected, user]);

  // Event listeners setup
  useEffect(() => {
    if (!socket) return;

    // User events
    const handleUserJoined = (data) => {
      console.log('User joined:', data);
      setCollaborators(prev => {
        const existing = prev.find(c => c.userId === data.userId);
        if (existing) return prev;
        return [...prev, {
          userId: data.userId,
          userName: data.userName,
          color: data.color || '#4A90E2'
        }];
      });
    };

    const handleUserLeft = (data) => {
      console.log('User left:', data);
      setCollaborators(prev => prev.filter(c => c.userId !== data.userId));
    };

    const handleUsersUpdate = (users) => {
      console.log('Users update:', users);
      setCollaborators(users.map(user => ({
        userId: user.userId,
        userName: user.userName,
        color: user.color || '#4A90E2'
      })));
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
    };

    // Register event listeners
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('users-update', handleUsersUpdate);
    socket.on('error', handleError);

    // Cleanup
    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('users-update', handleUsersUpdate);
      socket.off('error', handleError);
    };
  }, [socket]);

  const value = {
    socket,
    connected,
    currentDocument,
    collaborators,
    joinDocument,
    leaveDocument,
    sendTextChange,
    sendCursorChange,
    sendTitleChange
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}