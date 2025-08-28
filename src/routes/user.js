import express from 'express';
import path from 'path';

import {authMiddleware} from '../middleware/auth-middleware.js';
import {uploadFiles} from '../middleware/upload-middleware.js';
import {unlink} from "../utils/index.js";
import User from '../models/user.js';

const router = express.Router();

/**
 * GET /api/users/profile
 * Protected - returns profile of logged-in user
 */
router.get('/profile', authMiddleware, async (req, res) => {
    res.json({profile: req.user.profile, id: req.user._id, name: req.user.name, email: req.user.email});
});

/**
 * PUT /api/users/profile
 * Protected - update profile fields (bio, location, avatarUrl)
 * Accepts JSON with avatarUrl (external link) OR you can upload a file to /profile/avatar
 */
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const upload = uploadFiles('users', {fieldName: 'avatar'});
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({message: err.message});
            }

            const {bio, location, avatarUrl} = req.body;

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }

            user.profile.bio = bio ?? user.profile.bio;
            user.profile.location = location ?? user.profile.location;

            // File upload takes priority if present
            if (req.file) {
                // Remove the previous avatar if it exists and is a local file
                if (user.profile.avatarUrl && user.profile.avatarUrl.startsWith('/uploads/')) {
                    unlink(path.join(process.cwd(), user.profile.avatarUrl));
                }

                user.profile.avatarUrl = `/uploads/users/${req.file.filename}`;
            }
            // External URL only used if no file uploaded
            else if (typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
                user.profile.avatarUrl = avatarUrl.trim();
            }

            await user.save();
            res.json({message: 'Profile updated', profile: user.profile});
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error updating profile', error: err.message});
    }
});

/**
 * POST /api/users/profile/avatar
 * Protected - multipart/form-data with field 'avatar' (file)
 * Saves the uploaded image to /uploads and sets profile.avatarUrl to the local path
 */
router.post('/profile/avatar', authMiddleware, async (req, res) => {
    try {
        const upload = uploadFiles('users', {fieldName: 'avatar'});
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({message: err.message});
            }

            if (!req.file) {
                return res.status(400).json({message: 'No file uploaded'});
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }

            // Remove the previous avatar if it exists and is a local file
            if (user.profile.avatarUrl && user.profile.avatarUrl.startsWith('/uploads/')) {
                unlink(path.join(process.cwd(), user.profile.avatarUrl));
            }

            user.profile.avatarUrl = `/uploads/users/${req.file.filename}`;
            await user.save();

            res.json({message: 'Avatar uploaded', avatarUrl: user.profile.avatarUrl});
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error uploading avatar', error: err.message});
    }
});

export default router;
