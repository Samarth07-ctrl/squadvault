require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-expense-pool')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Campus Expense Pool API is running');
});

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/pools', require('./src/routes/poolRoutes'));
app.use('/api/contract', require('./src/routes/contractRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
