const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    txId: {
        type: String,
        required: true,
        unique: true,
    },
    poolId: {
        type: String, // App ID
        required: true,
    },
    sender: {
        type: String, // Wallet Address
        required: true,
    },
    amount: {
        type: Number, // In MicroAlgos
        required: true,
    },
    type: {
        type: String,
        enum: ['CONTRIBUTION', 'WITHDRAWAL', 'PENALTY'],
        default: 'CONTRIBUTION',
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED'],
        default: 'CONFIRMED',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
