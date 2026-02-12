const Pool = require('../models/Pool');
const User = require('../models/User');

// Create Pool (Modified to include dueDate)
exports.createPool = async (req, res) => {
    const { appId, creator, name, description, contributionAmount, dueDate } = req.body;

    try {
        const newPool = new Pool({
            appId,
            creator,
            name,
            description,
            contributionAmount,
            dueDate, // Save due date
            members: [creator]
        });

        await newPool.save();

        await User.findOneAndUpdate(
            { walletAddress: creator },
            { $push: { joinedPools: appId } }
        );

        res.status(201).json(newPool);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Pools (Existing)
exports.getPools = async (req, res) => {
    try {
        const pools = await Pool.find().sort({ createdAt: -1 });
        res.status(200).json(pools);
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

// Join Pool (Existing)
exports.joinPool = async (req, res) => {
    const { appId, walletAddress } = req.body;

    try {
        const pool = await Pool.findOne({ appId });
        if (!pool) return res.status(404).json({ error: 'Pool not found' });

        if (!pool.members.includes(walletAddress)) {
            pool.members.push(walletAddress);
            await pool.save();

            await User.findOneAndUpdate(
                { walletAddress },
                { $push: { joinedPools: appId } }
            );
        }

        res.status(200).json(pool);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
