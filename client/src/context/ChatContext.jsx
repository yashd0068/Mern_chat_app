import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleSocketMessage = (event) => {
            const { message } = event.detail;
            console.log('ChatContext received socket message:', message);

            // Update messages if we're in the same chat
            if (selectedChat?._id === message.chat) {
                setMessages(prev => {
                    // Check for duplicates
                    const isDuplicate = prev.some(msg =>
                        msg._id === message._id ||
                        (msg.tempId && msg.tempId === message.tempId)
                    );

                    if (isDuplicate) {
                        console.log('Duplicate message, skipping');
                        return prev;
                    }

                    // Replace temp message if exists
                    if (message.tempId) {
                        return prev.map(msg =>
                            msg.tempId === message.tempId ? message : msg
                        );
                    }

                    return [...prev, message];
                });
            }

            // Update chat list
            setChats(prev => {
                const updatedChats = prev.map(chat =>
                    chat._id === message.chat
                        ? {
                            ...chat,
                            lastMessage: message,
                            updatedAt: new Date().toISOString()
                        }
                        : chat
                );

                // Move the chat to top
                const chatIndex = updatedChats.findIndex(c => c._id === message.chat);
                if (chatIndex > 0) {
                    const [chat] = updatedChats.splice(chatIndex, 1);
                    updatedChats.unshift(chat);
                }

                return updatedChats;
            });
        };

        const handleUserStatus = (event) => {
            const { userId, status } = event.detail;
            console.log(`Updating user status: ${userId} is ${status}`);

            setChats(prev => prev.map(chat => ({
                ...chat,
                participants: chat.participants?.map(participant =>
                    participant._id === userId
                        ? { ...participant, online: status === 'online' }
                        : participant
                )
            })));
        };

        // Add event listeners
        window.addEventListener('socketMessageReceived', handleSocketMessage);
        window.addEventListener('socketUserStatus', handleUserStatus);

        // Cleanup
        return () => {
            window.removeEventListener('socketMessageReceived', handleSocketMessage);
            window.removeEventListener('socketUserStatus', handleUserStatus);
        };
    }, [selectedChat]);


    // Fetch all chats for user
    const fetchChats = async () => {
        if (!user?.token) return;

        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/chats`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setChats(data.chats || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Access or create a chat
    // In ChatContext.jsx
    const accessChat = async (userId) => {
        if (!user?.token) {
            console.error('No user token found');
            throw new Error('User not authenticated');
        }

        try {
            console.log('Accessing chat with user:', userId);

            const { data } = await axios.post(`${API_URL}/chats`, {
                userId
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            console.log('Chat response:', data);

            if (!data.success) {
                throw new Error(data.message || 'Failed to access chat');
            }

            // Check if chat already exists in list
            const existingChat = chats.find(chat => chat._id === data.chat._id);
            if (!existingChat) {
                setChats([data.chat, ...chats]);
            }

            setSelectedChat(data.chat);
            return data.chat;
        } catch (error) {
            console.error('Error accessing chat:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    };

    // Fetch messages for a chat
    const fetchMessages = async (chatId) => {
        if (!user?.token || !chatId) return;

        try {
            const { data } = await axios.get(`${API_URL}/messages/${chatId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Send a message
    // const sendMessage = async (content, chatId, image) => {
    //     if (!user?.token || !chatId) return;

    //     try {
    //         const formData = new FormData();
    //         formData.append('content', content);
    //         formData.append('chatId', chatId);
    //         if (image) {
    //             formData.append('image', image);
    //         }

    //         const config = {
    //             headers: {
    //                 Authorization: `Bearer ${user.token}`,
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         };

    //         const endpoint = image ? `${API_URL}/messages/image` : `${API_URL}/messages`;
    //         const { data } = await axios.post(endpoint, formData, config);

    //         // Update messages list
    //         setMessages(prev => [...prev, data.message]);

    //         // Update chat list with last message
    //         setChats(prev => prev.map(chat =>
    //             chat._id === chatId
    //                 ? { ...chat, lastMessage: data.message }
    //                 : chat
    //         ));

    //         return data.message;
    //     } catch (error) {
    //         console.error('Error sending message:', error);
    //         throw error;
    //     }
    // };

    // In ChatContext.jsx
    // In ChatContext.jsx
    // const sendMessage = async (content, chatId) => {
    //     if (!user?.token || !chatId) {
    //         console.error('Missing token or chatId');
    //         throw new Error('Not authenticated or no chat selected');
    //     }

    //     try {
    //         const { data } = await axios.post(`${API_URL}/messages`, {
    //             content: content,
    //             chatId: chatId
    //         }, {
    //             headers: {
    //                 Authorization: `Bearer ${user.token}`,
    //                 'Content-Type': 'application/json'
    //             }
    //         });

    //         console.log('Message sent response:', data);

    //         if (!data.success) {
    //             throw new Error(data.message || 'Failed to send message');
    //         }

    //         // IMPORTANT: Don't update messages here - let socket handle it
    //         // This prevents duplicate messages

    //         // Only update chats for last message preview
    //         setChats(prev => {
    //             const updatedChats = prev.map(chat =>
    //                 chat._id === chatId
    //                     ? { ...chat, lastMessage: data.message }
    //                     : chat
    //             );

    //             // Move chat to top
    //             const chatIndex = updatedChats.findIndex(c => c._id === chatId);
    //             if (chatIndex > 0) {
    //                 const [chat] = updatedChats.splice(chatIndex, 1);
    //                 updatedChats.unshift(chat);
    //             }

    //             return updatedChats;
    //         });

    //         return data.message;

    //     } catch (error) {
    //         console.error('Error sending message:', error);
    //         console.error('Error response:', error.response?.data);
    //         throw error;
    //     }
    // };
    const sendMessage = async (content, chatId) => {
        if (!user?.token || !chatId) {
            console.error('Missing token or chatId');
            throw new Error('Not authenticated or no chat selected');
        }

        try {
            const { data } = await axios.post(`${API_URL}/messages`, {
                content: content,
                chatId: chatId
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Message sent response:', data);

            if (!data.success) {
                throw new Error(data.message || 'Failed to send message');
            }

            // ✅ REMOVE THIS: Don't update messages here
            // setMessages(prev => [...prev, data.message]);

            // ✅ ONLY update chat list order (keep this)
            setChats(prev => {
                const updatedChats = prev.map(chat =>
                    chat._id === chatId
                        ? { ...chat, lastMessage: data.message }
                        : chat
                );

                // Move chat to top
                const chatIndex = updatedChats.findIndex(c => c._id === chatId);
                if (chatIndex > 0) {
                    const [chat] = updatedChats.splice(chatIndex, 1);
                    updatedChats.unshift(chat);
                }

                return updatedChats;
            });

            // ✅ Return the message (socket will handle UI update)
            return data.message;

        } catch (error) {
            console.error('Error sending message:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    };
    // Delete a message
    const deleteMessage = async (messageId, deleteForEveryone = false) => {
        if (!user?.token) return;

        try {
            const { data } = await axios.delete(`${API_URL}/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
                data: { deleteForEveryone }
            });

            // Remove message from state
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
            return data;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    };

    // Search users
    const searchUsers = async (query) => {
        if (!user?.token) return [];

        try {
            const { data } = await axios.get(`${API_URL}/users/search?q=${query}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            return data.users || [];
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    };

    // Follow/Unfollow user
    const toggleFollow = async (userId) => {
        if (!user?.token) return;

        try {
            const { data } = await axios.put(`${API_URL}/users/follow/${userId}`, {}, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            return data;
        } catch (error) {
            console.error('Error toggling follow:', error);
            throw error;
        }
    };

    // Fetch user profile
    const fetchUserProfile = async (userId) => {
        if (!user?.token) return;

        try {
            const { data } = await axios.get(`${API_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            return data.user;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    };

    // Update profile
    const updateProfile = async (formData) => {
        if (!user?.token) return;

        try {
            const { data } = await axios.put(`${API_URL}/users/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return data.user;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    // Clear selected chat
    const clearSelectedChat = () => {
        setSelectedChat(null);
        setMessages([]);
    };

    useEffect(() => {
        if (user) {
            fetchChats();
        }
    }, [user]);

    const value = {
        chats,
        selectedChat,
        messages,
        loading,
        setSelectedChat,
        fetchChats,
        accessChat,
        fetchMessages,
        sendMessage,
        deleteMessage,
        searchUsers,
        toggleFollow,
        fetchUserProfile,
        updateProfile,
        setMessages,
        clearSelectedChat
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};