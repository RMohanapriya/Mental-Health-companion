const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const JournalEntry = require('../models/JournalEntry');
const { analyzeSentiment, generateChatResponse } = require('../services/sentimentService'); // Import generateChatResponse

// @route   POST api/chatbot
// @desc    Send a message to the chatbot and get a response (now with journal context)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { message } = req.body;

        // Fetch recent journal entries for the authenticated user
        const recentJournalEntries = await JournalEntry.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(5); // Limit to 5 entries to control token usage

        // Save user message and get its sentiment
        const userSentiment = await analyzeSentiment(message);
        const userChatMessage = new ChatMessage({
            user: req.user.id,
            message,
            isBot: false,
            sentiment: userSentiment,
        });
        await userChatMessage.save();

        // Get chatbot response using the new generateChatResponse function
        const botResponseText = await generateChatResponse(
            message,
            userSentiment.label,
            recentJournalEntries
        );
        const botSentiment = await analyzeSentiment(botResponseText); // Analyze bot's own response sentiment (optional)

        // Save chatbot response
        const botChatMessage = new ChatMessage({
            user: req.user.id,
            message: botResponseText,
            isBot: true,
            sentiment: botSentiment,
        });
        await botChatMessage.save();

        // Return both messages
        res.json([userChatMessage, botChatMessage]);
    } catch (err) {
        console.error('Error in chatbot route:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/chatbot/history
// @desc    Get chat history for a user
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const chatHistory = await ChatMessage.find({ user: req.user.id }).sort({ timestamp: 1 });
        res.json(chatHistory);
    } catch (err) {
        console.error('Error fetching chat history:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;