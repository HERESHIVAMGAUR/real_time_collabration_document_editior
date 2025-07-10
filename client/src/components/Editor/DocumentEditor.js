import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiUsers, FiWifi, FiWifiOff, FiSave, FiSettings, FiShare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getDocument } from '../../services/documentService';
import LoadingSpinner from '../UI/LoadingSpinner';

const EditorContainer = styled.div`
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EditorHeader = styled.div`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  flex-shrink: 0;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex: 1;
  min-width: 0;
`;

const DocumentTitle = styled.input`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  background: transparent;
  border: none;
  outline: none;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius};
  flex: 1;
  min-width: 200px;

  &:focus {
    background: ${props => props.theme.colors.background};
    box-shadow: ${props => props.theme.shadows.light};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$connected ? props.theme.colors.success : props.theme.colors.error}15;
  color: ${props => props.$connected ? props.theme.colors.success : props.theme.colors.error};
`;

const SaveStatus = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const CollaboratorsSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CollaboratorList = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const CollaboratorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  position: relative;
  border: 2px solid ${props => props.theme.colors.background};
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    background: ${props => props.theme.colors.success};
    border-radius: 50%;
    border: 2px solid ${props => props.theme.colors.background};
  }
`;

const CollaboratorCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: ${props => props.theme.spacing.sm};
`;

const EditorContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;

  .ql-editor {
    font-size: 16px;
    line-height: 1.6;
    padding: ${props => props.theme.spacing.xl};
    min-height: calc(100vh - 160px);
  }

  .ql-toolbar {
    border-left: none;
    border-right: none;
    border-top: none;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .ql-container {
    border-left: none;
    border-right: none;
    border-bottom: none;
    flex: 1;
    overflow-y: auto;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.$primary ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$primary ? 'white' : props.theme.colors.textSecondary};
  border: 1px solid ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$primary ? props.theme.colors.primaryHover : props.theme.colors.secondary};
    color: ${props => props.$primary ? 'white' : props.theme.colors.text};
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}15;
  border: 1px solid ${props => props.theme.colors.error}30;
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  margin: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius};
`;

function DocumentEditor() {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const { 
    socket, 
    connected, 
    collaborators, 
    joinDocument, 
    sendTextChange, 
    sendTitleChange 
  } = useSocket();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);

  const quillRef = useRef(null);
  const titleTimeoutRef = useRef(null);
  const contentTimeoutRef = useRef(null);
  const isUpdatingFromSocket = useRef(false);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image'
  ];

  // Load document data
  const loadDocument = useCallback(async () => {
    if (!documentId || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading document:', documentId);
      
      const doc = await getDocument(documentId, user.id);
      console.log('Document loaded:', doc);
      
      setDocument(doc);
      setTitle(doc.title || 'Untitled Document');
      setContent(doc.content || '');
      setLastSaved(doc.lastModified ? new Date(doc.lastModified) : null);
    } catch (error) {
      console.error('Error loading document:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load document. You may not have permission to access it.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentId, user]);

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Join document socket room after document is loaded
  useEffect(() => {
    if (documentId && user && socket && connected && !loading && !error) {
      console.log('Joining document room:', documentId);
      joinDocument(documentId);
    }
  }, [documentId, user, socket, connected, loading, error, joinDocument]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDocumentData = (data) => {
      console.log('Received document data:', data);
      isUpdatingFromSocket.current = true;
      setContent(data.content || '');
      setTitle(data.title || 'Untitled Document');
      setLastSaved(data.lastModified ? new Date(data.lastModified) : null);
      setTimeout(() => {
        isUpdatingFromSocket.current = false;
      }, 100);
    };

    const handleTextChange = (data) => {
      console.log('Received text change:', data);
      if (quillRef.current && data.userId !== user?.id) {
        isUpdatingFromSocket.current = true;
        const quill = quillRef.current.getEditor();
        if (data.delta) {
          quill.updateContents(data.delta, 'silent');
        } else if (data.content) {
          quill.setContents(quill.clipboard.convert(data.content), 'silent');
        }
        setTimeout(() => {
          isUpdatingFromSocket.current = false;
        }, 100);
      }
    };

    const handleTitleChange = (data) => {
      console.log('Received title change:', data);
      if (data.userId !== user?.id) {
        setTitle(data.title || 'Untitled Document');
      }
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'A socket error occurred');
    };

    socket.on('document-data', handleDocumentData);
    socket.on('text-change', handleTextChange);
    socket.on('title-change', handleTitleChange);
    socket.on('error', handleError);

    return () => {
      socket.off('document-data', handleDocumentData);
      socket.off('text-change', handleTextChange);
      socket.off('title-change', handleTitleChange);
      socket.off('error', handleError);
    };
  }, [socket, user]);

  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle);
    
    // Debounce title updates
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }
    
    titleTimeoutRef.current = setTimeout(() => {
      if (connected) {
        sendTitleChange(newTitle);
      }
    }, 500);
  }, [sendTitleChange, connected]);

  const handleContentChange = useCallback((value, delta, source, editor) => {
    if (source === 'user' && !isUpdatingFromSocket.current) {
      const newContent = editor.getHTML();
      setContent(newContent);
      
      // Send real-time changes
      if (connected) {
        sendTextChange(delta, newContent);
      }
      
      // Debounce save status update
      setSaving(true);
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
      }
      
      contentTimeoutRef.current = setTimeout(() => {
        setSaving(false);
        setLastSaved(new Date());
      }, 1000);
    }
  }, [sendTextChange, connected]);

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const formatLastSaved = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleShareDocument = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Document link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullscreen text="Loading document..." />;
  }

  if (error) {
    return (
      <EditorContainer>
        <ErrorMessage>
          {error}
          <div style={{ marginTop: '16px' }}>
            <ActionButton onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </ActionButton>
          </div>
        </ErrorMessage>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <EditorHeader>
        <TitleSection>
          <DocumentTitle
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Document"
          />
        </TitleSection>

        <StatusSection>
          <ConnectionStatus $connected={connected}>
            {connected ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
            {connected ? 'Connected' : 'Disconnected'}
          </ConnectionStatus>

          <SaveStatus>
            {saving ? (
              <>
                <FiSave size={12} />
                Saving...
              </>
            ) : (
              <>
                Saved {formatLastSaved(lastSaved)}
              </>
            )}
          </SaveStatus>

          <CollaboratorsSection>
            <CollaboratorList>
              {collaborators.slice(0, 5).map((collaborator) => (
                <CollaboratorAvatar
                  key={collaborator.userId}
                  $color={collaborator.color}
                  title={collaborator.userName}
                >
                  {getInitials(collaborator.userName)}
                </CollaboratorAvatar>
              ))}
            </CollaboratorList>
            
            <CollaboratorCount>
              <FiUsers size={12} />
              {collaborators.length} online
            </CollaboratorCount>
          </CollaboratorsSection>

          <ActionButton onClick={handleShareDocument}>
            <FiShare size={12} />
            Share
          </ActionButton>
        </StatusSection>
      </EditorHeader>

      <EditorContent>
        <EditorWrapper>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing your document..."
          />
        </EditorWrapper>
      </EditorContent>
    </EditorContainer>
  );
}

export default DocumentEditor;