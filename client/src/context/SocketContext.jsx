// // SocketContext.jsx
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import { useAuth } from './AuthContext';
// import { useChat } from './ChatContext';

// const SocketContext = createContext();

// export const useSocket = () => {
//     const context = useContext(SocketContext);
//     if (!context) {
//         throw new Error('useSocket must be used within SocketProvider');
//     }
//     return context;
// };

// export const SocketProvider = ({ children }) => {
//     const [socket, setSocket] = useState(null);
//     const [typingUsers, setTypingUsers] = useState({}); // Track typing users by chatId
//     const { user } = useAuth();
//     const { selectedChat, messages, setMessages, setChats, chats } = useChat();
//     // SocketContext.jsx - Update the useEffect for socket
//     useEffect(() => {
//         if (!user) return;

//         const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
//             auth: {
//                 token: user.token
//             },
//             withCredentials: true,
//             transports: ['websocket', 'polling'],
//             reconnection: true,
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000
//         });

//         setSocket(newSocket);

//         // Connection events
//         newSocket.on('connect', () => {
//             console.log('Socket connected:', newSocket.id);
//             // Join user's personal room
//             newSocket.emit('join', user._id);
//             newSocket.emit('userOnline', user._id);

//             // Join current chat room if exists
//             if (selectedChat?._id) {
//                 newSocket.emit('joinChat', selectedChat._id);
//             }
//         });

//         // Listen for incoming messages
//         newSocket.on('messageReceived', (newMessage) => {
//             console.log('Real-time message received:', newMessage);
//             console.log('Current chat ID:', selectedChat?._id);
//             console.log('Message chat ID:', newMessage.chat);

//             // Update messages if we're in the same chat
//             if (selectedChat?._id === newMessage.chat) {
//                 console.log('Updating messages for current chat');
//                 setMessages(prev => {
//                     // Check for duplicates by ID
//                     const isDuplicate = prev.some(msg =>
//                         msg._id === newMessage._id ||
//                         (msg.tempId && msg.tempId === newMessage.tempId)
//                     );

//                     if (isDuplicate) {
//                         console.log('Duplicate message detected, skipping');
//                         return prev;
//                     }

//                     console.log('Adding new message to state');
//                     // Replace temp message if exists, otherwise add new
//                     if (newMessage.tempId) {
//                         return prev.map(msg =>
//                             msg.tempId === newMessage.tempId ? newMessage : msg
//                         );
//                     }

//                     return [...prev, newMessage];
//                 });
//             } else {
//                 console.log('Message for different chat');
//             }

//             // Update chat list with last message and move to top
//             setChats(prev => {
//                 const updatedChats = prev.map(chat =>
//                     chat._id === newMessage.chat
//                         ? {
//                             ...chat,
//                             lastMessage: newMessage,
//                             updatedAt: new Date().toISOString()
//                         }
//                         : chat
//                 );

//                 // Move the chat to top
//                 const chatIndex = updatedChats.findIndex(c => c._id === newMessage.chat);
//                 if (chatIndex > 0) {
//                     const [chat] = updatedChats.splice(chatIndex, 1);
//                     updatedChats.unshift(chat);
//                 }

//                 return updatedChats;
//             });
//         });

//         // Join chat room when selected chat changes
//         const handleJoinChat = (chatId) => {
//             if (newSocket && newSocket.connected && chatId) {
//                 console.log('Joining chat room:', chatId);
//                 newSocket.emit('joinChat', chatId);
//             }
//         };

//         // Listen for user status updates
//         newSocket.on('userStatus', ({ userId, status }) => {
//             console.log(`User ${userId} is now ${status}`);
//             setChats(prev => prev.map(chat => ({
//                 ...chat,
//                 participants: chat.participants?.map(participant =>
//                     participant._id === userId
//                         ? { ...participant, online: status === 'online' }
//                         : participant
//                 )
//             })));
//         });

//         // Listen for typing indicators
//         newSocket.on('typing', ({ chatId, userId }) => {
//             console.log(`User ${userId} is typing in chat ${chatId}`);
//             setTypingUsers(prev => ({
//                 ...prev,
//                 [chatId]: [...(prev[chatId] || []).filter(id => id !== userId), userId]
//             }));
//         });

//         newSocket.on('stopTyping', ({ chatId, userId }) => {
//             console.log(`User ${userId} stopped typing in chat ${chatId}`);
//             setTypingUsers(prev => ({
//                 ...prev,
//                 [chatId]: (prev[chatId] || []).filter(id => id !== userId)
//             }));
//         });

//         // Listen for message deletion
//         newSocket.on('messageDeleted', ({ messageId, chatId, deleteForEveryone }) => {
//             console.log('Message deleted:', messageId);
//             if (selectedChat?._id === chatId) {
//                 setMessages(prev => prev.filter(msg => msg._id !== messageId));
//             }

//             setChats(prev => prev.map(chat => {
//                 if (chat._id === chatId && chat.lastMessage?._id === messageId) {
//                     const remainingMessages = messages.filter(msg => msg._id !== messageId);
//                     const newLastMessage = remainingMessages[remainingMessages.length - 1];
//                     return { ...chat, lastMessage: newLastMessage };
//                 }
//                 return chat;
//             }));
//         });

//         // Handle connection errors
//         newSocket.on('connect_error', (error) => {
//             console.error('Socket connection error:', error);
//         });

//         newSocket.on('disconnect', (reason) => {
//             console.log('Socket disconnected:', reason);
//         });

//         // Join current chat room on mount
//         if (selectedChat?._id && newSocket.connected) {
//             handleJoinChat(selectedChat._id);
//         }

//         // Cleanup
//         return () => {
//             if (newSocket) {
//                 newSocket.off('connect');
//                 newSocket.off('messageReceived');
//                 newSocket.off('userStatus');
//                 newSocket.off('typing');
//                 newSocket.off('stopTyping');
//                 newSocket.off('messageDeleted');
//                 newSocket.off('connect_error');
//                 newSocket.off('disconnect');
//                 newSocket.disconnect();
//             }
//         };
//     }, [user, selectedChat?._id]); // FIXED: Changed to selectedChat?._id

//     // Send typing indicator
//     const sendTyping = (chatId) => {
//         if (socket && user && socket.connected) {
//             socket.emit('typing', { chatId, userId: user._id });
//         }
//     };

//     // Send stop typing
//     const sendStopTyping = (chatId) => {
//         if (socket && user && socket.connected) {
//             socket.emit('stopTyping', { chatId, userId: user._id });
//         }
//     };

//     // Send new message via socket
//     const sendMessageViaSocket = (message) => {
//         if (socket && socket.connected) {
//             socket.emit('newMessage', message);
//         }
//     };

//     // Mark user as online
//     const markUserOnline = () => {
//         if (socket && user && socket.connected) {
//             socket.emit('userOnline', user._id);
//         }
//     };

//     // Mark user as offline
//     const markUserOffline = () => {
//         if (socket && user && socket.connected) {
//             socket.emit('userOffline', user._id);
//         }
//     };

//     // Delete message via socket
//     const deleteMessageViaSocket = (messageId, chatId, deleteForEveryone = false) => {
//         if (socket && socket.connected) {
//             socket.emit('deleteMessage', { messageId, chatId, deleteForEveryone });
//         }
//     };

//     const value = {
//         socket,
//         typingUsers,
//         sendTyping,
//         sendStopTyping,
//         sendMessage: sendMessageViaSocket,
//         deleteMessage: deleteMessageViaSocket,
//         markUserOnline,
//         markUserOffline
//     };

//     return (
//         <SocketContext.Provider value={value}>
//             {children}
//         </SocketContext.Provider>
//     );
// };

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

        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
            auth: {
                token: user.token
            },
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

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