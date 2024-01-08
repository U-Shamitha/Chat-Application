const mongoose = require('mongoose');

const User = mongoose.model(
    'User', 
    new mongoose.Schema({
        email: String,
        username: String,
        password: String,
    })
);

module.exports = User