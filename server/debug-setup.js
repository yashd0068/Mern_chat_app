const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();

async function debugSetup() {
    console.log('=== DEBUGGING SETUP ===\n');

    try {
        // 1. Test MongoDB connection
        console.log('1. Testing MongoDB connection...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('   ✅ MongoDB connected\n');

        // 2. Test User model
        console.log('2. Testing User model...');
        const User = require('./models/User');
        console.log('   ✅ User model loaded\n');

        // 3. Test registration via direct call
        console.log('3. Testing registration directly...');
        const testData = {
            name: 'Debug Test',
            email: 'debug@test.com',
            password: 'Debug123!'
        };

        // Clear any existing test user
        await User.deleteOne({ email: testData.email });

        // Create user
        const user = new User(testData);
        await user.save();
        console.log('   ✅ Direct registration successful\n');

        // 4. Test controller function
        console.log('4. Testing authController...');
        const authController = require('./controllers/authController');

        // Mock req and res objects
        const mockReq = {
            body: {
                name: 'Controller Test',
                email: 'controller@test.com',
                password: 'Controller123!'
            }
        };

        const mockRes = {
            statusCode: 200,
            jsonData: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.jsonData = data;
                console.log('   Controller response:', data);
                return this;
            }
        };

        // Clear existing user
        await User.deleteOne({ email: mockReq.body.email });

        // Call register function
        await authController.register(mockReq, mockRes);
        console.log('   ✅ Controller test complete\n');

        // 5. Clean up
        console.log('5. Cleaning up...');
        await User.deleteMany({
            email: { $in: ['debug@test.com', 'controller@test.com'] }
        });
        console.log('   ✅ Cleanup done\n');

        await mongoose.disconnect();
        console.log('6. All debug tests passed! ✅');

    } catch (error) {
        console.error('\n❌ DEBUG FAILED:', error.message);
        console.error('Error at:', error.stack);
        process.exit(1);
    }
}

debugSetup();