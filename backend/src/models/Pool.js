const mongoose = require('mongoose');

const PoolSchema = new mongoose.Schema({
    appId: {
        type: String,
        required: true,
        unique: true,
    },
    creator: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    contributionAmount: {
        type: Number,
        required: true,
    },
    members: [{
        type: String,
    }],
    dueDate: {
        type: Date, // New Field for Notifications
    },
}, { timestamps: true });

module.exports = mongoose.model('Pool', PoolSchema);
