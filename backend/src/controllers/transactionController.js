const Transaction = require('../models/Transaction');
const Pool = require('../models/Pool');

// Record New Transaction (Called by Frontend after Blockchain success)
exports.recordTransaction = async (req, res) => {
    const { txId, poolId, sender, amount, type } = req.body;

    try {
        const newTx = new Transaction({
            txId,
            poolId,
            sender,
            amount,
            type
        });

        await newTx.save();
        res.status(201).json(newTx);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Transactions for a Pool
exports.getPoolTransactions = async (req, res) => {
    const { poolId } = req.params;

    try {
        const txs = await Transaction.find({ poolId }).sort({ createdAt: -1 });
        res.status(200).json(txs);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
