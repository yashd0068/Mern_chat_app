import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Zap, Shield } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            {/* Navbar */}
            <nav className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                        <span className="text-2xl font-bold dark:text-white">ChatApp</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-1/2 mb-12 lg:mb-0">
                        <h1 className="text-5xl lg:text-6xl font-bold dark:text-white mb-6">
                            Connect with <span className="text-blue-500">Everyone</span> Instantly
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Real-time messaging, voice calls, and video chats. Everything you need to stay connected with friends and family.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                to="/register"
                                className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-center font-semibold"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:border-blue-500 text-center"
                            >
                                Try Demo
                            </Link>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="relative">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transform rotate-3">
                                <div className="space-y-4">
                                    {/* Chat Preview */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                                        <div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                            <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-24 mt-1"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-end">
                                            <div className="bg-blue-500 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-xs">
                                                Hey there! How are you doing?
                                            </div>
                                        </div>
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs">
                                                I'm good! Just finished work
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-blue-500 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-xs">
                                                Want to catch up this weekend? 😊
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-4xl font-bold text-center dark:text-white mb-12">
                    Why Choose ChatApp?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold dark:text-white mb-2">Real-time Chat</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Instant messaging with typing indicators and online status
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold dark:text-white mb-2">Find Friends</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Search and connect with users from around the world
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-semibold dark:text-white mb-2">Lightning Fast</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Optimized for speed and smooth performance on all devices
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-xl font-semibold dark:text-white mb-2">Secure</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            End-to-end encryption and privacy-focused features
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 border-t dark:border-gray-700 mt-16">
                <div className="text-center text-gray-600 dark:text-gray-400">
                    <p>© 2024 ChatApp. All rights reserved.</p>
                    <p className="mt-2">Connect, chat, and share moments with your loved ones.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;