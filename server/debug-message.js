const mongoose = require('mongoose');
require('dotenv').config();

async function debugMessage() {
    console.log('=== DEBUGGING MESSAGES ===\n');

    try {
        // Connect
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('1. MongoDB connected\n');

        // Load models
        const Chat = require('./models/Chat');
        const Message = require('./models/Message');
        const User = require('./models/User');

        console.log('2. Models loaded\n');

        // Check if there are any chats
        const chats = await Chat.find({});
        console.log(`3. Total chats: ${chats.length}`);

        if (chats.length > 0) {
            const chat = chats[0];
            console.log('First chat:', {
                id: chat._id,
                participants: chat.participants,
                lastMessage: chat.lastMessage
            });

            // Check messages in this chat
            const messages = await Message.find({ chat: chat._id });
            console.log(`Messages in this chat: ${messages.length}\n`);
        } else {
            console.log('No chats found. You need to create a chat first.\n');
        }

        // Test creating a chat
        console.log('4. Testing chat creation...');
        const users = await User.find().limit(2);

        if (users.length >= 2) {
            const testChat = await Chat.create({
                participants: [users[0]._id, users[1]._id],
                isGroupChat: false
            });
            console.log(`Test chat created: ${testChat._id}\n`);

            // Test sending a message
            console.log('5. Testing message creation...');
            const testMessage = await Message.create({
                sender: users[0]._id,
                chat: testChat._id,
                content: 'Test debug message',
                readBy: [users[0]._id]
            });
            console.log(`Test message created: ${testMessage._id}\n`);

            // Clean up
            await Message.deleteOne({ _id: testMessage._id });
            await Chat.deleteOne({ _id: testChat._id });
            console.log('6. Test data cleaned\n');
        } else {
            console.log('Need at least 2 users to test.\n');
        }

        await mongoose.disconnect();
        console.log('7. Debug complete!');

    } catch (error) {
        console.error('\n❌ DEBUG FAILED:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

debugMessage();