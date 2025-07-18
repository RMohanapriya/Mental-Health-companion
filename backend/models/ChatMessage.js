const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    user: { // Link to the User who sent/received this message
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: { // The text of the chat message
        type: String,
        required: true
    },
    isBot: { // True if the message is from the chatbot, false if from the user
        type: Boolean,
        default: false
    },
    sentiment: { // Sentiment of the user's message (optional for bot's message)
        score: { type: Number },
        magnitude: { type: Number },
        label: { type: String }
    },
    timestamp: { // Timestamp of the message
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);