import React, { useState, useEffect } from 'react';
import { Search, UserPlus, LogOut, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Link } from 'react-router-dom';

const Sidebar = ({ onSelectChat, selectedChat }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const { user, logout } = useAuth();
    const { chats, loading, searchUsers, accessChat } = useChat();

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const results = await searchUsers(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleUserClick = async (user) => {
        try {
            const chat = await accessChat(user._id);
            onSelectChat(chat);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('Error accessing chat:', error);
        }
    };

    const formatTime = (date) => {
        const messageDate = new Date(date);
        const now = new Date();
        const diffMs = now - messageDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return messageDate.toLocaleDateString([], { weekday: 'short' });
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="w-full md:w-80 border-r dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold dark:text-white">Messages</h1>
                    <div className="flex items-center space-x-2">
                        <Link
                            to="/profile"
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Profile"
                        >
                            <User className="w-5 h-5 dark:text-white" />
                        </Link>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5 dark:text-white" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full p-2 pl-10 rounded-lg border dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    {searching && (
                        <div className="absolute right-3 top-2.5">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold mb-2 dark:text-white">Search Results</h3>
                    {searchResults.map(result => (
                        <div
                            key={result._id}
                            onClick={() => handleUserClick(result)}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    {result.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium dark:text-white">{result.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {result.online ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <button className="text-blue-500 hover:text-blue-600">
                                <MessageSquare className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No chats yet</p>
                        <p className="text-sm">Search for users to start chatting</p>
                    </div>
                ) : (
                    chats.map(chat => {
                        const otherUser = chat.participants?.find(p => p._id !== user?._id);
                        const lastMessage = chat.lastMessage;

                        return (
                            <div
                                key={chat._id}
                                onClick={() => onSelectChat(chat)}
                                className={`p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${selectedChat?._id === chat._id ? 'bg-blue-50 dark:bg-gray-800' : ''
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {chat.isGroupChat ? 'G' : otherUser?.name?.[0]?.toUpperCase()}
                                        </div>
                                        {!chat.isGroupChat && otherUser?.online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold dark:text-white truncate">
                                                {chat.isGroupChat ? chat.chatName : otherUser?.name}
                                            </h3>
                                            {lastMessage && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                                    {formatTime(lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        {lastMessage ? (
                                            <p className="text-gray-600 dark:text-gray-400 truncate text-sm mt-1">
                                                {lastMessage.sender?._id === user?._id ? 'You: ' : ''}
                                                {lastMessage.image ? '📷 Photo' : lastMessage.content}
                                            </p>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                Start a conversation
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Current User Info */}
            {user && (
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="font-medium dark:text-white">{user.name}</p>
                            <p className="text-sm text-green-500">Online</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;