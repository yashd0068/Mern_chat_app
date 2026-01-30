const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔹 Import socket initializer
const { initSocket } = require('./socket');
initSocket(server);

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedOrigins = [
    "https://mern-chat-app-ashen.vercel.app",
    "http://localhost:5173",
    process.env.CLIENT_URL
];

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.originalUrl}`);
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Chat App Backend is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            debug: 'GET /api/debug/users'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        serverTime: new Date().toISOString()
    });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
    try {
        const User = require('./models/User');
        const users = await User.find({}).select('-password');
        res.json({
            count: users.length,
            users: users.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                createdAt: u.createdAt,
                updatedAt: u.updatedAt,
                online: u.online,
                lastSeen: u.lastSeen
            }))
        });
    } catch (error) {
        console.error('Debug users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add debug logging before routes
console.log('🔍 Checking route files...');

try {
    const authRoutes = require('./routes/authRoutes');
    console.log('✅ authRoutes loaded');
} catch (error) {
    console.error('❌ authRoutes error:', error.message);
}

try {
    const userRoutes = require('./routes/userRoutes');
    console.log('✅ userRoutes loaded');
} catch (error) {
    console.error('❌ userRoutes error:', error.message);
}

try {
    const chatRoutes = require('./routes/chatRoutes');
    console.log('✅ chatRoutes loaded');
} catch (error) {
    console.error('❌ chatRoutes error:', error.message);
}

try {
    const messageRoutes = require('./routes/messageRoutes');
    console.log('✅ messageRoutes loaded');
} catch (error) {
    console.error('❌ messageRoutes error:', error.message);
}

// Use routes with enhanced logging
app.use('/api/auth', (req, res, next) => {
    console.log(`🔗 Auth route accessed: ${req.method} ${req.originalUrl}`);
    next();
}, authRoutes);

app.use('/api/users', (req, res, next) => {
    console.log(`🔗 Users route accessed: ${req.method} ${req.originalUrl}`);
    next();
}, userRoutes);

app.use('/api/chats', (req, res, next) => {
    console.log(`🔗 Chats route accessed: ${req.method} ${req.originalUrl}`);
    next();
}, chatRoutes);

app.use('/api/messages', (req, res, next) => {
    console.log(`🔗 Messages route accessed: ${req.method} ${req.originalUrl}`);
    next();
}, messageRoutes);

console.log('✅ All routes mounted');
// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// ✅ CORRECT: 404 handler - Simple middleware without '*'
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🔥 Server error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        console.log("✅ Database:", mongoose.connection.name);
    })
    .catch((err) => {
        console.error("❌ MongoDB error:", err);
        process.exit(1);
    });

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 URL: https://mern-chat-app-273c.onrender.com`);
});