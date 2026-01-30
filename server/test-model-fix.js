const mongoose = require('mongoose');
require('dotenv').config();

async function testUserModel() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('✅ MongoDB connected');

        // Import User model
        const User = require('./models/User');

        // Test creating a user
        const testUser = new User({
            name: 'Test User Fix',
            email: 'testfix@example.com',
            password: 'Yash@1972@'
        });

        console.log('Creating user...');
        await testUser.save();
        console.log('✅ User created successfully! ID:', testUser._id);
        console.log('✅ Password hashed:', testUser.password.length > 20);

        // Test password comparison
        const isMatch = await testUser.comparePassword('Yash@1972@');
        console.log('✅ Password comparison works:', isMatch);

        // Clean up
        await User.deleteOne({ email: 'testfix@example.com' });
        console.log('✅ Test user cleaned up');

        await mongoose.disconnect();
        console.log('✅ All tests passed!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testUserModel();