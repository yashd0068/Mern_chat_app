import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleDarkMode}
                className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Toggle dark mode"
            >
                {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                    <Moon className="w-5 h-5 text-gray-700" />
                )}
            </button>

            {children}
        </div>
    );
};

export default Layout;