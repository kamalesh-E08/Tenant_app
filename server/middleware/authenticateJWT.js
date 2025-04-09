// middleware/authenticateJWT.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "qwertyuiop";

const authenticateJWT = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
    
            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Forbidden access" });
                }
                req.user = user;
                next();
            });
        } else {
            res.status(401).json({ message: "Unauthorized access" });
        }
    };

module.exports = authenticateJWT;
