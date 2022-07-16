const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: 'string', require: true },
    passwordHash: { type: 'string', require: true }
});

const User = mongoose.model("user", userSchema);

module.exports = User;