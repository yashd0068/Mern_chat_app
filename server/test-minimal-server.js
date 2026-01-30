const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5001; // Different port to avoid conflict

// ONLY essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load User model
const User = require('./models/User');

// Direct route - NO middleware, NO next()
app.post('/test-register', async (req, res) => {
    console.log('Minimal server: Register called');

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields required'
            });
        }

        // Create user directly
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Minimal server: Registration successful',
            userId: user._id
        });

    } catch (error) {
        console.error('Minimal server error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');
        console.log('Minimal server: MongoDB connected');

        app.listen(PORT, () => {
            console.log(`Minimal server running on port ${PORT}`);
            console.log('Test with: curl -X POST http://localhost:5001/test-register -H "Content-Type: application/json" -d \'{"name":"test","email":"test@minimal.com","password":"123456"}\'');
        });
    } catch (error) {
        console.error('Failed to start minimal server:', error);
    }
}

startServer();