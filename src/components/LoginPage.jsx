// src/components/LoginPage.jsx - Complete Login/Register Component
import React, { useState } from 'react';

export function LoginPage({ onSignIn }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (data.success) {
                // Store token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Call parent callback
                onSignIn(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2">
                    🧠💩 Brainrot Judge
                </h1>
                <p className="text-gray-400 text-center mb-8">
                    {isLogin ? 'Welcome back, chaos agent' : 'Join the brainrot revolution'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            minLength={3}
                            maxLength={20}
                            pattern="[a-zA-Z0-9_-]+"
                            title="Username can only contain letters, numbers, underscore and hyphen"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            minLength={6}
                        />
                        {!isLogin && (
                            <p className="text-xs text-gray-400 mt-1">
                                Password must be at least 6 characters
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-purple-400 hover:text-purple-300 font-medium mt-1"
                    >
                        {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}