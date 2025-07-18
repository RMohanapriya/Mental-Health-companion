const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    user: { // Link to the User who created this entry
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: { // The actual text of the journal entry
        type: String,
        required: true
    },
    mood: { // User's self-reported mood (e.g., 'happy', 'sad', 'neutral')
        type: String
    },
    sentiment: { // Results from sentiment analysis
        score: { type: Number },      // Numerical score (e.g., -1 to 1)
        magnitude: { type: Number },  // Strength of emotion
        label: { type: String }       // Categorical label (e.g., 'Positive', 'Negative', 'Neutral', 'Mixed')
    },
    date: { // Timestamp of the entry
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);