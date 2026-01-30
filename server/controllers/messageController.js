// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
// const User = require('../models/User');

// // Send a message
// const sendMessage = async (req, res) => {
//     try {
//         console.log('=== SEND MESSAGE REQUEST ===');
//         console.log('Body:', req.body);
//         console.log('User:', req.user._id);
//         console.log('File:', req.file);

//         const { content, chatId } = req.body;
//         const image = req.file;

//         if (!chatId) {
//             console.log('ERROR: No chatId provided');
//             return res.status(400).json({
//                 success: false,
//                 message: 'Chat ID is required'
//             });
//         }

//         if (!content && !image) {
//             console.log('ERROR: No content or image');
//             return res.status(400).json({
//                 success: false,
//                 message: 'Message content or image is required'
//             });
//         }

//         // Check if chat exists
//         const chat = await Chat.findById(chatId);
//         if (!chat) {
//             console.log('ERROR: Chat not found:', chatId);
//             return res.status(404).json({
//                 success: false,
//                 message: 'Chat not found'
//             });
//         }

//         console.log('Chat found:', chat._id);
//         console.log('Chat participants:', chat.participants);

//         // Check if user is participant
//         const isParticipant = chat.participants.some(
//             participant => participant.toString() === req.user._id.toString()
//         );

//         if (!isParticipant) {
//             console.log('ERROR: User not participant');
//             return res.status(403).json({
//                 success: false,
//                 message: 'Not authorized to send message in this chat'
//             });
//         }

//         // Create message
//         const messageData = {
//             sender: req.user._id,
//             chat: chatId,
//             content: content || '',
//             readBy: [req.user._id]
//         };

//         if (image) {
//             messageData.image = `/uploads/messages/${image.filename}`;
//         }

//         console.log('Creating message:', messageData);

//         let message = await Message.create(messageData);
//         console.log('Message created:', message._id);

//         message = await Message.findById(message._id)
//             .populate('sender', 'name email profilePic');

//         // Update last message in chat
//         chat.lastMessage = message._id;
//         await chat.save();
//         console.log('Chat updated with last message');

//         console.log('=== SEND MESSAGE SUCCESS ===');

//         res.status(201).json({
//             success: true,
//             message: message
//         });

//     } catch (error) {
//         console.error('=== SEND MESSAGE ERROR ===');
//         console.error('Error:', error);
//         console.error('Stack:', error.stack);

//         res.status(500).json({
//             success: false,
//             message: error.message,
//             details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//         });
//     }
// };

// // Get all messages for a chat
// const allMessages = async (req, res) => {
//     try {
//         const { chatId } = req.params;

//         const messages = await Message.find({ chat: chatId })
//             .populate('sender', 'name email profilePic')
//             .populate('chat')
//             .populate('readBy', 'name email profilePic')
//             .sort({ createdAt: 1 });

//         res.json({
//             success: true,
//             messages: messages
//         });
//     } catch (error) {
//         console.error('Get messages error:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// // Mark message as read
// const markAsRead = async (req, res) => {
//     try {
//         const { messageId } = req.params;

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }

//         // Check if user is in the chat
//         const chat = await Chat.findById(message.chat);
//         if (!chat.participants.includes(req.user._id)) {
//             return res.status(403).json({ message: 'Not authorized' });
//         }

//         // Add user to readBy if not already
//         if (!message.readBy.includes(req.user._id)) {
//             message.readBy.push(req.user._id);
//             await message.save();
//         }

//         const updatedMessage = await Message.findById(messageId)
//             .populate('sender', 'name email profilePic')
//             .populate('readBy', 'name email profilePic');

//         res.json({
//             success: true,
//             message: updatedMessage
//         });
//     } catch (error) {
//         console.error('Mark as read error:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// // Delete a message (for me or for everyone)
// const deleteMessage = async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const { deleteForEveryone } = req.body;

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ message: 'Message not found' });
//         }

//         // Check if user is the sender
//         if (message.sender.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: 'Only sender can delete the message' });
//         }

//         if (deleteForEveryone) {
//             // Delete for everyone
//             await Message.findByIdAndDelete(messageId);

//             // Update chat's last message if needed
//             const chat = await Chat.findById(message.chat);
//             if (chat.lastMessage && chat.lastMessage.toString() === messageId) {
//                 const lastMessage = await Message.findOne({ chat: message.chat })
//                     .sort({ createdAt: -1 });
//                 chat.lastMessage = lastMessage ? lastMessage._id : null;
//                 await chat.save();
//             }
//         } else {
//             // Delete only for me (soft delete)
//             if (!message.deletedFor.includes(req.user._id)) {
//                 message.deletedFor.push(req.user._id);
//                 await message.save();
//             }
//         }

//         res.json({
//             success: true,
//             message: 'Message deleted successfully'
//         });
//     } catch (error) {
//         console.error('Delete message error:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// // Send image in chat
// const sendImage = async (req, res) => {
//     try {
//         const { chatId } = req.body;
//         const image = req.file;

//         if (!chatId || !image) {
//             return res.status(400).json({ message: 'Chat ID and image are required' });
//         }

//         // Check if chat exists and user is participant
//         const chat = await Chat.findById(chatId);
//         if (!chat) {
//             return res.status(404).json({ message: 'Chat not found' });
//         }

//         if (!chat.participants.includes(req.user._id)) {
//             return res.status(403).json({ message: 'Not authorized to send message in this chat' });
//         }

//         // Create message with image
//         const messageData = {
//             sender: req.user._id,
//             chat: chatId,
//             image: `/uploads/messages/${image.filename}`,
//             readBy: [req.user._id]
//         };

//         let message = await Message.create(messageData);

//         message = await Message.findById(message._id)
//             .populate('sender', 'name email profilePic')
//             .populate('chat')
//             .populate('readBy', 'name email profilePic');

//         // Update last message in chat
//         chat.lastMessage = message._id;
//         await chat.save();

//         res.status(201).json({
//             success: true,
//             message: message
//         });
//     } catch (error) {
//         console.error('Send image error:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// module.exports = {
//     sendMessage,
//     allMessages,
//     markAsRead,
//     deleteMessage,
//     sendImage
// };

const Message = require('../models/Message');
const Chat = require('../models/Chat');
// const { io } = require('../server');
const { getIO } = require("../socket");



// Send a message
const sendMessage = async (req, res) => {
    try {
        console.log('=== SEND MESSAGE START ===');
        console.log('Request body:', req.body);
        console.log('User ID:', req.user._id);

        const { content, chatId } = req.body;

        // Validation
        if (!chatId) {
            console.log('ERROR: No chatId');
            return res.status(400).json({
                success: false,
                message: 'Chat ID is required'
            });
        }

        if (!content || content.trim() === '') {
            console.log('ERROR: No content');
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Check if chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            console.log('ERROR: Chat not found:', chatId);
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        console.log('Chat found:', {
            id: chat._id,
            participants: chat.participants,
            lastMessage: chat.lastMessage
        });

        // Check if user is participant
        const isParticipant = chat.participants.some(
            participant => participant.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            console.log('ERROR: User not a participant');
            console.log('User ID:', req.user._id);
            console.log('Participants:', chat.participants);
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send message in this chat'
            });
        }

        // Create message
        const messageData = {
            sender: req.user._id,
            chat: chatId,
            content: content.trim(),
            readBy: [req.user._id]
        };

        console.log('Creating message:', messageData);

        let message = await Message.create(messageData);
        console.log('Message created:', message._id);

        // Populate sender info
        message = await Message.findById(message._id)
            .populate('sender', 'name email profilePic');

        // Update last message in chat
        chat.lastMessage = message._id;
        await chat.save();
        console.log('Chat updated with last message');

        console.log('=== SEND MESSAGE SUCCESS ===');

        // Emit to chat room
        // Emit to chat room (REAL-TIME)
        const io = getIO();

        io.to(chat._id.toString()).emit("messageReceived", {
            ...message.toObject(),
            chat: chat._id.toString()
        });


        res.status(201).json({
            success: true,
            message: message
        });


    } catch (error) {
        console.error('=== SEND MESSAGE ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all messages for a chat
const allMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        console.log('Getting messages for chat:', chatId);

        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'name email profilePic')
            .sort({ createdAt: 1 });

        console.log(`Found ${messages.length} messages`);

        res.json({
            success: true,
            messages: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark message as read
const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Add user to readBy if not already
        if (!message.readBy.includes(req.user._id)) {
            message.readBy.push(req.user._id);
            await message.save();
        }

        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is the sender
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only sender can delete the message'
            });
        }

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        // Update chat's last message if needed
        const chat = await Chat.findById(message.chat);
        if (chat.lastMessage && chat.lastMessage.toString() === messageId) {
            const lastMessage = await Message.findOne({ chat: message.chat })
                .sort({ createdAt: -1 });
            chat.lastMessage = lastMessage ? lastMessage._id : null;
            await chat.save();
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    sendMessage,
    allMessages,
    markAsRead,
    deleteMessage
};