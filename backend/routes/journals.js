// src/routes/journalRoutes.js

const express = require('express');
const router = express.Router();
// Use the 'asyncHandler' utility to handle try/catch automatically
const asyncHandler = require('express-async-handler'); 
const auth = require('../middleware/auth'); // Corrected path (up one level to 'src', then down to 'middleware')
const JournalEntry = require('../models/JournalEntry'); 
const { analyzeSentiment } = require('../services/sentimentService'); 

// @route   POST api/journals
// @desc    Create a journal entry
// @access  Private
router.post('/', auth, asyncHandler(async (req, res) => {
    const { content, mood } = req.body;

    // Optional: Basic validation check (similar to your first version)
    if (!content) {
        res.status(400);
        throw new Error('Journal content is required');
    }

    const sentimentResult = await analyzeSentiment(content);

    const newEntry = new JournalEntry({
        user: req.user.id, // User ID is guaranteed by the 'auth' middleware
        content,
        mood,
        sentiment: sentimentResult,
    });

    const entry = await newEntry.save();
    res.status(201).json(entry);
}));

// ----------------------------------------------------------------------

// @route   GET api/journals
// @desc    Get all journal entries for the authenticated user
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
    const entries = await JournalEntry.find({ user: req.user.id }).sort({ date: -1 });
    res.json(entries);
}));

// ----------------------------------------------------------------------

// @route   PUT api/journals/:id
// @desc    Update a journal entry by ID
// @access  Private
router.put('/:id', auth, asyncHandler(async (req, res) => {
    const { content, mood } = req.body;
    let entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
        res.status(404);
        throw new Error('Journal entry not found');
    }

    // Check user ownership
    if (entry.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const sentimentResult = await analyzeSentiment(content);

    // Update using findByIdAndUpdate for efficiency
    const updatedEntry = await JournalEntry.findByIdAndUpdate(
        req.params.id,
        { content, mood, sentiment: sentimentResult },
        { new: true, runValidators: true } 
    );

    res.json(updatedEntry);
}));

// ----------------------------------------------------------------------

// @route   DELETE api/journals/:id
// @desc    Delete a journal entry by ID
// @access  Private
router.delete('/:id', auth, asyncHandler(async (req, res) => {
    let entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
        res.status(404);
        throw new Error('Journal entry not found');
    }

    // Check user ownership
    if (entry.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Delete the entry
    await JournalEntry.deleteOne({ _id: req.params.id });

    // Status 200 is acceptable for a successful deletion
    res.status(200).json({ msg: 'Journal entry removed' });
}));

module.exports = router;