const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add an email address"],
        unique: true,
        match: [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Please enter a valid email ID."]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password length must be at least 6 characters."],
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("User", UserSchema);