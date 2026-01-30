// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
// const { messageUpload, handleMessageUploadError } = require('../middleware/messageUploadMiddleware');
// const {
//     sendMessage,
//     allMessages,
//     markAsRead,
//     deleteMessage,
//     sendImage
// } = require('../controllers/messageController');

// // Get all messages for a chat
// router.get('/:chatId', protect, allMessages);

// // Send a message
// router.post('/', protect, sendMessage);

// // Send image in chat
// router.post('/image',
//     protect,
//     messageUpload.single('image'),
//     sendImage
// );

// // Mark message as read
// router.put('/read/:messageId', protect, markAsRead);

// // Delete a message
// router.delete('/:messageId', protect, deleteMessage);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    sendMessage,
    allMessages,
    markAsRead,
    deleteMessage
} = require('../controllers/messageController');

// Get all messages for a chat
router.get('/:chatId', protect, allMessages);

// Send a message
router.post('/', protect, sendMessage);

// Mark message as read
router.put('/read/:messageId', protect, markAsRead);

// Delete a message
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;