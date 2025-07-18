const mongoose = require('mongoose');
const crypto = require('crypto'); // Node.js built-in module for cryptography

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false // Don't return password by default in queries
    },
    date: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String, // Stores the hashed reset token
    resetPasswordExpire: Date // Stores the expiration date for the token
});

// Method to generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    // We hash it before saving to DB for security, so even if DB is compromised, token isn't plain text
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (e.g., 10 minutes from now)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken; // Return the unhashed token to send to the user via email
};

module.exports = mongoose.model('User', UserSchema);