const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

// SIMPLE TEST VERSION - No complex logic
const register = async (req, res) => {
    console.log('Register called with:', req.body);

    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create user directly
        const user = new User({
            name,
            email,
            password
        });

        await user.save();
        console.log('User saved successfully:', user._id);

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic
            },
            token: token
        });

    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        res.json({
            success: true,
            message: 'Login endpoint'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out'
    });
};

module.exports = { register, login, logout };