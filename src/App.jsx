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

    const isAdmin = () => {
        const adminUsers = ['admin', 'spit-on-it'];
        return adminUsers.includes(user?.username);
    };

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

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image too large! Please select an image under 5MB.');
                return;
            }

            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
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

        if (!user || !user.username) {
            alert('Please log in to submit');
            return;
        }

        setIsLoading(true);
        console.log('Submitting with user:', user.username); // Debug log

        try {
            // Get the auth token directly
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                alert('Authentication token not found. Please log in again.');
                signOut();
                return;
            }

            const submitData = {
                caption: caption.trim(),
                useAI: useAI,
                image: selectedImage || null
            };

            console.log('Submitting data:', submitData); // Debug log

            const response = await fetch(`${API_URL}/api/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(submitData)
            });

            console.log('Response status:', response.status); // Debug log

            // Try to parse response regardless of status
            let data;
            try {
                data = await response.json();
                console.log('Response data:', data); // Debug log
            } catch (e) {
                console.error('Failed to parse response:', e);
                data = null;
            }

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Session expired. Please log in again.');
                    signOut();
                    return;
                }

                const errorMessage = data?.error || data?.message || 'Failed to submit';
                console.error('Submit failed:', errorMessage);
                alert(`Error: ${errorMessage}`);
                return;
            }

            if (data && data.success) {
                const score = data.totalScore || 50;
                const grade = data.grade || 'B';
                alert(`🎉 ${grade} Grade! Score: ${score}/100`);

                // Reset form
                setCaption('');
                setSelectedImage(null);
                setSelectedImageFile(null);
                setAiRatings(null);
                setShowAIPreview(false);
                setFeedbackGiven(false);
                setPredictionId(null);

                // Refresh data
                await Promise.all([
                    fetchSubmissions(),
                    fetchLeaderboard(),
                    fetchUserStreak()
                ]);
            } else {
                alert('Submission processed but no rating generated. Please try again.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert(`Network error: ${error.message}. Please check your connection and try again.`);
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
            const response = await authenticatedFetch(`${API_URL}/api/slang/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    term: newSlangTerm.toLowerCase(),
                    weight: newSlangWeight,
                    category: newSlangCategory
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Slang term added successfully!');
                setNewSlangTerm('');
                setNewSlangWeight(2.0);
            }
        } catch (error) {
            console.error('Error adding slang term:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
            {/* Header */}
            <header className="p-6 flex justify-between items-center bg-gray-900/50 backdrop-blur-md">
                <h1 className="text-3xl font-bold text-gradient">
                    🧠💩 Brainrot Judge
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm">Welcome, {user.username}</span>
                    <button
                        onClick={signOut}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="p-4 flex gap-2 justify-center flex-wrap">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'upload'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                >
                    📤 Upload
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'history'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                >
                    📜 History
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'leaderboard'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                >
                    🏆 Leaders
                </button>
                <button
                    onClick={() => setActiveTab('insights')}
                    className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'insights'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                >
                    🧠 AI Insights
</button>
                {isAdmin() && (
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'admin'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                    >
                        ⚙️ Admin
                    </button>
                )}
            </nav>

            {/* Main Content */}
            <main className="p-6">
                {/* Upload Tab */}
                {activeTab === 'upload' && (
                    <div className="max-w-2xl mx-auto">
                        {/* Daily Challenge */}
                        {dailyChallenge && (
                            <div className="bg-gradient-to-r from-purple-800 to-pink-800 rounded-xl p-4 mb-6">
                                <h3 className="font-bold mb-2">🎯 Daily Challenge</h3>
                                <p>{dailyChallenge.theme}</p>
                                <p className="text-sm opacity-75">+{dailyChallenge.bonus_points} bonus points!</p>
                            </div>
                        )}

                        {/* Upload Form */}
                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="mb-6">
                                <label className="block mb-2 font-medium">
                                    📸 Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="w-full p-3 bg-gray-700 rounded-lg"
                                />
                                {selectedImage && (
                                    <img
                                        src={selectedImage}
                                        alt="Preview"
                                        className="mt-4 max-h-64 rounded-lg mx-auto"
                                    />
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block mb-2 font-medium">
                                    💭 Caption
                                </label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Enter your most unhinged caption..."
                                    className="w-full p-3 bg-gray-700 rounded-lg h-32 placeholder-gray-400"
                                />
                            </div>

                            <div className="mb-6 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="useAI"
                                    checked={useAI}
                                    onChange={(e) => setUseAI(e.target.checked)}
                                    className="w-5 h-5"
                                />
                                <label htmlFor="useAI" className="cursor-pointer">
                                    🤖 Use AI Rating
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={getAIRatingPreview}
                                    disabled={isLoading || !caption.trim()}
                                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold disabled:opacity-50"
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
                                                        <span className="font-bold">{value}/20</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                                            ✔ Thanks for improving our AI!
                                        </div>
                                    )}
                                </div>
                            )}
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
                                            {/* Show image if it exists */}
                                            {sub.image_url && sub.image_url.length > 100 && (
                                                <img
                                                    src={sub.image_url}
                                                    alt="Submission image"
                                                    className="w-full max-h-64 object-contain rounded-lg bg-gray-800 mb-3"
                                                    style={{ display: 'block' }}
                                                />
                                            )}
                                            <p className="text-gray-300 mb-2">{sub.caption}</p>
                                            <div className="flex gap-4 text-sm">
                                                <span>Score: {sub.totalScore}/100</span>
                                                <span>Chaos: {sub.chaos}/20</span>
                                                <span>Meme: {sub.memeability}/20</span>
                                                {sub.has_image === 1 && (
                                                    <span className="text-green-400">📸</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">🏆 Top Brainrotters</h2>
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry.user_name} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-bold">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </span>
                                            <span className="font-medium">{entry.user_name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg">{entry.avg_score?.toFixed(1)}</div>
                                            <div className="text-sm text-gray-400">{entry.submission_count} submissions</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Insights Tab */}
                {activeTab === 'insights' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* AI Accuracy Stats */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 text-purple-400">🎯 AI Performance</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Avg Confidence</span>
                                        <span className="font-bold">
                                            {submissions.length > 0
                                                ? `${(submissions.reduce((acc, s) => acc + (s.ai_confidence || 0.7), 0) / submissions.length * 100).toFixed(1)}%`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">AI-Rated</span>
                                        <span className="font-bold">
                                            {submissions.filter(s => s.autoRated).length}/{submissions.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Feedback Given</span>
                                        <span className="font-bold">
                                            {submissions.filter(s => s.feedback_collected).length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Score Distribution */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 text-purple-400">📊 Score Distribution</h3>
                                <div className="space-y-2">
                                    {['S', 'A', 'B', 'C', 'F'].map(grade => {
                                        const count = submissions.filter(s => s.grade === grade).length;
                                        const percentage = submissions.length > 0 ? (count / submissions.length * 100) : 0;
                                        return (
                                            <div key={grade} className="flex items-center gap-3">
                                                <span className="w-8 font-bold">{grade}:</span>
                                                <div className="flex-1 bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                                    <div
                                                        className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center px-2"
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        <span className="text-xs font-bold">{count}</span>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-400 w-12">{percentage.toFixed(0)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Category Averages */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 text-purple-400">🎨 Category Averages</h3>
                                <div className="space-y-3">
                                    {['chaos', 'absurdity', 'memeability', 'unhinged'].map(category => {
                                        const avg = submissions.length > 0
                                            ? submissions.reduce((acc, s) => acc + (s[category] || 0), 0) / submissions.length
                                            : 0;
                                        return (
                                            <div key={category}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="capitalize text-sm">{category}</span>
                                                    <span className="text-sm font-bold">{avg.toFixed(1)}/20</span>
                                                </div>
                                                <div className="bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                        style={{ width: `${(avg / 20) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent AI Predictions */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 text-purple-400">🔮 Recent AI Activity</h3>
                                <div className="space-y-2 text-sm">
                                    {submissions
                                        .filter(s => s.autoRated)
                                        .slice(0, 5)
                                        .map((sub, idx) => (
                                            <div key={idx} className="flex justify-between">
                                                <span className="text-gray-400 truncate max-w-[150px]">
                                                    {sub.caption}
                                                </span>
                                                <span className="font-bold text-purple-400">{sub.grade}</span>
                                            </div>
                                        ))}
                                    {submissions.filter(s => s.autoRated).length === 0 && (
                                        <div className="text-gray-500 text-center py-4">
                                            No AI predictions yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Top Performers */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 text-purple-400">🌟 Top Chaos Creators</h3>
                                <div className="space-y-2">
                                    {submissions
                                        .sort((a, b) => b.totalScore - a.totalScore)
                                        .slice(0, 5)
                                        .map((sub, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">
                                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                                                    </span>
                                                    <span className="text-sm">{sub.user_id}</span>
                                                </div>
                                                <span className="font-bold">{sub.totalScore}/100</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 text-purple-400">📈 Quick Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{submissions.length}</div>
                                        <div className="text-xs text-gray-400">Total Submissions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-pink-400">
                                            {submissions.length > 0
                                                ? (submissions.reduce((acc, s) => acc + s.totalScore, 0) / submissions.length).toFixed(0)
                                                : '0'}
                                        </div>
                                        <div className="text-xs text-gray-400">Avg Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">
                                            {submissions.filter(s => s.has_image).length}
                                        </div>
                                        <div className="text-xs text-gray-400">With Images</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-pink-400">{userStreak}</div>
                                        <div className="text-xs text-gray-400">Your Streak</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Tab */}
                {activeTab === 'admin' && isAdmin() && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

                            {/* Add Slang Term */}
                            <div className="mb-6">
                                <h3 className="font-bold mb-3">Add Slang Term</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Term"
                                        value={newSlangTerm}
                                        onChange={(e) => setNewSlangTerm(e.target.value)}
                                        className="p-2 bg-gray-700 rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Weight"
                                        value={newSlangWeight}
                                        onChange={(e) => setNewSlangWeight(parseFloat(e.target.value))}
                                        className="p-2 bg-gray-700 rounded-lg"
                                        step="0.5"
                                        min="0.5"
                                        max="5"
                                    />
                                    <select
                                        value={newSlangCategory}
                                        onChange={(e) => setNewSlangCategory(e.target.value)}
                                        className="p-2 bg-gray-700 rounded-lg"
                                    >
                                        <option value="chaos">Chaos</option>
                                        <option value="meme">Meme</option>
                                        <option value="trending">Trending</option>
                                        <option value="elite">Elite</option>
                                    </select>
                                    <button
                                        onClick={addSlangTerm}
                                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                                    >
                                        Add Term
                                    </button>
                                </div>
                            </div>

                            {/* Slang Analyzer */}
                            <div className="mb-6">
                                <h3 className="font-bold mb-3">Test Slang Analyzer</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Enter text to analyze..."
                                        value={slangTestText}
                                        onChange={(e) => setSlangTestText(e.target.value)}
                                        className="flex-1 p-2 bg-gray-700 rounded-lg"
                                    />
                                    <button
                                        onClick={analyzeSlang}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                                    >
                                        Analyze
                                    </button>
                                </div>
                                {slangAnalysis && (
                                    <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                                        <div>Score: {slangAnalysis.score}/100</div>
                                        <div>Detected Terms: {slangAnalysis.analysis?.detectedTerms?.join(', ')}</div>
                                        <div>Density: {slangAnalysis.analysis?.density?.toFixed(2)}%</div>
                                    </div>
                                )}
                            </div>

                            {/* Training Data */}
                            <div className="mb-6">
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
            </main>
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