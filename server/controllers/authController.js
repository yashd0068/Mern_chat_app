const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });
};

// Register user
const register = async (name, email, password) => {
    try {
        setError(null);

        // ADD DEBUG LOGS
        console.log('🔍 API_URL:', API_URL);
        console.log('🔍 Full URL:', `${API_URL}/auth/register`);
        console.log('🔍 Request data:', { name, email, password });

        const { data } = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Registration response:', data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return { success: true, data };
    } catch (err) {
        console.error('❌ Registration error:', {
            message: err.message,
            url: err.config?.url,
            status: err.response?.status,
            data: err.response?.data,
            headers: err.response?.headers
        });
        const message = err.response?.data?.message || 'Registration failed';
        setError(message);
        return { success: false, message };
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update online status
        user.online = true;
        user.lastSeen = Date.now();
        await user.save();

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
                followers: user.followers,
                following: user.following,
                online: user.online,
                lastSeen: user.lastSeen
            },
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
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