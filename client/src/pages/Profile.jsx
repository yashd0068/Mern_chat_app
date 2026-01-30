import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, User, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const { updateProfile } = useChat();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: ''
    });
    const [profilePic, setProfilePic] = useState('');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || ''
            });
            setProfilePic(user.profilePic || '');
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('bio', formData.bio);
            if (profilePicFile) {
                formDataToSend.append('profilePic', profilePicFile);
            }

            const updatedUser = await updateProfile(formDataToSend);
            updateUser(updatedUser);
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-white">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
                                        {profilePic ? (
                                            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-2xl font-bold">
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <label htmlFor="profile-pic" className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full cursor-pointer shadow-lg">
                                        <Camera className="w-4 h-4 text-gray-700 dark:text-white" />
                                        <input
                                            id="profile-pic"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePicChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{user.name}</h1>
                                    <p className="text-blue-100">{user.email}</p>
                                    <p className="mt-2 text-sm opacity-90">{user.bio || 'No bio yet'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="mt-4 md:mt-0 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b dark:border-gray-700">
                        <div className="text-center p-4">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">0</div>
                            <div className="text-gray-500 dark:text-gray-400">Followers</div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">0</div>
                            <div className="text-gray-500 dark:text-gray-400">Following</div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">Joined</div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="text-xl font-bold mb-6 dark:text-white">Edit Profile</h2>

                        {message && (
                            <div className={`p-3 rounded-lg mb-6 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {message}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                                    <User className="w-4 h-4 mr-2" />
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white opacity-60 cursor-not-allowed"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell us about yourself..."
                                    maxLength="200"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {200 - formData.bio.length} characters remaining
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;