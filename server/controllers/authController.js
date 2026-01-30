const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

// Register user - SERVER SIDE
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log('🔍 Registration attempt:', { name, email });

        // Check if all fields are provided
        if (!name || !email || !password) {
            console.log('❌ Missing fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields'
            });
        }

        // Check if user exists - CASE INSENSITIVE
        const userExists = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        });

        if (userExists) {
            console.log('❌ User already exists:', userExists.email);
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        console.log('📝 Creating user document...');

        // Create user - METHOD 1: Using User.create()
        const user = await User.create({
            name,
            email: email.toLowerCase(), // Store lowercase
            password
        });

        console.log('✅ User created with ID:', user._id);
        console.log('✅ User email:', user.email);
        console.log('✅ Hashed password exists:', !!user.password);
        console.log('✅ Password length:', user.password?.length);

        // Verify user was saved
        const savedUser = await User.findById(user._id);
        console.log('✅ User verified in DB:', !!savedUser);

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
            message: error.message || 'Registration failed'
        });
    }
};
// Login user - UPDATED WITH DEBUG LOGS
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔑 Login attempt:', { email, password: '***' });

        // Check if email and password are provided
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        console.log('🔍 Searching for user with email:', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found for email:', email);
            console.log('Available emails in DB:', await User.find({}, 'email'));
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('✅ User found:', user.email);
        console.log('🔐 Stored hashed password:', user.password ? 'Exists' : 'Missing');
        console.log('🔐 Input password:', password);

        // Check password
        console.log('🔐 Comparing password...');
        const isPasswordMatch = await user.comparePassword(password);
        console.log('🔐 Password match result:', isPasswordMatch);

        if (!isPasswordMatch) {
            console.log('❌ Password mismatch');
            console.log('User ID:', user._id);
            console.log('Input:', password);
            console.log('Stored hash:', user.password.substring(0, 20) + '...');
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
        console.error('Error stack:', error.stack);
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