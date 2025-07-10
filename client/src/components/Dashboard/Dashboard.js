import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiFileText, FiUsers, FiClock, FiTrash2, FiEdit, FiShare } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getUserDocuments, createDocument, deleteDocument } from '../../services/documentService';
import LoadingSpinner from '../UI/LoadingSpinner';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const WelcomeMessage = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    background: ${props => props.theme.colors.border};
    cursor: not-allowed;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 300px;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const DocumentCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius};
  padding: ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const DocumentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DocumentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.primary}15;
  border-radius: ${props => props.theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
`;

const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DocumentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const DocumentStats = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const DocumentActions = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${DocumentCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadows.light};

  &:hover {
    background: ${props => props.danger ? props.theme.colors.error : props.theme.colors.primary};
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${props => props.theme.spacing.lg};
  opacity: 0.5;
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, [user]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const docs = await getUserDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (!searchTerm) {
      setFilteredDocuments(documents);
      return;
    }

    const filtered = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleCreateDocument = async () => {
    try {
      setCreating(true);
      const documentId = uuidv4();
      const newDoc = await createDocument({
        title: 'Untitled Document',
        content: '',
        userId: user.id
      });

      toast.success('Document created successfully!');
      navigate(`/document/${newDoc._id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const handleDocumentClick = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  const handleDeleteDocument = async (e, documentId) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(documentId, user.id);
      setDocuments(documents.filter(doc => doc._id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <LoadingSpinner fullscreen text="Loading your documents..." />;
  }

  return (
    <DashboardContainer>
      <Header>
        <WelcomeMessage>
          Welcome back, {user?.name}!
        </WelcomeMessage>
        <Subtitle>
          Start collaborating on documents or continue where you left off.
        </Subtitle>
      </Header>

      <ActionBar>
        <CreateButton onClick={handleCreateDocument} disabled={creating}>
          <FiPlus size={20} />
          {creating ? 'Creating...' : 'New Document'}
        </CreateButton>
        
        <SearchInput
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </ActionBar>

      {filteredDocuments.length > 0 ? (
        <DocumentsGrid>
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc._id}
              onClick={() => handleDocumentClick(doc._id)}
            >
              <DocumentHeader>
                <DocumentIcon>
                  <FiFileText size={20} />
                </DocumentIcon>
                <DocumentInfo>
                  <DocumentTitle>{doc.title}</DocumentTitle>
                  <DocumentMeta>
                    <FiClock size={12} />
                    {formatDate(doc.lastModified)}
                  </DocumentMeta>
                </DocumentInfo>
              </DocumentHeader>

              <DocumentStats>
                <StatItem>
                  <FiUsers size={12} />
                  {doc.collaborators?.length || 0} collaborator{doc.collaborators?.length !== 1 ? 's' : ''}
                </StatItem>
                {doc.isPublic && (
                  <StatItem>
                    <FiShare size={12} />
                    Public
                  </StatItem>
                )}
              </DocumentStats>

              <DocumentActions>
                <ActionButton
                  onClick={(e) => handleDeleteDocument(e, doc._id)}
                  danger
                  title="Delete document"
                >
                  <FiTrash2 size={14} />
                </ActionButton>
              </DocumentActions>
            </DocumentCard>
          ))}
        </DocumentsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <FiFileText />
          </EmptyIcon>
          <EmptyTitle>
            {searchTerm ? 'No documents found' : 'No documents yet'}
          </EmptyTitle>
          <EmptyDescription>
            {searchTerm 
              ? `No documents match "${searchTerm}". Try a different search term.`
              : 'Create your first document to start collaborating with others.'
            }
          </EmptyDescription>
          {!searchTerm && (
            <CreateButton onClick={handleCreateDocument} disabled={creating}>
              <FiPlus size={20} />
              {creating ? 'Creating...' : 'Create Your First Document'}
            </CreateButton>
          )}
        </EmptyState>
      )}
    </DashboardContainer>
  );
}

export default Dashboard;