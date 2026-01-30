import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Calendar, Mail, MapPin, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const UserProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const { user: currentUser } = useAuth();
    const { accessChat, fetchUserProfile } = useChat();
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            loadUserProfile();
        }
    }, [userId]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const userData = await fetchUserProfile(userId);
            setUser(userData);
            // Check if current user is following this user
            setIsFollowing(userData.followers?.includes(currentUser?._id) || false);
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        // TODO: Implement follow/unfollow functionality
        setIsFollowing(!isFollowing);
    };

    const handleMessage = async () => {
        try {
            const chat = await accessChat(user._id);
            navigate('/chat');
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold dark:text-white mb-2">User not found</h2>
                    <button
                        onClick={() => navigate('/home')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Back Button */}
            <div className="container mx-auto px-4 py-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="md:ml-8 mt-4 md:mt-0 flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold dark:text-white">{user.name}</h1>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                                    </div>
                                    <div className="flex space-x-4 mt-4 md:mt-0">
                                        <button
                                            onClick={handleMessage}
                                            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Message
                                        </button>
                                        <button
                                            onClick={handleFollowToggle}
                                            className={`px-6 py-2 rounded-full border flex items-center ${isFollowing
                                                    ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                                    : 'border-blue-500 text-blue-500'
                                                }`}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <div className="mt-6">
                                <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                            </div>
                        )}

                        {/* Details */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Calendar className="w-5 h-5 mr-3" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Mail className="w-5 h-5 mr-3" />
                                <span>{user.email}</span>
                            </div>
                            {user.location && (
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-5 h-5 mr-3" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold dark:text-white">{user.followers?.length || 0}</div>
                                <div className="text-gray-500 dark:text-gray-400">Followers</div>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold dark:text-white">{user.following?.length || 0}</div>
                                <div className="text-gray-500 dark:text-gray-400">Following</div>
                            </div>
                            <Users className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold dark:text-white">
                                    {user.online ? (
                                        <span className="text-green-500">Online</span>
                                    ) : (
                                        'Offline'
                                    )}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">Status</div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Common Connections */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold dark:text-white mb-4">Common Connections</h3>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No common connections yet</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;