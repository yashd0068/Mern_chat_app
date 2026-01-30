const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');
const { upload } = require('../middleware/uploadMiddleware');

// Update profile with image upload
router.put('/profile',
    protect,
    upload.single('profilePic'),
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Delete old profile picture if exists
            if (req.file && user.profilePic && user.profilePic !== '') {
                const oldFilename = user.profilePic.replace('/uploads/', '');
                const oldPath = path.join(__dirname, '../uploads', oldFilename);

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            if (req.file) {
                user.profilePic = `/uploads/${req.file.filename}`;
            }

            if (req.body.name) user.name = req.body.name;
            if (req.body.bio) user.bio = req.body.bio;

            await user.save();

            res.json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic,
                    bio: user.bio,
                    followers: user.followers || [],
                    following: user.following || [],
                    online: user.online,
                    lastSeen: user.lastSeen
                }
            });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

// Search users
router.get('/search', protect, async (req, res) => {
    try {
        const { q } = req.query;
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ],
            _id: { $ne: req.user._id } // Exclude current user
        }).select('-password -__v');

        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user profile by ID
router.get('/:userId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password -__v')
            .populate('followers', 'name email profilePic online')
            .populate('following', 'name email profilePic online');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get current user profile
router.get('/me/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -__v')
            .populate('followers', 'name email profilePic online')
            .populate('following', 'name email profilePic online');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Follow/Unfollow user
router.put('/follow/:userId', protect, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (userToFollow._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot follow yourself'
            });
        }

        // Initialize arrays if they don't exist
        if (!currentUser.following) currentUser.following = [];
        if (!userToFollow.followers) userToFollow.followers = [];

        const isFollowing = currentUser.following.includes(userToFollow._id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== userToFollow._id.toString()
            );
            userToFollow.followers = userToFollow.followers.filter(
                id => id.toString() !== currentUser._id.toString()
            );
        } else {
            // Follow
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({
            success: true,
            following: !isFollowing,
            followersCount: userToFollow.followers.length,
            followingCount: currentUser.following.length,
            message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully'
        });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get followers list
router.get('/followers/list', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('followers', 'name email profilePic online bio')
            .select('followers');

        res.json({
            success: true,
            followers: user.followers || []
        });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get following list
router.get('/following/list', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('following', 'name email profilePic online bio')
            .select('following');

        res.json({
            success: true,
            following: user.following || []
        });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update online status
router.put('/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.online = req.body.online || false;
        user.lastSeen = Date.now();

        await user.save();

        res.json({
            success: true,
            online: user.online,
            lastSeen: user.lastSeen
        });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;