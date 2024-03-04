const path = require("path");
const ErrorResponse = require("./../utils/errorResponse");
const asyncHandler = require("./../middleware/async");
const User = require("../models/User");


// @desc: Register new user
// @route: POST /api/v1/auth/register 
// @access: Public

exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({name, email, password, role});

    const token = user.getSignedJwtToken();
    res.status(200).json({success: true, token: token})
});

// @desc: Login user
// @route: POST /api/v1/auth/register 
// @access: Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate user email & password

    if(!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400));
    }

    // check user
    const user = await User.findOne({email}).select("+password");

    if(!user) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Match user entered password to hashed password in DB
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Create and send token, cookie with the token
    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // 30 days 
        httpOnly: true
    };

    if(process.env.NODE_ENV === "production") {
        options.secure = true;
    }
    res.status(statusCode).cookie("token", token, options).json({
        success: true, token: token
    });
}


// @desc: Get current loggen In User
// @route: POST /api/v1/auth/user 
// @access: Private
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
});