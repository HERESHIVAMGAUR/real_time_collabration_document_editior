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
        }
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
    if (socket && user) {
      socket.emit('join-document', {
        documentId,
        userId: user.id,
        userName: user.name
      });
      setCurrentDocument(documentId);
    }
  }, [socket, user]);

  // Leave document
  const leaveDocument = useCallback(() => {
    if (socket && currentDocument) {
      socket.disconnect();
      setCurrentDocument(null);
      setCollaborators([]);
    }
  }, [socket, currentDocument]);

  // Send text change
  const sendTextChange = useCallback((delta, content) => {
    if (socket && currentDocument) {
      socket.emit('text-change', {
        documentId: currentDocument,
        delta,
        content
      });
    }
  }, [socket, currentDocument]);

  // Send cursor change
  const sendCursorChange = useCallback((position) => {
    if (socket && currentDocument) {
      socket.emit('cursor-change', {
        documentId: currentDocument,
        position
      });
    }
  }, [socket, currentDocument]);

  // Send title change
  const sendTitleChange = useCallback((title) => {
    if (socket && currentDocument) {
      socket.emit('title-change', {
        documentId: currentDocument,
        title
      });
    }
  }, [socket, currentDocument]);

  // Event listeners setup
  useEffect(() => {
    if (!socket) return;

    // Document events
    const handleDocumentData = (data) => {
      console.log('Received document data:', data);
    };

    const handleTextChange = (data) => {
      console.log('Received text change:', data);
      // This will be handled by the editor component
    };

    const handleCursorChange = (data) => {
      console.log('Received cursor change:', data);
      // This will be handled by the editor component
    };

    const handleTitleChange = (data) => {
      console.log('Received title change:', data);
      // This will be handled by the editor component
    };

    // User events
    const handleUserJoined = (data) => {
      console.log('User joined:', data);
      setCollaborators(prev => {
        const existing = prev.find(c => c.userId === data.userId);
        if (existing) return prev;
        return [...prev, data];
      });
    };

    const handleUserLeft = (data) => {
      console.log('User left:', data);
      setCollaborators(prev => prev.filter(c => c.userId !== data.userId));
    };

    const handleUsersUpdate = (users) => {
      console.log('Users update:', users);
      setCollaborators(users);
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
    };

    // Register event listeners
    socket.on('document-data', handleDocumentData);
    socket.on('text-change', handleTextChange);
    socket.on('cursor-change', handleCursorChange);
    socket.on('title-change', handleTitleChange);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('users-update', handleUsersUpdate);
    socket.on('error', handleError);

    // Cleanup
    return () => {
      socket.off('document-data', handleDocumentData);
      socket.off('text-change', handleTextChange);
      socket.off('cursor-change', handleCursorChange);
      socket.off('title-change', handleTitleChange);
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