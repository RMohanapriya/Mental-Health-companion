const jwt = require('jsonwebtoken'); // Used to verify JSON Web Tokens

// This middleware function will be used to protect routes
module.exports = function(req, res, next) {
    // 1. Get token from header
    // The token is usually sent in the 'x-auth-token' header
    const token = req.header('x-auth-token');

    // 2. Check if not token
    // If no token is provided, the user is not authorized
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify token
    // If a token exists, try to verify it
    try {
        // jwt.verify() decodes the token using the secret key
        // If valid, it returns the payload (which contains user.id)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user information to the request object
        // So, any subsequent route handler can access req.user.id
        req.user = decoded.user;
        next(); // Move to the next middleware or route handler
    } catch (err) {
        // If token verification fails (e.g., token is expired or invalid)
        res.status(401).json({ msg: 'Token is not valid' });
    }
};