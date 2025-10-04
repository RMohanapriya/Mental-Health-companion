const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Install this package: npm install express-async-handler
const asyncHandler = require('express-async-handler'); 

// --- VERIFY THESE PATHS ---
const User = require('../models/User');
const auth = require('../middleware/auth'); // Should be '../middleware/auth'
const sendEmail = require('../utils/sendEmail'); 
// --------------------------


// Utility function to promisify jwt.sign (cleaner than callbacks in async/await)
const signToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
};


// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        res.status(400);
        throw new Error('User already exists');
    }

    user = new User({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };
    const token = await signToken(payload);
    
    // Using 201 status for resource creation
    res.status(201).json({ token });
}));


// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Use select('+password') to explicitly include the password field
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
        res.status(400);
        throw new Error('Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid Credentials');
    }

    const payload = { user: { id: user.id } };
    const token = await signToken(payload);
    
    res.json({ token });
}));


// @route   POST api/auth/forgotpassword
// @desc    Request password reset (send email with token)
// @access  Public
router.post('/forgotpassword', asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User with that email does not exist');
    }

    // This method must be defined on your User Mongoose Schema
    const resetToken = user.getResetPasswordToken(); 

    // Save the user with the new token and expiry
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password:</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        <p>This link is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Mental Health App: Password Reset Request',
            html: message
        });

        res.status(200).json({ success: true, msg: 'Password reset email sent' });
    } catch (err) {
        console.error('Error sending email:', err.message);
        // Clear token fields if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false }); 
        res.status(500);
        throw new Error('Email could not be sent');
    }
}));


// @route   PUT api/auth/resetpassword/:resettoken
// @desc    Reset password using token
// @access  Public
router.put('/resetpassword/:resettoken', asyncHandler(async (req, res) => {
    const { password } = req.body;

    // Hash the incoming URL token to compare with the hashed token in DB
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() } // Token is valid and not expired
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); 

    res.status(200).json({ success: true, msg: 'Password reset successful' });
}));


// @route   GET api/auth
// @desc    Get logged in user (after token verification)
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
    // req.user.id is attached by the 'auth' middleware
    // Exclude password field
    const user = await User.findById(req.user.id).select('-password'); 
    res.json(user);
}));

module.exports = router;