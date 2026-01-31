import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Image as ImageIcon, Smile, Paperclip, X, MoreVertical, Trash2, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';

const ChatWindow = ({ chat, onBack }) => {
    // ALL HOOKS AT TOP - NEVER PUT RETURNS BEFORE THESE
    const { user: authUser, loading: authLoading } = useAuth();
    const { messages, sendMessage, deleteMessage, fetchMessages, setMessages } = useChat();
    const { socket, typingUsers, sendTyping, sendStopTyping, sendMessage: sendSocketMessage } = useSocket();

    // State hooks
    const [newMessage, setNewMessage] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [localTyping, setLocalTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [showDeleteMenu, setShowDeleteMenu] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // User state
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    // Get user from auth or localStorage
    useEffect(() => {
        if (authUser) {
            console.log('✅ Got user from AuthContext');
            setUser(authUser);
            setUserLoading(false);
        } else {
            const savedUser = localStorage.getItem('userInfo');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    console.log('📦 Got user from localStorage');
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Error parsing user:', error);
                }
            }
            setUserLoading(false);
        }
    }, [authUser]);

    // Get typing users
    const chatTypingUsers = typingUsers[chat?._id] || [];
    const otherTypingUsers = chatTypingUsers.filter(id => id !== user?._id);
    const isOtherUserTyping = otherTypingUsers.length > 0;

    // Fetch messages
    useEffect(() => {
        if (chat && user) {
            fetchMessages(chat._id);
        }
    }, [chat?._id, user, fetchMessages]);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Socket listener
    useEffect(() => {
        if (!socket || !chat || !user) return;

        console.log('Setting up socket listener');

        const handleNewMessage = (newMessageData) => {
            const incomingChatId = typeof newMessageData.chat === 'object'
                ? newMessageData.chat._id
                : newMessageData.chat;

            if (incomingChatId === chat._id) {
                setMessages(prev => {
                    const existsById = prev.some(msg => msg._id === newMessageData._id);
                    const existsByTempId = prev.some(msg =>
                        msg.tempId && msg.tempId === newMessageData.tempId
                    );

                    if (existsById || existsByTempId) {
                        return prev;
                    }

                    if (newMessageData.tempId) {
                        const updated = prev.map(msg =>
                            msg.tempId === newMessageData.tempId ? newMessageData : msg
                        );
                        if (updated.length === prev.length && !prev.some(msg => msg.tempId === newMessageData.tempId)) {
                            return [...prev, newMessageData];
                        }
                        return updated;
                    }

                    return [...prev, newMessageData];
                });
            }
        };

        socket.emit('joinChat', chat._id);
        socket.on('messageReceived', handleNewMessage);

        return () => {
            socket.off('messageReceived', handleNewMessage);
            if (socket.connected) {
                socket.emit('leaveChat', chat._id);
            }
        };
    }, [socket, chat, user, setMessages]);

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !chat || sendingMessage || !user) return;

        try {
            setSendingMessage(true);
            const tempId = `temp-${Date.now()}`;

            const tempMessage = {
                _id: tempId,
                tempId: tempId,
                content: newMessage.trim(),
                sender: {
                    _id: user._id,
                    name: user.name
                },
                chat: chat._id,
                createdAt: new Date().toISOString(),
                isSending: true
            };

            setMessages(prev => [...prev, tempMessage]);
            const message = await sendMessage(newMessage.trim(), chat._id);

            setMessages(prev => {
                const updatedMessages = prev.map(msg => {
                    if (msg.tempId === tempId) {
                        return {
                            ...message,
                            tempId: tempId,
                            _id: message._id
                        };
                    }
                    return msg;
                });

                const uniqueMessages = [];
                const seenIds = new Set();
                updatedMessages.forEach(msg => {
                    const id = msg._id || msg.tempId;
                    if (!seenIds.has(id)) {
                        seenIds.add(id);
                        uniqueMessages.push(msg);
                    }
                });

                return uniqueMessages;
            });

            setNewMessage('');
            sendStopTyping(chat._id);
            setLocalTyping(false);
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                setTypingTimeout(null);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            alert(error.message || 'Failed to send message');
            setMessages(prev => prev.filter(msg => !msg.tempId || !msg.tempId.includes('temp-')));
        } finally {
            setSendingMessage(false);
        }
    };

    const handleTyping = () => {
        if (!chat || !user) return;

        if (!localTyping) {
            sendTyping(chat._id);
            setLocalTyping(true);
        }

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            sendStopTyping(chat._id);
            setLocalTyping(false);
        }, 2000);

        setTypingTimeout(timeout);
    };

    const handleDeleteMessage = async (messageId, deleteForEveryone = false) => {
        const action = deleteForEveryone ? 'delete for everyone' : 'delete for me';
        if (window.confirm(`Are you sure you want to ${action}?`)) {
            try {
                await deleteMessage(messageId, deleteForEveryone);
                setShowDeleteMenu(null);
            } catch (error) {
                console.error('Error deleting message:', error);
                alert(error.message || 'Failed to delete message');
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDeleteMenu && !event.target.closest('.message-actions')) {
                setShowDeleteMenu(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showDeleteMenu]);

    const formatMessageTime = (date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
    };

    const formatDateHeader = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDate = new Date(date);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const groupMessagesByDate = () => {
        const groups = {};
        const seenMessages = new Map();
        const uniqueMessages = [];

        messages.forEach(message => {
            const id = message._id || message.tempId;
            if (!seenMessages.has(id)) {
                seenMessages.set(id, true);
                uniqueMessages.push(message);
            }
        });

        uniqueMessages.forEach(message => {
            const date = new Date(message.createdAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });

        return groups;
    };

    const getMessageStatus = (message) => {
        if (message.isSending) {
            return (
                <div className="flex items-center ml-1">
                    <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-150"></div>
                        <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            );
        }

        if (message.readBy && message.readBy.some(reader => reader._id !== user?._id)) {
            return <CheckCheck className="w-3 h-3 ml-1 text-blue-400" />;
        } else if (message.delivered) {
            return <CheckCheck className="w-3 h-3 ml-1 text-gray-400" />;
        } else {
            return <Check className="w-3 h-3 ml-1 text-gray-400" />;
        }
    };

    const getMessageKey = (message) => {
        return message._id || message.tempId;
    };

    // ✅ ONLY NOW CHECK LOADING - AFTER ALL HOOKS
    if (authLoading || userLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading user data...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold dark:text-white mb-2">User Not Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Please login again</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                        <Send className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold dark:text-white mb-2">Welcome to ChatApp</h3>
                    <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    // ✅ NOW RENDER THE CHAT
    const otherUser = chat.participants?.find(p => p._id !== user._id);
    const groupedMessages = groupMessagesByDate();

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full">
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center">
                    {onBack && (
                        <button onClick={onBack} className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden">
                            <svg className="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {chat.isGroupChat ? 'G' : otherUser?.name?.[0]?.toUpperCase()}
                        </div>
                        {!chat.isGroupChat && otherUser?.online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                    </div>
                    <div className="ml-3">
                        <h2 className="font-semibold dark:text-white text-sm">
                            {chat.isGroupChat ? chat.chatName : otherUser?.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isOtherUserTyping ? (
                                <span className="text-blue-500 dark:text-blue-400 animate-pulse">typing...</span>
                            ) : (
                                otherUser?.online ? 'online' : 'last seen recently'
                            )}
                        </p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreVertical className="w-5 h-5 dark:text-white" />
                </button>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date} className="space-y-1">
                        <div className="flex justify-center my-4">
                            <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                                {formatDateHeader(date)}
                            </div>
                        </div>

                        {dateMessages.map((message) => {
                            // ✅ FIX: Check if message sender is current user
                            const senderId = message.sender?._id || message.sender;
                            const isOwnMessage = String(senderId) === String(user._id);
                            const showAvatar = !isOwnMessage;

                            return (
                                <div key={getMessageKey(message)} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group relative`}>
                                    {showAvatar && (
                                        <div className="flex-shrink-0 mr-2 self-end">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold text-xs">
                                                {message.sender?.name?.[0]?.toUpperCase()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative max-w-[75%] min-w-[120px]">
                                        {!isOwnMessage && chat.isGroupChat && (
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2 mb-1">
                                                {message.sender?.name}
                                            </p>
                                        )}

                                        <div className={`rounded-2xl px-3 py-2 ${isOwnMessage
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none'
                                            : 'bg-gray-100 dark:bg-gray-800 dark:text-white rounded-tl-none'
                                            }`}>
                                            {message.image && (
                                                <div className="mb-2">
                                                    <img src={message.image} alt="Shared" className="rounded-lg max-w-full h-auto max-h-64 object-cover" />
                                                </div>
                                            )}
                                            {message.content && (
                                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                                    {message.content}
                                                </p>
                                            )}
                                            <div className={`text-xs mt-1 flex items-center justify-end space-x-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                                <span>{formatMessageTime(message.createdAt)}</span>
                                                {isOwnMessage && getMessageStatus(message)}
                                            </div>
                                        </div>

                                        {isOwnMessage && !message.isSending && (
                                            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity message-actions">
                                                <button onClick={() => setShowDeleteMenu(showDeleteMenu === message._id ? null : message._id)} className="bg-gray-800 dark:bg-gray-700 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-900" title="Delete message">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                                {showDeleteMenu === message._id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-20">
                                                        <button onClick={() => handleDeleteMessage(message._id, false)} className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-700">
                                                            Delete for me
                                                        </button>
                                                        <button onClick={() => handleDeleteMessage(message._id, true)} className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            Delete for everyone
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isOwnMessage && (
                                        <div className="flex-shrink-0 ml-2 self-end">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                                                {user?.name?.[0]?.toUpperCase()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
                <div className="flex items-end space-x-2">
                    <div className="flex space-x-1">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-gray-100" disabled={sendingMessage}>
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-gray-100" disabled={sendingMessage}>
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 relative bg-gray-100 dark:bg-gray-800 rounded-full">
                        <textarea
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                            }}
                            onBlur={() => {
                                sendStopTyping(chat._id);
                                setLocalTyping(false);
                                if (typingTimeout) clearTimeout(typingTimeout);
                            }}
                            placeholder="Message"
                            className="w-full p-3 pr-12 bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white resize-none max-h-32 min-h-[44px] text-sm"
                            rows="1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            disabled={sendingMessage}
                        />
                        <button type="button" className="absolute right-3 bottom-3 p-1 text-gray-500 hover:text-blue-500" disabled={sendingMessage}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        </button>
                    </div>

                    {newMessage.trim() && (
                        <button type="submit" disabled={sendingMessage} className={`p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 shadow-lg ${sendingMessage ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {sendingMessage ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
            </form>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                }
            }} disabled={sendingMessage} />
        </div>
    );
};

export default ChatWindow;