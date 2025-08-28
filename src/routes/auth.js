import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import {redisClient} from '../utils/redis-client.js';
import {getAccessTokenByUserId} from "../utils/index.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * body: { name, email, password, bio?, location?, avatarUrl? }
 */
router.post('/register', async (req, res) => {
    try {
        const {name, email, password, bio, location, avatarUrl} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({message: 'name, email and password are required'});
        }

        const existing = await User.findOne({email});
        if (existing) {
            return res.status(409).json({message: 'Email already registered'});
        }

        const user = new User({
            name,
            email,
            password,
            profile: {
                bio: bio || '',
                location: location || '',
                avatarUrl: avatarUrl || ''
            }
        });

        await user.save();

        const token = getAccessTokenByUserId(user._id);
        // Store token in Redis Set for this user
        /*const tokenKey = `active_${user._id}`;
        await redisClient.sAdd(tokenKey, token);
        await redisClient.expire(tokenKey, 7 * 24 * 60 * 60); // 7 days TTL*/

        res.status(201).json({
            token,
            user: {id: user._id, name: user.name, email: user.email, profile: user.profile}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error registering user', error: err.message});
    }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) return res.status(400).json({message: 'email and password required'});

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const valid = await user.matchPassword(password);

        if (!valid) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const token = getAccessTokenByUserId(user._id);
        // Store token in Redis Set for this user
        /*const tokenKey = `active_${user._id}`;
        await redisClient.sAdd(tokenKey, token);
        await redisClient.expire(tokenKey, 7 * 24 * 60 * 60); // 7 days TTL*/

        res.json({
            token,
            user: {id: user._id, name: user.name, email: user.email, profile: user.profile}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error logging in', error: err.message});
    }
});

router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) {
            return res.status(400).json({message: 'No token provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await redisClient.sRem(`active_${decoded.id}`, token);

        res.json({message: 'Logged out successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error logging out', error: err.message});
    }
});

export default router;