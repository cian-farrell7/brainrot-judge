import React, { useState, useEffect } from 'react';
import { Plus, Upload, Search, TrendingUp, Hash, Sparkles, X } from 'lucide-react';

const SlangDictionaryAdmin = () => {
    const [newTerm, setNewTerm] = useState('');
    const [newWeight, setNewWeight] = useState(2.0);
    const [newCategory, setNewCategory] = useState('chaos');
    const [newVariants, setNewVariants] = useState('');
    const [bulkInput, setBulkInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [testText, setTestText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);

    const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';

    // Quick add preset terms
    const quickAddTerms = [
        { term: 'deadass', weight: 2.5, category: 'chaos' },
        { term: 'ahh', weight: 2.0, category: 'chaos' },
        { term: 'shi', weight: 2.0, category: 'chaos' },
        { term: 'fade', weight: 2.5, category: 'chaos' },
        { term: 'run it', weight: 2.0, category: 'chaos' },
        { term: 'juice', weight: 1.5, category: 'chaos' },
        { term: 'penjamin', weight: 3.5, category: 'meme' },
        { term: 'pennifer', weight: 3.5, category: 'meme' },
        { term: 'pen wallace', weight: 3.5, category: 'meme' },
        { term: 'aura', weight: 4.0, category: 'trending' },
        { term: 'aura farming', weight: 4.5, category: 'trending' },
        { term: 'generational aura', weight: 5.0, category: 'elite' },
        { term: 'aura loss', weight: 4.0, category: 'trending' },
        { term: 'aura debt', weight: 4.5, category: 'elite' },
        { term: 'goon', weight: 3.0, category: 'chaos' },
        { term: 'gooning', weight: 3.5, category: 'chaos' },
        { term: 'goober', weight: 2.0, category: 'wholesome' },
        { term: 'peaky blinder', weight: 3.5, category: 'meme' },
    ];

    // Add single term
    const addSingleTerm = async () => {
        if (!newTerm) return;

        try {
            const response = await fetch(`${API_URL}/api/slang/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    term: newTerm,
                    weight: newWeight,
                    category: newCategory,
                    variants: newVariants.split(',').map(v => v.trim()).filter(v => v)
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Added "${newTerm}" successfully!`);
                setNewTerm('');
                setNewVariants('');
            }
        } catch (error) {
            console.error('Error adding term:', error);
            alert('Failed to add term');
        }
    };

    // Bulk import terms
    const bulkImportTerms = async () => {
        try {
            // Parse bulk input (format: term,weight,category per line)
            const lines = bulkInput.split('\n').filter(line => line.trim());
            const terms = lines.map(line => {
                const [term, weight = 2.0, category = 'chaos'] = line.split(',').map(s => s.trim());
                return { term, weight: parseFloat(weight), category };
            });

            const response = await fetch(`${API_URL}/api/slang/bulk-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ terms })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Imported ${data.summary.added} terms successfully!`);
                setBulkInput('');
                setShowBulkModal(false);
            }
        } catch (error) {
            console.error('Error importing terms:', error);
            alert('Failed to import terms');
        }
    };

    // Quick add all preset terms
    const quickAddAll = async () => {
        try {
            const response = await fetch(`${API_URL}/api/slang/bulk-import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ terms: quickAddTerms })
            });

            const data = await response.json();
            if (data.success) {
                alert(`Added ${data.summary.added} preset terms!`);
            }
        } catch (error) {
            console.error('Error adding preset terms:', error);
            alert('Failed to add preset terms');
        }
    };

    // Analyze test text
    const analyzeText = async () => {
        if (!testText) return;

        try {
            const response = await fetch(`${API_URL}/api/slang/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: testText })
            });

            const data = await response.json();
            setAnalysis(data);
        } catch (error) {
            console.error('Error analyzing text:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <Hash className="text-purple-400" />
          Brainrot Slang Dictionary Admin
        </h1>

                {/* Quick Actions */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={quickAddAll}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
                        >
                            <Sparkles size={18} />
              Add All Preset Terms ({quickAddTerms.length})
            </button>
                        <button
                            onClick={() => setShowBulkModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                        >
                            <Upload size={18} />
              Bulk Import
            </button>
                    </div>
                </div>

                {/* Add Single Term */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Add New Slang Term</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Term (e.g., 'bussin')"
                            value={newTerm}
                            onChange={(e) => setNewTerm(e.target.value)}
                            className="px-4 py-2 bg-gray-700 rounded-lg"
                        />
                        <input
                            type="number"
                            placeholder="Weight (0-5)"
                            value={newWeight}
                            onChange={(e) => setNewWeight(parseFloat(e.target.value))}
                            min="0"
                            max="5"
                            step="0.5"
                            className="px-4 py-2 bg-gray-700 rounded-lg"
                        />
                        <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="px-4 py-2 bg-gray-700 rounded-lg"
                        >
                            <option value="chaos">Chaos</option>
                            <option value="meme">Meme</option>
                            <option value="trending">Trending</option>
                            <option value="elite">Elite</option>
                            <option value="wholesome">Wholesome</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Variants (comma-separated)"
                            value={newVariants}
                            onChange={(e) => setNewVariants(e.target.value)}
                            className="px-4 py-2 bg-gray-700 rounded-lg"
                        />
                    </div>
                    <button
                        onClick={addSingleTerm}
                        className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18} />
            Add Term
          </button>
                </div>

                {/* Test Analyzer */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Test Slang Analyzer</h2>
                    <textarea
                        placeholder="Enter text to analyze for brainrot content..."
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded-lg mb-4 h-24"
                    />
                    <button
                        onClick={analyzeText}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
                    >
                        <Search size={18} />
            Analyze Text
          </button>

                    {analysis && (
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-700 rounded-lg p-3">
                                    <p className="text-sm text-gray-400">Total Score</p>
                                    <p className="text-2xl font-bold text-purple-400">{analysis.score}/20</p>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-3">
                                    <p className="text-sm text-gray-400">Detected Terms</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {analysis.analysis?.detectedTerms?.length || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-3">
                                    <p className="text-sm text-gray-400">Density</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {analysis.analysis?.density?.toFixed(1) || 0}%
                  </p>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-3">
                                    <p className="text-sm text-gray-400">Tier 1 Terms</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {analysis.analysis?.tier1Count || 0}
                                    </p>
                                </div>
                            </div>

                            {analysis.analysis?.detectedTerms?.length > 0 && (
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">Detected Terms:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.analysis.detectedTerms.map((term, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-purple-600 rounded-full text-sm"
                                            >
                                                {term.term} ({term.count}x, {term.weight}w)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.suggestions?.length > 0 && (
                                <div className="bg-yellow-900 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">Suggestions:</h3>
                                    <ul className="list-disc list-inside">
                                        {analysis.suggestions.map((suggestion, i) => (
                                            <li key={i} className="text-sm">{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Preset Terms Reference */}
                <div className="bg-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Preset Terms Reference</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {quickAddTerms.map((term, i) => (
                            <div key={i} className="bg-gray-700 rounded-lg p-2 text-sm">
                                <span className="font-medium">{term.term}</span>
                                <span className="text-gray-400 ml-2">
                                    ({term.weight}w, {term.category})
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bulk Import Modal */}
                {showBulkModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Bulk Import Terms</h2>
                                <button
                                    onClick={() => setShowBulkModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">
                                Format: term,weight,category (one per line)
                <br />
                Example: bussin,2.5,chaos
              </p>
                            <textarea
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                placeholder="deadass,2.5,chaos
ahh,2.0,chaos
shi,2.0,chaos"
                                className="w-full h-64 px-4 py-2 bg-gray-700 rounded-lg mb-4"
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={bulkImportTerms}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                                >
                                    Import All
                </button>
                                <button
                                    onClick={() => setShowBulkModal(false)}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlangDictionaryAdmin;