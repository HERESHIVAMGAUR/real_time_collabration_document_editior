const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const User = require('../models/User');

const router = express.Router();

// Get all documents for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const documents = await Document.find({
      $or: [
        { owner: userId },
        { 'collaborators.userId': userId },
        { isPublic: true }
      ]
    })
    .sort({ lastModified: -1 })
    .select('_id title lastModified owner collaborators isPublic createdAt')
    .populate('owner', 'name email')
    .populate('collaborators.userId', 'name email');

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get a specific document
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const document = await Document.findById(id)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has access
    const hasAccess = document.isPublic || 
                     document.owner === userId || 
                     document.collaborators.some(c => c.userId === userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create a new document
router.post('/', async (req, res) => {
  try {
    const { title, content, userId, isPublic } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const documentId = uuidv4();
    const newDocument = new Document({
      _id: documentId,
      title: title || 'Untitled Document',
      content: content || '',
      owner: userId,
      isPublic: isPublic || false,
      collaborators: []
    });

    await newDocument.save();
    
    const populatedDocument = await Document.findById(documentId)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    res.status(201).json(populatedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Update document metadata (title, isPublic, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isPublic, userId } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has admin access
    const isOwner = document.owner === userId;
    const hasAdminAccess = isOwner || 
                          document.collaborators.some(c => 
                            c.userId === userId && c.permission === 'admin'
                          );

    if (!hasAdminAccess) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Update fields
    if (title !== undefined) document.title = title;
    if (isPublic !== undefined) document.isPublic = isPublic;
    
    await document.save();

    const updatedDocument = await Document.findById(id)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only owner can delete
    if (document.owner !== userId) {
      return res.status(403).json({ error: 'Only the owner can delete this document' });
    }

    await Document.findByIdAndDelete(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Add collaborator to document
router.post('/:id/collaborators', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permission, userId } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has admin access
    const isOwner = document.owner === userId;
    const hasAdminAccess = isOwner || 
                          document.collaborators.some(c => 
                            c.userId === userId && c.permission === 'admin'
                          );

    if (!hasAdminAccess) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Find user by email
    const collaboratorUser = await User.findOne({ email: email.toLowerCase() });
    if (!collaboratorUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a collaborator
    const existingCollaborator = document.collaborators.find(c => 
      c.userId === collaboratorUser._id
    );

    if (existingCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    // Add collaborator
    document.collaborators.push({
      userId: collaboratorUser._id,
      permission: permission || 'write'
    });

    await document.save();

    const updatedDocument = await Document.findById(id)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Remove collaborator from document
router.delete('/:id/collaborators/:collaboratorId', async (req, res) => {
  try {
    const { id, collaboratorId } = req.params;
    const { userId } = req.query;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user has admin access or is removing themselves
    const isOwner = document.owner === userId;
    const hasAdminAccess = isOwner || 
                          document.collaborators.some(c => 
                            c.userId === userId && c.permission === 'admin'
                          );
    const isRemovingSelf = collaboratorId === userId;

    if (!hasAdminAccess && !isRemovingSelf) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Remove collaborator
    document.collaborators = document.collaborators.filter(c => 
      c.userId !== collaboratorId
    );

    await document.save();

    const updatedDocument = await Document.findById(id)
      .populate('owner', 'name email')
      .populate('collaborators.userId', 'name email');

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

module.exports = router;