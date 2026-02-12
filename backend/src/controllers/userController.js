const User = require('../models/User');

// Create or Get User by Wallet Address
exports.loginUser = async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    try {
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = new User({ walletAddress });
            await user.save();
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.params.walletAddress });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
