// src/components/AuthContext.jsx - Authentication Context Provider
import React, { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState(null);

    const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await fetch(`${API_URL}/api/auth/verify`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await response.json();

                    if (data.authenticated) {
                        setUser(JSON.parse(savedUser));
                        setAuthToken(token);
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                    // Clear invalid auth
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const signIn = (userData) => {
        setUser(userData);
        const token = localStorage.getItem('authToken');
        setAuthToken(token);
    };

    const signOut = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setAuthToken(null);
        // Reload to show login page
        window.location.reload();
    };

    // Helper function to make authenticated requests
    const authenticatedFetch = async (url, options = {}) => {
        if (!authToken) {
            throw new Error('Not authenticated');
        }

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${authToken}`
            }
        });
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
        authenticatedFetch,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}