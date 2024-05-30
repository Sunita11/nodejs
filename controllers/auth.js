const crypto = require("crypto");
const ErrorResponse = require("./../utils/errorResponse");
const asyncHandler = require("./../middleware/async");
const User = require("../models/User");
const sendEmail = require("./../utils/sendEmail");



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

// @desc: Reset Pasword
// @route: POST /api/v1/auth/user 
// @access: Private
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
});

// @desc: Get current loggen In User
// @route: POST /api/v1/auth/resetpassword/:resettoken 
// @access: Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // get hashed token
    const resetHashToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");

    const user = await User.findOne({resetPasswordToken: req.params.resettoken, resetPasswordExpire: {$gt: Date.now()}});

    if(!user) {
        return next(new ErrorResponse("Invalid token"), 400)
    }

    // set the new password

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc: Forgot password
// @route: POST /api/v1/auth/forgotpassword 
// @access: Private
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorResponse("There is no user with that email", 404))
    }

    const resetToken = user.getResetPasswordToken();
    
    await user.save();

    const resetLink = `${req.protocol}://${req.get("host")}/api/v1/auth/resetPassword/${resetToken}`;

    const message = `You are recieving this email because you requested to reset the password. Please make a PUT request to: \n\n ${resetLink}`;

    try {
        await sendEmail({
            email: req.body.email,
            subject: "Password rest token",
            message
        });

        return res.status(200).json({ success: true, data: "Email sent" });
    } catch (error) {
        console.error(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ValidityState:false});

        return next(new ErrorResponse("Email could not be sent", 500))
    }
});

// @desc: Update Details
// @route: POST /api/v1/auth/updatedetails 
// @access: Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToBeUpdated = {
        name: req.body.name,
        email: req.body.email
    }
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToBeUpdated, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
});

// @desc: Update Password
// @route: POST /api/v1/auth/updatepassword
// @access: Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.matchPassword(req.body.currentPassword);

    if(!isPasswordMatched) {
        return next(new ErrorResponse("Password is incorrect", 401))
    }

    user.password = req.body.newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
});