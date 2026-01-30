const mongoose = require('mongoose');
require('dotenv').config();

async function testModel() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('✅ MongoDB connected');

        // Try to create a user directly
        const User = require('./models/User');

        const testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: '123456'
        });

        await testUser.save();
        console.log('✅ User created successfully:', testUser._id);

        await mongoose.disconnect();
        console.log('✅ Test completed');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testModel();