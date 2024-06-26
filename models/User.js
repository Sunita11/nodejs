const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

// Encrypt password using bryptjs

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    // Hash token and set to resetPasswordToken field
    const token = crypto.createHash("sha256").update(resetToken).digest("hex");;
    this.resetPasswordToken = token;

    return token;
}

module.exports = mongoose.model("User", UserSchema);