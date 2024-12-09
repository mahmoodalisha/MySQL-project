const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

    if (!token) {
        return res.status(401).json({ message: 'Token is missing or invalid' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user; // Attach the decoded user object to the request
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken; // Export the middleware
