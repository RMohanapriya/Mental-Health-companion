const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import auth middleware to protect routes
const JournalEntry = require('../models/JournalEntry'); // Import JournalEntry model
const { analyzeSentiment } = require('../services/sentimentService'); // Import sentiment analysis service

// @route   POST api/journals
// @desc    Create a journal entry
// @access  Private (requires authentication)
router.post('/', auth, async (req, res) => {
    try {
        const { content, mood } = req.body;

        // Perform sentiment analysis on the journal content
        const sentimentResult = await analyzeSentiment(content);

        // Create a new journal entry instance
        const newEntry = new JournalEntry({
            user: req.user.id, // User ID comes from the auth middleware
            content,
            mood,
            sentiment: sentimentResult, // Store the sentiment analysis results
        });

        // Save the entry to the database
        const entry = await newEntry.save();
        res.json(entry); // Respond with the saved entry
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/journals
// @desc    Get all journal entries for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find all entries belonging to the authenticated user, sorted by date descending
        const entries = await JournalEntry.find({ user: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/journals/:id
// @desc    Update a journal entry by ID
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { content, mood } = req.body;
        let entry = await JournalEntry.findById(req.params.id); // Find the entry by ID

        // Check if entry exists
        if (!entry) return res.status(404).json({ msg: 'Journal entry not found' });

        // Check if the authenticated user is the owner of the entry
        if (entry.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Re-run sentiment analysis on updated content
        const sentimentResult = await analyzeSentiment(content);

        // Update entry fields
        entry.content = content;
        entry.mood = mood;
        entry.sentiment = sentimentResult; // Update sentiment as well
        await entry.save(); // Save the updated entry

        res.json(entry); // Respond with the updated entry
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/journals/:id
// @desc    Delete a journal entry by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let entry = await JournalEntry.findById(req.params.id); // Find the entry by ID

        // Check if entry exists
        if (!entry) return res.status(404).json({ msg: 'Journal entry not found' });

        // Check if the authenticated user is the owner of the entry
        if (entry.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete the entry
        await JournalEntry.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Journal entry removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;