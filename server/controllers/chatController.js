const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// Create or access a chat
const accessChat = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if chat already exists between users
        let chat = await Chat.findOne({
            isGroupChat: false,
            participants: { $all: [req.user._id, userId] }
        })
            .populate('participants', '-password')
            .populate('lastMessage');

        if (chat) {
            return res.json({
                success: true,
                chat: chat
            });
        }

        // Create new chat
        const chatData = {
            participants: [req.user._id, userId],
            isGroupChat: false
        };

        const createdChat = await Chat.create(chatData);

        const fullChat = await Chat.findById(createdChat._id)
            .populate('participants', '-password');

        res.status(201).json({
            success: true,
            chat: fullChat
        });
    } catch (error) {
        console.error('Access chat error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all chats for a user
const fetchChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: { $elemMatch: { $eq: req.user._id } }
        })
            .populate('participants', '-password')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            chats: chats
        });
    } catch (error) {
        console.error('Fetch chats error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create group chat
const createGroupChat = async (req, res) => {
    try {
        const { users, name } = req.body;

        if (!users || !name) {
            return res.status(400).json({ message: 'Please fill all the fields' });
        }

        const participants = [...users, req.user._id];

        const groupChat = await Chat.create({
            chatName: name,
            participants: participants,
            isGroupChat: true,
            groupAdmin: req.user._id
        });

        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate('participants', '-password')
            .populate('groupAdmin', '-password');

        res.status(201).json({
            success: true,
            chat: fullGroupChat
        });
    } catch (error) {
        console.error('Create group chat error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Rename group chat
const renameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName: chatName },
            { new: true }
        )
            .populate('participants', '-password')
            .populate('groupAdmin', '-password');

        if (!updatedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.json({
            success: true,
            chat: updatedChat
        });
    } catch (error) {
        console.error('Rename group error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add user to group
const addToGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: 'This is not a group chat' });
        }

        if (chat.participants.includes(userId)) {
            return res.status(400).json({ message: 'User already in group' });
        }

        chat.participants.push(userId);
        await chat.save();

        const updatedChat = await Chat.findById(chatId)
            .populate('participants', '-password')
            .populate('groupAdmin', '-password');

        res.json({
            success: true,
            chat: updatedChat
        });
    } catch (error) {
        console.error('Add to group error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Remove user from group
const removeFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: 'This is not a group chat' });
        }

        if (chat.groupAdmin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only admin can remove users' });
        }

        chat.participants = chat.participants.filter(
            participant => participant.toString() !== userId
        );
        await chat.save();

        const updatedChat = await Chat.findById(chatId)
            .populate('participants', '-password')
            .populate('groupAdmin', '-password');

        res.json({
            success: true,
            chat: updatedChat
        });
    } catch (error) {
        console.error('Remove from group error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete chat
const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is participant
        if (!chat.participants.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this chat' });
        }

        // Delete all messages in the chat first
        await Message.deleteMany({ chat: chatId });

        // Delete the chat
        await Chat.findByIdAndDelete(chatId);

        res.json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    deleteChat
};