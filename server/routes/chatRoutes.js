const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    deleteChat
} = require('../controllers/chatController');

// All chat routes are protected
router.route('/')
    .post(protect, accessChat)      // Create or access chat
    .get(protect, fetchChats);      // Get all chats

router.post('/group', protect, createGroupChat);    // Create group chat
router.put('/rename', protect, renameGroup);        // Rename group
router.put('/adduser', protect, addToGroup);        // Add user to group
router.put('/removeuser', protect, removeFromGroup); // Remove user from group
router.delete('/:chatId', protect, deleteChat);     // Delete chat

module.exports = router;