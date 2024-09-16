const jwt = require('jsonwebtoken');
let JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {

    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token found" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Access Denied. Invalid token" });
    }
};

module.exports = fetchuser;
