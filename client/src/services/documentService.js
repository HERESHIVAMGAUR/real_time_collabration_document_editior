import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const documentAPI = axios.create({
  baseURL: `${API_BASE_URL}/documents`,
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
});

// Get all documents for a user
export const getUserDocuments = async (userId) => {
  const response = await documentAPI.get('/', {
    params: { userId }
  });
  return response.data;
};

// Get a specific document
export const getDocument = async (documentId, userId) => {
  const response = await documentAPI.get(`/${documentId}`, {
    params: { userId }
  });
  return response.data;
};

// Create a new document
export const createDocument = async (documentData) => {
  const response = await documentAPI.post('/', documentData);
  return response.data;
};

// Update document metadata
export const updateDocument = async (documentId, updateData) => {
  const response = await documentAPI.put(`/${documentId}`, updateData);
  return response.data;
};

// Delete a document
export const deleteDocument = async (documentId, userId) => {
  const response = await documentAPI.delete(`/${documentId}`, {
    params: { userId }
  });
  return response.data;
};

// Add collaborator to document
export const addCollaborator = async (documentId, collaboratorData) => {
  const response = await documentAPI.post(`/${documentId}/collaborators`, collaboratorData);
  return response.data;
};

// Remove collaborator from document
export const removeCollaborator = async (documentId, collaboratorId, userId) => {
  const response = await documentAPI.delete(`/${documentId}/collaborators/${collaboratorId}`, {
    params: { userId }
  });
  return response.data;
};

// Update collaborator permissions
export const updateCollaboratorPermissions = async (documentId, collaboratorId, permission, userId) => {
  const response = await documentAPI.put(`/${documentId}/collaborators/${collaboratorId}`, {
    permission,
    userId
  });
  return response.data;
};