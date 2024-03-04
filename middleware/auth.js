const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("./../utils/errorResponse");
const User = require("../models/User");

exports.protect = asyncHandler( async (req, res, next) => {
    let token;
    const { headers, cookies } = req;
    if(headers.authorization && headers.authorization.startsWith("Bearer")) {
        token = headers.authorization.split(" ")[1];
    }
    /*  else if(cookies.token) {
        token = cookies.token;
    } */

    // Make sure token exists
    if(!token) {
        return next(new ErrorResponse("Not authorize to access this route", 401));
    }

    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded: ", decoded);

        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        return next(new ErrorResponse("Not authorize to access this route", 401)); 
    }
})