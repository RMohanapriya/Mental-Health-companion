const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail'); // Import the email utility
const crypto = require('crypto'); // Node.js built-in module for cryptography

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use select('+password') to explicitly include the password field
        // because we set select: false in the User model schema
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/forgotpassword
// @desc    Request password reset (send email with token)
// @access  Public
router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User with that email does not exist' });
        }

        // Get reset token from User model method
        const resetToken = user.getResetPasswordToken();

        // Save the user with the new token and expiry
        await user.save({ validateBeforeSave: false }); // Disable validation to save token/expire fields

        // Create reset URL
        // In production, this should be your frontend's deployed URL
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
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ msg: 'Email could not be sent' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/resetpassword/:resettoken
// @desc    Reset password using token
// @access  Public
router.put('/resetpassword/:resettoken', async (req, res) => {
    const { password } = req.body;

    // Hash the incoming reset token to compare with the hashed token in DB
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() } // Token is valid and not expired
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save(); // Save the new password and clear token fields

        res.status(200).json({ success: true, msg: 'Password reset successful' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth
// @desc    Get logged in user (after token verification)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Use select('+password') to explicitly include the password field
        const user = await User.findById(req.user.id).select('-password'); // Exclude password for this route
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;