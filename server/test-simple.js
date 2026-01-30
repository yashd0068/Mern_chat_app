const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    console.log('Starting simple test...');

    try {
        // Connect without User model first
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('✅ MongoDB connected');

        // Drop existing User model if exists
        delete mongoose.connection.models.User;

        // Define a SIMPLE User schema directly
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String
        });

        // Simple pre-save hook without next
        userSchema.pre('save', async function () {
            console.log('Pre-save hook called');
            if (this.isModified('password')) {
                // Simulate hashing
                this.password = 'hashed_' + this.password;
            }
        });

        const SimpleUser = mongoose.model('SimpleUser', userSchema);

        // Test creating a user
        const user = new SimpleUser({
            name: 'Test Simple',
            email: 'simple@test.com',
            password: '123456'
        });

        console.log('Saving user...');
        await user.save();
        console.log('✅ User saved successfully!');
        console.log('Password:', user.password);

        await mongoose.disconnect();
        console.log('✅ Test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

test();