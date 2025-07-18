const express = require('express');
const router = express.Router(); // Create a new router object
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating and verifying JWTs
const User = require('../models/User'); // Import the User model
const auth = require('../middleware/auth'); // Import the authentication middleware

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public (no authentication needed to register)
router.post('/register', async (req, res) => {
    // Destructure data from the request body
    const { username, email, password } = req.body;

    try {
        // Check if a user with the given email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create a new User instance
        user = new User({ username, email, password });

        // Hash the password
        const salt = await bcrypt.genSalt(10); // Generate a salt (random string)
        user.password = await bcrypt.hash(password, salt); // Hash the password with the salt

        // Save the new user to the database
        await user.save();

        // Create a JWT payload (contains user ID)
        const payload = {
            user: {
                id: user.id // Mongoose creates an 'id' virtual getter for '_id'
            }
        };

        // Sign the token (create the JWT)
        // The token expires in 1 hour (for demonstration, use longer in production)
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err; // If there's an error signing, throw it
            res.json({ token }); // Send the token back to the client
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
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Create and sign JWT if credentials are valid
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth
// @desc    Get logged in user (after token verification)
// @access  Private (requires authentication token)
router.get('/', auth, async (req, res) => {
    try {
        // req.user is populated by the auth middleware with the user's ID
        // Select all user fields except the password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;