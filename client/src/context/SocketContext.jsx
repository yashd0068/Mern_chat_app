// SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});
    const [isConnected, setIsConnected] = useState(false); // Add this
    const { user } = useAuth();

    // Get Socket URL
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    console.log('🔌 Socket URL:', SOCKET_URL);

    useEffect(() => {
        if (!user) return;

        console.log('🔄 Creating new socket connection...');

        const newSocket = io(SOCKET_URL, {
            auth: {
                token: user.token
            },
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000
        });

        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
            // Join user's personal room
            newSocket.emit('join', user._id);
            newSocket.emit('userOnline', user._id);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            setIsConnected(false);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔴 Socket disconnected:', reason);
            setIsConnected(false);
        });

        // Listen for incoming messages
        newSocket.on('messageReceived', (newMessage) => {
            console.log('📨 Real-time message received:', newMessage);
            const event = new CustomEvent('socketMessageReceived', {
                detail: { message: newMessage }
            });
            window.dispatchEvent(event);
        });

        // Listen for user status updates
        newSocket.on('userStatus', ({ userId, status }) => {
            console.log(`👤 User ${userId} is now ${status}`);
            const event = new CustomEvent('socketUserStatus', {
                detail: { userId, status }
            });
            window.dispatchEvent(event);
        });

        // Listen for typing indicators
        newSocket.on('typing', ({ chatId, userId }) => {
            console.log(`✍️ User ${userId} is typing in chat ${chatId}`);
            setTypingUsers(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []).filter(id => id !== userId), userId]
            }));
        });

        newSocket.on('stopTyping', ({ chatId, userId }) => {
            console.log(`⏹️ User ${userId} stopped typing in chat ${chatId}`);
            setTypingUsers(prev => ({
                ...prev,
                [chatId]: (prev[chatId] || []).filter(id => id !== userId)
            }));
        });

        // Cleanup function
        return () => {
            if (newSocket) {
                console.log('🧹 Cleaning up socket connection');
                newSocket.disconnect();
            }
        };
    }, [user, SOCKET_URL]); // ✅ ADD SOCKET_URL HERE!

    // Send typing indicator
    const sendTyping = (chatId) => {
        if (socket && user && socket.connected) {
            socket.emit('typing', { chatId, userId: user._id });
        }
    };

    // Send stop typing
    const sendStopTyping = (chatId) => {
        if (socket && user && socket.connected) {
            socket.emit('stopTyping', { chatId, userId: user._id });
        }
    };

    // Send new message via socket
    const sendMessage = (message) => {
        if (socket && socket.connected) {
            socket.emit('newMessage', message);
        }
    };

    const value = {
        socket,
        typingUsers,
        isConnected, // Export connection status
        sendTyping,
        sendStopTyping,
        sendMessage
    };

    return (
        <SocketContext.Provider value={value}>

            // AuthContext.jsx - Add this inside AuthProvider component:
            console.log('🔧 Auth Context Config:');
            console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
            console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
            console.log('Final API_URL:', API_URL);
            {children}
            {/* Optional: Connection status indicator */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    bottom: 10,
                    right: 10,
                    padding: '5px 10px',
                    borderRadius: '5px',
                    backgroundColor: isConnected ? '#10B981' : '#EF4444',
                    color: 'white',
                    fontSize: '12px',
                    zIndex: 1000,
                    opacity: 0.9
                }}>
                    {isConnected ? '🟢 Socket Connected' : '🔴 Socket Disconnected'}
                </div>
            )}
        </SocketContext.Provider>
    );
};