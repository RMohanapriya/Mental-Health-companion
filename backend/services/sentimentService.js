const axios = require('axios');

const apiKey = process.env.GOOGLE_API_KEY || "";

// Function for sentiment analysis (used for journal and user chat inputs)
const analyzeSentiment = async (text) => {
    try {
        if (!apiKey) {
            console.warn("API Key not provided for sentiment analysis. Returning neutral by default.");
            return { score: 0, magnitude: 0, label: 'Neutral' };
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const promptContent = `Analyze the sentiment of the following text and provide a single word label (Positive, Negative, Neutral, or Mixed) and a sentiment score between -1 and 1. If you cannot determine a clear sentiment, default to Neutral with a score of 0.
        Example: "I love this product!" -> Positive, 0.9
        Example: "I am feeling a bit down today." -> Negative, -0.7
        Example: "The weather is okay." -> Neutral, 0.1
        Example: "It was good but also very challenging." -> Mixed, 0.0

        Text: "${text}"
        `;

        const payload = {
            contents: [{ role: "user", parts: [{ text: promptContent }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "label": { "type": "STRING" },
                        "score": { "type": "NUMBER" }
                    },
                    "propertyOrdering": ["label", "score"]
                }
            }
        };

        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const result = response.data;

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonString = result.candidates[0].content.parts[0].text;
            const parsedJson = JSON.parse(jsonString);

            const label = parsedJson.label || 'Neutral';
            let score = parseFloat(parsedJson.score);
            if (isNaN(score)) score = 0;

            return {
                score: score,
                magnitude: Math.abs(score),
                label: label
            };
        } else {
            console.warn("Unexpected response structure from Google Gemini API for sentiment analysis. Defaulting to neutral.");
            return { score: 0, magnitude: 0, label: 'Neutral' };
        }
    } catch (error) {
        console.error('Error in analyzeSentiment API call:', error.response?.data || error.message);
        return { score: 0, magnitude: 0, label: 'Neutral' };
    }
};

// New function specifically for generating chatbot responses with journal context
const generateChatResponse = async (userMessage, userSentimentLabel, journalEntries) => {
    try {
        if (!apiKey) {
            console.warn("API Key not provided for chat response. Returning generic message.");
            return "I'm sorry, I cannot respond right now. My AI is unavailable.";
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        let journalContext = "";
        if (journalEntries && journalEntries.length > 0) {
            const formattedEntries = journalEntries.map(entry =>
                `- On ${new Date(entry.date).toLocaleDateString()}, with a ${entry.sentiment?.label || 'N/A'} sentiment, you wrote: "${entry.content.substring(0, 150)}..."`
            ).join('\n');

            journalContext = `\n\nHere are some of your recent journal entries for additional context:\n${formattedEntries}\n\n`;
        }

        const prompt = `You are a highly empathetic, supportive, and non-judgmental mental health companion chatbot.
Your primary goal is to provide a comforting and understanding presence.
You should listen carefully to the user's current message and consider their recent journal entries to offer a more personalized and relevant response.
Avoid giving medical advice, making diagnoses, or acting as a therapist.
Keep your responses concise, typically 1-3 sentences.
If you refer to journal entries, do so generally (e.g., "I noticed you've been reflecting on X lately") rather than quoting directly.
Focus on validating feelings, offering encouragement, or gently prompting further self-reflection.

User's current message (sentiment: ${userSentimentLabel}): "${userMessage}"
${journalContext}

Your empathetic response:`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "text/plain" // We want a plain text response for the chat
            }
        };

        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const result = response.data;

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.warn("Unexpected response structure from Google Gemini API for chat response. Returning fallback message.");
            return "I'm sorry, I'm having trouble understanding right now. Can you rephrase?";
        }
    } catch (error) {
        console.error('Error in generateChatResponse API call:', error.response?.data || error.message);
        return "I'm sorry, I'm experiencing some technical difficulties and cannot respond at the moment.";
    }
};

module.exports = { analyzeSentiment, generateChatResponse };