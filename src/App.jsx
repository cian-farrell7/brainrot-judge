import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginPage } from './components/LoginPage';
import './App.css';

function AppContent() {
    const { user, loading, signOut, authenticatedFetch } = useAuth();

    // Core state
    const [activeTab, setActiveTab] = useState('upload');
    const [caption, setCaption] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [userStreak, setUserStreak] = useState(0);
    const [achievements, setAchievements] = useState([]);
    const [showAllUsers, setShowAllUsers] = useState(true);
    const [slangTestText, setSlangTestText] = useState('');
    const [slangAnalysis, setSlangAnalysis] = useState(null);

    // AI-specific states
    const [useAI, setUseAI] = useState(true);
    const [aiRatings, setAiRatings] = useState(null);
    const [predictionId, setPredictionId] = useState(null);
    const [feedbackGiven, setFeedbackGiven] = useState(false);
    const [aiConfidence, setAiConfidence] = useState(0);
    const [showAIPreview, setShowAIPreview] = useState(false);
    const [userOverrides, setUserOverrides] = useState({});
    const [trainingData, setTrainingData] = useState(null);

    // Admin states
    const [newSlangTerm, setNewSlangTerm] = useState('');
    const [newSlangWeight, setNewSlangWeight] = useState(2.0);
    const [newSlangCategory, setNewSlangCategory] = useState('chaos');

    const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';

    useEffect(() => {
        if (user) {
            fetchDailyChallenge();
            fetchSubmissions();
            fetchLeaderboard();
            fetchUserStreak();
            fetchAchievements();
        }
    }, [user]);

    // Show loading screen while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex items-center justify-center">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    // Show login page if not authenticated
    if (!user) {
        return <LoginPage onSignIn={() => window.location.reload()} />;
    }

    // Fetch functions
    const fetchDailyChallenge = async () => {
        try {
            const response = await fetch(`${API_URL}/api/daily-challenge`);
            const data = await response.json();
            if (data.success) {
                setDailyChallenge(data.challenge);
            }
        } catch (error) {
            console.error('Error fetching daily challenge:', error);
        }
    };

    const fetchUserStreak = async () => {
        try {
            const response = await fetch(`${API_URL}/api/streak?user_id=${user.username}`);
            const data = await response.json();
            if (data.success) {
                setUserStreak(data.streak?.current_streak || 0);
            }
        } catch (error) {
            console.error('Error fetching streak:', error);
        }
    };

    const fetchAchievements = async () => {
        try {
            const response = await fetch(`${API_URL}/api/achievements?user_id=${user.username}`);
            const data = await response.json();
            if (data.success) {
                setAchievements(data.achievements || []);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`${API_URL}/api/submissions`);
            const data = await response.json();
            if (data.success) {
                setSubmissions(data.submissions || []);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`${API_URL}/api/leaderboard`);
            const data = await response.json();
            if (data.success) {
                setLeaderboard(data.leaderboard || []);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    const fetchTrainingData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/training-data`);
            const data = await response.json();
            if (data.success) {
                setTrainingData(data);
            }
        } catch (error) {
            console.error('Error fetching training data:', error);
        }
    };

    const getAIRatingPreview = async () => {
        if (!caption.trim()) {
            alert('Please enter a caption first!');
            return;
        }

        setIsLoading(true);
        setShowAIPreview(true);
        setFeedbackGiven(false);

        try {
            const response = await authenticatedFetch(`${API_URL}/api/ai-rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caption: caption,
                    image: selectedImage  // Send base64 image if present
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Please log in to use AI rating');
                    return;
                } else if (response.status === 429) {
                    const data = await response.json();
                    alert(`Rate limit exceeded. Please wait ${data.retryAfter} seconds.`);
                    return;
                }
                throw new Error('Failed to get AI rating');
            }

            const data = await response.json();
            if (data.success) {
                setAiRatings(data.ratings);
                setPredictionId(data.predictionId);
                setAiConfidence(data.aiConfidence || 0);
            }
        } catch (error) {
            console.error('AI rating error:', error);
            alert('Failed to get AI rating. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!caption.trim()) {
            alert('Please enter a caption!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authenticatedFetch(`${API_URL}/api/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    caption: caption,
                    useAI: useAI,
                    image: selectedImage
                })
            });

            // Check if response is OK
            if (!response.ok) {
                if (response.status === 401) {
                    alert('Please log in to submit');
                    return;
                }

                // Try to get error details
                try {
                    const errorData = await response.json();
                    console.error('Submit failed:', errorData);
                    alert(`Failed to submit: ${errorData.message || 'Unknown error'}`);
                } catch (e) {
                    alert('Failed to submit. Please try again.');
                }
                return;
            }

            // Parse successful response
            const data = await response.json();
            console.log('Submit response:', data); // Debug log

            if (data.success) {
                const score = data.totalScore || 50;
                const grade = data.grade || 'B';
                alert(`${grade} Grade! Score: ${score}/100`);

                // Reset form
                setCaption('');
                setSelectedImage(null);
                setSelectedImageFile(null);
                setAiRatings(null);
                setShowAIPreview(false);
                setFeedbackGiven(false);
                setPredictionId(null);

                // Refresh data
                fetchSubmissions();
                fetchLeaderboard();
                fetchUserStreak();
            } else {
                // Handle case where success is false
                alert('Submission saved but no rating generated.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const submitFeedback = async (feedbackType) => {
        if (!predictionId || feedbackGiven) return;

        try {
            const response = await authenticatedFetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    predictionId,
                    submissionId: null,
                    userId: user.username,
                    userRatings: userOverrides,
                    aiWasAccurate: feedbackType === 'thumbs_up',
                    feedbackType
                })
            });

            const data = await response.json();
            if (data.success) {
                setFeedbackGiven(true);
                alert(`Thanks for the feedback! +${data.contributionPoints} points earned!`);
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
        }
    };

    const analyzeSlang = async () => {
        if (!slangTestText.trim()) {
            alert('Please enter text to analyze!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/slang/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: slangTestText })
            });

            const data = await response.json();
            if (data.success) {
                setSlangAnalysis(data);
            }
        } catch (error) {
            console.error('Slang analysis error:', error);
        }
    };

    const addSlangTerm = async () => {
        if (!newSlangTerm.trim()) {
            alert('Please enter a slang term!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/slang/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    term: newSlangTerm,
                    weight: newSlangWeight,
                    category: newSlangCategory,
                    variants: []
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Added "${newSlangTerm}" to dictionary!`);
                setNewSlangTerm('');
            }
        } catch (error) {
            console.error('Add slang error:', error);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
            {/* Header */}
            <header className="p-4 border-b border-purple-500">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        🧠💩 Brainrot Judge v2.2
                        <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full">
                            AI Enhanced
                        </span>
                    </h1>
                    <div className="flex items-center gap-4">
                        {userStreak > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔥</span>
                                <span className="text-xl font-bold">{userStreak} day streak</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="text-sm bg-gray-700 px-3 py-1 rounded-lg">
                                👤 {user.username}
                            </span>
                            <button
                                onClick={signOut}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Daily Challenge Banner */}
            {dailyChallenge && (
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 text-center">
                    <p className="text-lg font-bold">
                        📢 Today's Challenge: {dailyChallenge.theme} (+{dailyChallenge.bonus_points} bonus points!)
                    </p>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4">
                {/* Tab Navigation */}
                <div className="flex gap-2 bg-gray-800 rounded-lg p-1 mb-6 overflow-x-auto">
                    {['upload', 'leaders', 'history', 'achievements', 'ai-insights', 'admin'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Upload Tab */}
                {activeTab === 'upload' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Submit Your Chaos</h2>

                            {/* Caption Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Your Brainrot Caption</label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="fr fr no cap this ohio rizz got me acting unwise 💀"
                                    className="w-full p-4 bg-gray-700 rounded-lg text-white placeholder-gray-400 h-32 resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Pro tip: Use "aura", "goon", "penjamin" for extra points!
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Add Chaos Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="w-full p-2 bg-gray-700 rounded-lg"
                                />
                                {selectedImage && (
                                    <img
                                        src={selectedImage}
                                        alt="Preview"
                                        className="mt-2 h-32 rounded-lg object-cover"
                                    />
                                )}
                            </div>

                            {/* AI Toggle */}
                            <div className="mb-6 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="useAI"
                                    checked={useAI}
                                    onChange={(e) => setUseAI(e.target.checked)}
                                    className="w-5 h-5"
                                />
                                <label htmlFor="useAI" className="text-sm">
                                    Use AI-Enhanced Rating (Recommended)
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={getAIRatingPreview}
                                    disabled={isLoading || !caption.trim()}
                                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold disabled:opacity-50 transition-all"
                                >
                                    {isLoading ? 'Analyzing...' : '🤖 Preview AI Rating'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !caption.trim()}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-bold disabled:opacity-50 transition-all"
                                >
                                    {isLoading ? 'Submitting...' : '🚀 Submit Chaos'}
                                </button>
                            </div>

                            {/* AI Rating Preview */}
                            {showAIPreview && aiRatings && (
                                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                    <h3 className="text-lg font-bold mb-3 flex items-center justify-between">
                                        AI Rating Preview
                                        <span className="text-sm font-normal text-purple-400">
                                            Confidence: {(aiConfidence * 100).toFixed(0)}%
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(aiRatings).map(([key, value]) => {
                                            if (typeof value !== 'number') return null;
                                            return (
                                                <div key={key} className="bg-gray-800 rounded p-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm capitalize">
                                                            {key.replace('_', ' ')}
                                                        </span>
                                                        <span className="font-bold text-purple-400">
                                                            {value}/20
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                                            style={{ width: `${(value / 20) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Total Score */}
                                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Total Score</span>
                                            <span className="text-2xl font-bold">
                                                {Object.values(aiRatings)
                                                    .filter(v => typeof v === 'number')
                                                    .reduce((a, b) => a + b, 0)}/100
                                            </span>
                                        </div>
                                    </div>

                                    {/* Feedback Buttons */}
                                    {!feedbackGiven && (
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => submitFeedback('thumbs_up')}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                                            >
                                                👍 Accurate
                                            </button>
                                            <button
                                                onClick={() => submitFeedback('thumbs_down')}
                                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                                            >
                                                👎 Needs Work
                                            </button>
                                        </div>
                                    )}

                                    {feedbackGiven && (
                                        <div className="mt-3 p-2 bg-green-800 rounded-lg text-center">
                                            ✓ Thanks for improving our AI!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Leaders Tab */}
                {activeTab === 'leaders' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
                            <div className="space-y-3">
                                {leaderboard.map((user, index) => (
                                    <div key={user.user_id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </span>
                                            <span className="font-medium">{user.user_id}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-400">
                                                {user.avg_score?.toFixed(1)} avg
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {user.submission_count} submissions
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Recent Submissions</h2>
                                <button
                                    onClick={() => setShowAllUsers(!showAllUsers)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                >
                                    {showAllUsers ? 'All Users' : 'My History'}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {submissions
                                    .filter(sub => showAllUsers || sub.user_id === user.username)
                                    .slice(0, 20)
                                    .map(sub => (
                                        <div key={sub.id} className="bg-gray-700 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-purple-400">{sub.user_id}</span>
                                                <span className="text-2xl font-bold">{sub.grade}</span>
                                            </div>
                                            <p className="text-gray-300 mb-2">{sub.caption}</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <span>Score: {sub.total_score}/100</span>
                                                {sub.ai_confidence > 0 && (
                                                    <span className="text-purple-400">
                                                        AI: {(sub.ai_confidence * 100).toFixed(0)}% confident
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Achievements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {achievements.map(achievement => (
                                    <div
                                        key={achievement.id}
                                        className={`p-4 rounded-lg ${achievement.unlocked_at
                                            ? 'bg-gradient-to-r from-purple-700 to-pink-700'
                                            : 'bg-gray-700 opacity-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{achievement.icon || '🏆'}</span>
                                            <div className="flex-1">
                                                <h3 className="font-bold">{achievement.name}</h3>
                                                <p className="text-sm text-gray-300">{achievement.description}</p>
                                            </div>
                                            {achievement.unlocked_at && (
                                                <span className="text-green-400">✓</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Insights Tab */}
                {activeTab === 'ai-insights' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">AI Training Insights</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">Model Performance</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>AI Weight:</span>
                                            <span className="text-purple-400">70%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Traditional Weight:</span>
                                            <span className="text-purple-400">30%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Model Version:</span>
                                            <span className="text-purple-400">v1.0</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Feedback Collected:</span>
                                            <span className="text-purple-400">{trainingData?.totalFeedback || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">Top Slang Terms</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="text-purple-400">• "aura" (weight: 4.0)</div>
                                        <div className="text-purple-400">• "skibidi" (weight: 4.0)</div>
                                        <div className="text-purple-400">• "rizz" (weight: 3.5)</div>
                                        <div className="text-purple-400">• "ohio" (weight: 3.5)</div>
                                        <div className="text-purple-400">• "goon" (weight: 3.0)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Slang Analyzer */}
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <h3 className="font-bold mb-3">Test Slang Analyzer</h3>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={slangTestText}
                                        onChange={(e) => setSlangTestText(e.target.value)}
                                        placeholder="Enter text to analyze..."
                                        className="flex-1 p-2 bg-gray-600 rounded-lg"
                                    />
                                    <button
                                        onClick={analyzeSlang}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                                    >
                                        Analyze
                                    </button>
                                </div>

                                {slangAnalysis && (
                                    <div className="mt-3 p-3 bg-gray-800 rounded">
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-400">Score:</span>
                                                <span className="ml-2 text-purple-400 font-bold">
                                                    {slangAnalysis.score}/20
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Terms:</span>
                                                <span className="ml-2 text-purple-400 font-bold">
                                                    {slangAnalysis.analysis?.detectedTerms?.length || 0}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Density:</span>
                                                <span className="ml-2 text-purple-400 font-bold">
                                                    {slangAnalysis.analysis?.density?.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        {slangAnalysis.analysis?.detectedTerms?.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-400 mb-1">Detected:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {slangAnalysis.analysis.detectedTerms.map((term, i) => (
                                                        <span key={i} className="text-xs px-2 py-1 bg-purple-600 rounded">
                                                            {term.term} ({term.weight}w)
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-700 rounded-lg p-4">
                                <h3 className="font-bold mb-3">How AI Scoring Works</h3>
                                <p className="text-sm text-gray-300 mb-2">
                                    Our AI analyzes your caption for:
                                </p>
                                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                                    <li>Slang density and tier (elite terms score higher)</li>
                                    <li>Meme references and internet culture</li>
                                    <li>Chaos and randomness levels</li>
                                    <li>Emoji usage and placement</li>
                                    <li>Trending topics and viral potential</li>
                                </ul>
                                <p className="text-sm text-gray-400 mt-3">
                                    Every feedback you provide helps improve accuracy!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Tab */}
                {activeTab === 'admin' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

                            {/* Add Slang Term */}
                            <div className="bg-gray-700 rounded-lg p-4 mb-6">
                                <h3 className="font-bold mb-3">Add New Slang Term</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={newSlangTerm}
                                        onChange={(e) => setNewSlangTerm(e.target.value)}
                                        placeholder="Term (e.g., 'bussin')"
                                        className="p-2 bg-gray-600 rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={newSlangWeight}
                                        onChange={(e) => setNewSlangWeight(parseFloat(e.target.value))}
                                        min="0"
                                        max="5"
                                        step="0.5"
                                        placeholder="Weight (0-5)"
                                        className="p-2 bg-gray-600 rounded-lg"
                                    />
                                    <select
                                        value={newSlangCategory}
                                        onChange={(e) => setNewSlangCategory(e.target.value)}
                                        className="p-2 bg-gray-600 rounded-lg"
                                    >
                                        <option value="chaos">Chaos</option>
                                        <option value="meme">Meme</option>
                                        <option value="trending">Trending</option>
                                        <option value="elite">Elite</option>
                                        <option value="reaction">Reaction</option>
                                    </select>
                                </div>
                                <button
                                    onClick={addSlangTerm}
                                    className="mt-3 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                                >
                                    Add Term
                                </button>
                            </div>

                            {/* Training Data */}
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h3 className="font-bold mb-3">Training Data</h3>
                                <button
                                    onClick={fetchTrainingData}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg mb-3"
                                >
                                    Load Training Data
                                </button>

                                {trainingData && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Total Feedback Items:</span>
                                            <span className="text-purple-400">{trainingData.metrics?.totalFeedback || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Average Accuracy Delta:</span>
                                            <span className="text-purple-400">
                                                {trainingData.metrics?.averageAccuracyDelta?.toFixed(2) || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Improvement Rate:</span>
                                            <span className="text-purple-400">{trainingData.metrics?.improvementRate || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ready for Retraining:</span>
                                            <span className={trainingData.readyForRetraining ? 'text-green-400' : 'text-yellow-400'}>
                                                {trainingData.readyForRetraining ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main App wrapper with Auth Provider
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;