import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// Create axios instance with default config
const documentAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/documents`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
documentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
documentAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Get all documents for a user
export const getUserDocuments = async (userId) => {
  try {
    const response = await documentAPI.get('/', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
};

// Get a specific document
export const getDocument = async (documentId, userId) => {
  try {
    const response = await documentAPI.get(`/${documentId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};

// Create a new document
export const createDocument = async (documentData) => {
  try {
    const response = await documentAPI.post('/', documentData);
    return response.data;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

// Update document metadata
export const updateDocument = async (documentId, updateData) => {
  try {
    const response = await documentAPI.put(`/${documentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (documentId, userId) => {
  try {
    const response = await documentAPI.delete(`/${documentId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Add collaborator to document
export const addCollaborator = async (documentId, collaboratorData) => {
  try {
    const response = await documentAPI.post(`/${documentId}/collaborators`, collaboratorData);
    return response.data;
  } catch (error) {
    console.error('Error adding collaborator:', error);
    throw error;
  }
};

// Remove collaborator from document
export const removeCollaborator = async (documentId, collaboratorId, userId) => {
  try {
    const response = await documentAPI.delete(`/${documentId}/collaborators/${collaboratorId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing collaborator:', error);
    throw error;
  }
};

// Update collaborator permissions
export const updateCollaboratorPermissions = async (documentId, collaboratorId, permission, userId) => {
  try {
    const response = await documentAPI.put(`/${documentId}/collaborators/${collaboratorId}`, {
      permission,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error updating collaborator permissions:', error);
    throw error;
  }
};