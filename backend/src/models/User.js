const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        default: 'Student',
    },
    email: {
        type: String,
    },
    joinedPools: [{
        type: String, // Pool IDs (Application IDs)
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
