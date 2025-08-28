import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from "../utils/redis-client.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({message: 'No token, authorization denied'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Check if token is active in Redis
        const tokenKey = `active_${decoded.id}`;
        const isActive = await redisClient.sIsMember(tokenKey, token);

        if (!isActive) {
            //return res.status(401).json({message: 'Token is not active (logged out)'});
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({message: 'Token is not valid', error: err.message});
    }
};