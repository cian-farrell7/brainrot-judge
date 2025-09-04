// Brainrot Slang Dictionary System
export const BRAINROT_DICTIONARY = {
    // Tier 1: Maximum Brainrot (3.0+ weight)
    tier1: {
        'skibidi': { weight: 4.5, category: 'meme', variants: ['skibidi toilet', 'skibidi rizzler', 'skibidi aura'] },
        'ohio': { weight: 3.5, category: 'meme', variants: ['only in ohio', 'ohio sigma', 'ohio aura farm'] },
        'rizz': { weight: 4.0, category: 'trending', variants: ['rizzler', 'rizzington bear', 'rizzrael', 'rizzmastodon'] },
        'gyatt': { weight: 4.0, category: 'trending', variants: ['gyat', 'GYATTTT', 'gyattatron'] },

        // Aura system extended
        'aura': { weight: 4.0, category: 'trending', variants: ['aura points', '+999 aura', 'ultra aura'] },
        'aura farming': { weight: 4.5, category: 'trending', variants: ['aura harvest', 'aura industrial complex'] },
        'generational aura': { weight: 5.0, category: 'elite', variants: ['ancestral aura', 'ancient aura script'] },
        'aura debt': { weight: 4.5, category: 'elite', variants: ['aura bankruptcy', 'aura foreclosure'] },
        'aura collapse': { weight: 4.2, category: 'elite', variants: ['aura implosion'] },

        // Pen variants expanded
        'penjamin': { weight: 3.5, category: 'meme', variants: ['benjamin but pen', 'penjamin aura'] },
        'pennifer': { weight: 3.5, category: 'meme', variants: ['jennifer but pen', 'pennifer lo-penz'] },
        'penjamin franklin': { weight: 3.8, category: 'meme', variants: ['pen frank'] },
        'penjamin netanyah-pen': { weight: 4.0, category: 'chaos', variants: ['pen-yahu'] },

        // Gooning expansion
        'goon': { weight: 3.0, category: 'chaos', variants: ['gooning', 'gooned', 'goonarchist'] },
        'gooning': { weight: 3.5, category: 'chaos', variants: ['goon cave', 'goonmaxxing', 'goon ascension'] },
        'gooniverse': { weight: 3.8, category: 'chaos', variants: ['multigoonverse'] },

        // Misc chaotic peak
        'peaky blinder': { weight: 3.5, category: 'meme', variants: ['real peaky blinder hours'] },
        'skibidi sigma rizzler': { weight: 5.0, category: 'elite', variants: ['sigma skibidi aura king'] },
    },

    // Tier 2: High Brainrot (2.0-2.9 weight)
    tier2: {
        'fr fr': { weight: 2.5, category: 'chaos', variants: ['fr', 'frfr', 'on god fr'] },
        'no cap': { weight: 2.0, category: 'chaos', variants: ['nocap', '🚫🧢'] },
        'bussin': { weight: 2.8, category: 'chaos', variants: ['bussin bussin', 'bussin 9000'] },
        'sigma': { weight: 2.5, category: 'meme', variants: ['sigma male', 'sigma aura', 'sigma maxxing'] },
        'deadass': { weight: 2.5, category: 'chaos', variants: ['dead ahh', 'deadass aura'] },
        'ahh': { weight: 2.0, category: 'chaos', variants: ['ahhhh', 'ahh compilation', 'npc ahh'] },
        'shi': { weight: 2.0, category: 'chaos', variants: ['shii', 'shiii', 'shi on god'] },
        'fade': { weight: 2.5, category: 'chaos', variants: ['run the fade', 'aura fade'] },
        'run it': { weight: 2.0, category: 'chaos', variants: ['we runnin it', 'run it aura'] },
        'goober': { weight: 2.0, category: 'wholesome', variants: ['silly goober', 'goober maxxed'] },
        'aura check': { weight: 2.8, category: 'trending', variants: ['aura scan', 'npc aura check'] },
    },

    // Tier 3: Standard Brainrot (1.0-1.9 weight)
    tier3: {
        'npc': { weight: 1.5, category: 'meme', variants: ['npc behavior', 'npc script', 'npc update patch notes'] },
        'cope': { weight: 1.0, category: 'chaos', variants: ['copium', 'cope harder'] },
        'seethe': { weight: 1.0, category: 'chaos', variants: ['seething', 'seethe & mald'] },
        'mald': { weight: 1.5, category: 'chaos', variants: ['malding', 'maldmaxxing'] },
        'touch grass': { weight: 1.5, category: 'meme', variants: ['grass touched', 'grass deficiency'] },
        'juice': { weight: 1.5, category: 'chaos', variants: ['juiced', 'npc juice'] },
        'brainrot': { weight: 1.8, category: 'meta', variants: ['ultra brainrot', 'rotpilled'] },
    },

    // Emoji Brainrot (special)
    emojis: {
        '💀': { weight: 3.0, category: 'reaction', meaning: 'dead/dying of laughter' },
        '🧠': { weight: 2.0, category: 'meta', meaning: 'brain/brainrot reference' },
        '🥀': { weight: 2.5, category: 'aesthetic', meaning: 'sad/emo/dramatic' },
        '🧃': { weight: 2.0, category: 'reference', meaning: 'juice/childish/innocent' },
        '😭': { weight: 2.0, category: 'reaction', meaning: 'crying/overdramatic' },
        '🗿': { weight: 3.0, category: 'meme', meaning: 'stone face/chad/npc' },
        '🔥': { weight: 1.5, category: 'reaction', meaning: 'fire/lit' },
        '⚰️': { weight: 2.5, category: 'reaction', meaning: 'dead/rip aura' },
        '🤡': { weight: 2.0, category: 'reaction', meaning: 'clown/foolish' },
        '🥶': { weight: 2.5, category: 'reaction', meaning: 'cold aura/freeze rizz' },
        '🦅': { weight: 3.0, category: 'meta', meaning: 'american sigma aura (bald eagle rizz)' },
    }
};

// ===== SLANG DETECTION ENGINE =====
export class BrainrotSlangEngine {
    constructor() {
        this.dictionary = BRAINROT_DICTIONARY;
        this.compiledPatterns = this.compilePatterns();
    }

    compilePatterns() {
        const patterns = {};

        Object.entries(this.dictionary).forEach(([tier, terms]) => {
            if (tier === 'emojis') return;

            Object.entries(terms).forEach(([term, data]) => {
                const allTerms = [term, ...(data.variants || [])];
                const pattern = allTerms.map(t =>
                    t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                ).join('|');

                patterns[term] = {
                    regex: new RegExp(`\\b(${pattern})\\b`, 'gi'),
                    weight: data.weight,
                    category: data.category
                };
            });
        });

        return patterns;
    }

    analyzeText(text) {
        const analysis = {
            totalScore: 0,
            detectedTerms: [],
            categoryScores: {},
            emojiScore: 0,
            density: 0,
            tier1Count: 0,
            tier2Count: 0,
            tier3Count: 0
        };

        const lowerText = text.toLowerCase();
        const wordCount = text.split(/\s+/).length;

        // Check compiled patterns
        Object.entries(this.compiledPatterns).forEach(([term, data]) => {
            const matches = text.match(data.regex);
            if (matches) {
                const count = matches.length;
                const score = count * data.weight;

                analysis.totalScore += score;
                analysis.detectedTerms.push({
                    term,
                    count,
                    weight: data.weight,
                    category: data.category,
                    score
                });

                if (!analysis.categoryScores[data.category]) {
                    analysis.categoryScores[data.category] = 0;
                }
                analysis.categoryScores[data.category] += score;

                if (data.weight >= 3.0) analysis.tier1Count += count;
                else if (data.weight >= 2.0) analysis.tier2Count += count;
                else analysis.tier3Count += count;
            }
        });

        // Check emojis
        Object.entries(this.dictionary.emojis).forEach(([emoji, data]) => {
            const count = (text.match(new RegExp(emoji, 'g')) || []).length;
            if (count > 0) {
                const score = count * data.weight;
                analysis.emojiScore += score;
                analysis.totalScore += score;
                analysis.detectedTerms.push({
                    term: emoji,
                    count,
                    weight: data.weight,
                    category: 'emoji',
                    meaning: data.meaning,
                    score
                });
            }
        });

        // Calculate density
        const totalDetections = analysis.detectedTerms.reduce((sum, t) => sum + t.count, 0);
        analysis.density = wordCount > 0 ? (totalDetections / wordCount) * 100 : 0;

        // Sort detected terms by score
        analysis.detectedTerms.sort((a, b) => b.score - a.score);

        return analysis;
    }

    getSuggestions(currentText) {
        const analysis = this.analyzeText(currentText);
        const suggestions = [];

        if (analysis.totalScore < 20) {
            suggestions.push('Try adding some elite terms like "aura farming" or "generational aura"');
        }

        if (analysis.emojiScore === 0) {
            suggestions.push('Add some 💀 or 🧠 for extra brainrot energy');
        }

        if (!analysis.categoryScores.meme) {
            suggestions.push('Reference some memes like "ohio" or "skibidi"');
        }

        if (analysis.tier1Count === 0) {
            suggestions.push('Use high-tier brainrot terms for maximum chaos');
        }

        return suggestions;
    }
}

// ===== ENHANCED RATING CALCULATION =====
export function calculateBrainrotScore(text) {
    const engine = new BrainrotSlangEngine();
    const analysis = engine.analyzeText(text);

    // Base score from total brainrot detected
    let score = Math.min(analysis.totalScore, 20);

    // Bonus for high density
    if (analysis.density > 30) score = Math.min(score + 5, 20);

    // Bonus for tier 1 terms
    if (analysis.tier1Count > 2) score = Math.min(score + 3, 20);

    // Bonus for emoji usage
    if (analysis.emojiScore > 5) score = Math.min(score + 2, 20);

    // Bonus for category diversity
    const categoryCount = Object.keys(analysis.categoryScores).length;
    if (categoryCount > 3) score = Math.min(score + 2, 20);

    return {
        score: Math.round(score),
        analysis,
        suggestions: engine.getSuggestions(text)
    };

}
