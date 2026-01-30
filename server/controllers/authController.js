const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Add this import

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

// Register user - MANUAL PASSWORD HASHING
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log('🔍 Registration attempt:', { name, email });

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({
            email: email.toLowerCase()
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        console.log('🔐 Hashing password...');

        // Hash password manually (NO pre-save hook)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('📝 Creating user...');

        // Create user with already hashed password
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword // Already hashed
        });

        console.log('✅ User created with ID:', user._id);

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio,
                online: user.online,
                lastSeen: user.lastSeen
            },
            token: token
        });
    } catch (error) {
        console.error('🔥 Registration error:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
};

// Login user - MANUAL PASSWORD COMPARISON
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔑 Login attempt:', { email, password: '***' });

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log('❌ User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('✅ User found:', user.email);

        // Compare password manually
        console.log('🔐 Comparing password...');
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log('🔐 Password match result:', isPasswordMatch);

        if (!isPasswordMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update online status
        user.online = true;
        user.lastSeen = Date.now();
        await user.save();
        console.log('✅ Login successful for:', user.email);

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                bio: user.bio,
                online: user.online,
                lastSeen: user.lastSeen
            },
            token: token
        });
    } catch (error) {
        console.error('🔥 Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.online = false;
            user.lastSeen = Date.now();
            await user.save();
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { register, login, logout };