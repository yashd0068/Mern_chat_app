import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

console.log('=== VITE ENV DEBUG ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);
console.log('=== END DEBUG ===');

// Add /api if it's missing
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;
console.log('Computed API_URL:', API_URL);

console.log('Final API_URL:', API_URL);


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