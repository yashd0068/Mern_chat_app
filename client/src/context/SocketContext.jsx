
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
    const { user } = useAuth();
    const [chats, setChats] = useState([]); // Add local state for chats

    useEffect(() => {
        if (!user) return;
        const newSocket = io(
            import.meta.env.VITE_API_URL || 'http://localhost:5000',
            {
                auth: {
                    token: user.token
                },
                withCredentials: true,
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            }
        );


        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            // Join user's personal room
            newSocket.emit('join', user._id);
            newSocket.emit('userOnline', user._id);
        });

        // Listen for incoming messages
        newSocket.on('messageReceived', (newMessage) => {
            console.log('Real-time message received:', newMessage);

            // Emit custom event for ChatContext to handle
            const event = new CustomEvent('socketMessageReceived', {
                detail: { message: newMessage }
            });
            window.dispatchEvent(event);
        });

        // Listen for user status updates
        newSocket.on('userStatus', ({ userId, status }) => {
            console.log(`User ${userId} is now ${status}`);

            // Emit custom event for ChatContext to handle
            const event = new CustomEvent('socketUserStatus', {
                detail: { userId, status }
            });
            window.dispatchEvent(event);
        });

        // Listen for typing indicators
        newSocket.on('typing', ({ chatId, userId }) => {
            console.log(`User ${userId} is typing in chat ${chatId}`);
            setTypingUsers(prev => ({
                ...prev,
                [chatId]: [...(prev[chatId] || []).filter(id => id !== userId), userId]
            }));
        });

        newSocket.on('stopTyping', ({ chatId, userId }) => {
            console.log(`User ${userId} stopped typing in chat ${chatId}`);
            setTypingUsers(prev => ({
                ...prev,
                [chatId]: (prev[chatId] || []).filter(id => id !== userId)
            }));
        });

        // Handle connection errors
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        // Cleanup function
        return () => {
            if (newSocket) {
                newSocket.off('connect');
                newSocket.off('messageReceived');
                newSocket.off('userStatus');
                newSocket.off('typing');
                newSocket.off('stopTyping');
                newSocket.off('connect_error');
                newSocket.off('disconnect');
                newSocket.disconnect();
            }
        };
    }, [user]);

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
        sendTyping,
        sendStopTyping,
        sendMessage
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};