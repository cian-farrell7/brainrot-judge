// AI Engine Module
export async function getAIEnhancedRatings(caption, imageUrl, env) {
    const textAnalysis = await analyzeTextWithAI(caption, env);

    return {
        chaos: calculateAIChaosScore(textAnalysis),
        absurdity: calculateAIAbsurdityScore(textAnalysis),
        memeability: calculateAIMemeabilityScore(textAnalysis),
        caption_quality: calculateAICaptionQuality(textAnalysis),
        unhinged: calculateAIUnhingedScore(textAnalysis),
        confidence: textAnalysis.confidence || 0.7
    };
}

async function analyzeTextWithAI(caption, env) {
    try {
        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
            prompt: `Analyze this text for internet meme culture: "${caption}"
            Rate (0-10): slang usage, meme references, randomness, trending topics, brainrot level.
            Respond in JSON format only.`,
            max_tokens: 150
        });

        return parseAIResponse(response);
    } catch (error) {
        console.error('AI analysis error:', error);
        return { slangScore: 5, memeReferences: 5, randomness: 5, confidence: 0.3 };
    }
}

// Add all helper functions from the AI integration artifact