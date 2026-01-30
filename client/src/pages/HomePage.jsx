import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Users, Bell, User, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, logout } = useAuth();
    const { searchUsers, accessChat } = useChat();
    const navigate = useNavigate();

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.trim()) {
                setLoading(true);
                try {
                    const results = await searchUsers(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleFollow = async (userId) => {
        // TODO: Implement follow functionality
        console.log('Follow user:', userId);
    };

    const handleMessage = async (userId) => {
        try {
            console.log('Creating/accessing chat with user:', userId);
            const chat = await accessChat(userId);
            console.log('Chat created/accessed:', chat);

            // Navigate to chat page with the chat data
            navigate('/chat', { state: { selectedChat: chat } });

        } catch (error) {
            console.error('Error accessing chat:', error);

            // Show error message to user
            alert(`Error: ${error.message || 'Failed to start chat'}`);

            // Optionally, navigate to user profile instead
            // navigate(`/user/${userId}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigateToProfile = () => {
        navigate('/profile');
    };

    const navigateToChat = () => {
        navigate('/chat');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold dark:text-white">ChatApp</span>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {loading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nav Links */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Home"
                            >
                                <Home className="w-5 h-5 dark:text-white" />
                            </button>
                            <button
                                onClick={navigateToChat}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Messages"
                            >
                                <MessageSquare className="w-5 h-5 dark:text-white" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative" title="Notifications">
                                <Bell className="w-5 h-5 dark:text-white" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button
                                onClick={navigateToProfile}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Profile"
                            >
                                <User className="w-5 h-5 dark:text-white" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 dark:text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
                <div className="container mx-auto px-4 mt-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                        <h3 className="font-semibold text-lg dark:text-white mb-4">Search Results</h3>
                        <div className="space-y-3">
                            {searchResults.map(user => (
                                <div key={user._id} className="group">
                                    <div
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                                        onClick={() => navigate(`/user/${user._id}`)} // Click on whole card goes to profile
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-medium dark:text-white">{user.name}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${user.online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user.online ? 'Online' : 'Offline'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {user.followers?.length || 0} followers
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleMessage(user._id)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
                                            >
                                                Message
                                            </button>
                                            <button
                                                onClick={() => handleFollow(user._id)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                            >
                                                Follow
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - User Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold mb-4">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-bold dark:text-white">{user?.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                                <div className="mt-6 space-y-4">
                                    <button
                                        onClick={navigateToProfile}
                                        className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:opacity-90"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={navigateToChat}
                                        className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        View Messages
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-8 pt-8 border-t dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold dark:text-white">0</div>
                                        <div className="text-gray-500 dark:text-gray-400">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold dark:text-white">0</div>
                                        <div className="text-gray-500 dark:text-gray-400">Following</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                        {/* Welcome Card */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg p-6 text-white mb-8">
                            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                            <p className="opacity-90">Start new conversations or continue existing ones. Your messages are waiting.</p>
                            <button
                                onClick={navigateToChat}
                                className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-full font-semibold hover:bg-opacity-90"
                            >
                                Go to Messages
                            </button>
                        </div>

                        {/* Suggested Users */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold dark:text-white">Suggested Users</h3>
                                <button className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                                    See All
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* Placeholder for suggested users */}
                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                                        <div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                                            <div className="h-3 bg-gray-100 dark:bg-gray-500 rounded w-16 mt-2"></div>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                        Follow
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
                            <h3 className="text-xl font-bold dark:text-white mb-6">Recent Activity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-blue-500 mr-3" />
                                    <div>
                                        <p className="dark:text-white">No recent messages</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Start a conversation!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;