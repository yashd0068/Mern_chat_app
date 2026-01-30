import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

console.log('=== AUTH CONTEXT LOADED ===');
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

// FIX: Ensure /api is included
const envApiUrl = import.meta.env.VITE_API_URL;
let API_URL;

if (envApiUrl && envApiUrl.includes('render.com')) {
    // If it's the production URL but missing /api
    if (!envApiUrl.endsWith('/api')) {
        API_URL = envApiUrl.endsWith('/')
            ? `${envApiUrl}api`
            : `${envApiUrl}/api`;
    } else {
        API_URL = envApiUrl;
    }
} else {
    // Default/local
    API_URL = 'https://mern-chat-app-273c.onrender.com/api';
}

console.log('Final API_URL:', API_URL);
console.log('Login URL will be:', `${API_URL}/auth/login`);
console.log('================');




const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in on mount
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setError(null);
            const { data } = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    // Register function
    const register = async (name, email, password) => {
        try {
            setError(null);
            const { data } = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            if (user?.token) {
                await axios.post(`${API_URL}/auth/logout`, {}, {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('userInfo');
            setUser(null);
        }
    };

    // Update user function
    const updateUser = (updatedUser) => {
        const userInfo = { ...user, ...updatedUser };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        setUser(userInfo);
    };

    // Clear error
    const clearError = () => setError(null);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};