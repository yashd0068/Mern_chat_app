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

// 🔹 Initialize socket.io
initSocket(server);

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedOrigins = [
    "https://mern-chat-app-ashen.vercel.app",  // Your Vercel domain
    "http://localhost:5173",                    // Local dev
    process.env.CLIENT_URL                      // Optional: from env variable
];

// Middleware
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add this after CORS middleware
app.use((req, res, next) => {
    console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', req.headers);
    if (req.body) {
        console.log('Body:', req.body);
    }
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running!',
        endpoints: {
            register: 'POST /api/auth/register',
            test: 'GET /api/test'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API test endpoint is working!' });
});

// Temporary simple register endpoint
app.post('/api/auth/register', (req, res) => {
    console.log('📝 Register endpoint called with:', req.body);

    // Simple response
    res.json({
        success: true,
        message: 'Registration successful!',
        user: {
            _id: 'user_' + Date.now(),
            name: req.body.name,
            email: req.body.email,
            token: 'jwt_token_' + Date.now()
        }
    });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add this before your routes
app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({
            count: users.length,
            users: users.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                createdAt: u.createdAt,
                updatedAt: u.updatedAt
            }))
        });
    } catch (error) {
        res.json({
            error: error.message,
            message: 'Make sure User model is imported correctly'
        });
    }
});

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

// Global error handler (KEEP AT END)
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB error:", err));

// 🔹 Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
