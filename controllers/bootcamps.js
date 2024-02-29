const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("./../utils/errorResponse");
const asyncHandler = require("./../middleware/async");
const geocoder = require("./../utils/geoCode");


// @desc: Get all bootcamps
// @route: GET /api/v1/bootcamps 
// @access: Public
exports.getAllBootcamps = asyncHandler( async (req, res, next) => {
    res.status(200).json(res.advancedResults)
});


// @desc: Get single bootcamp
// @route: GET /api/v1/bootcamps/:id
// @access: Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcmap with id as ${req.params.id} is not found`, 404));
    }
    res.status(200).json({success: true, data: bootcamp})
});

// @desc: Create new bootcamp
// @route: POST /api/v1/bootcamps
// @access: Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({success: true, data: bootcamp})
});

// @desc: Update bootcamp
// @route: PUT /api/v1/bootcamps/:id
// @access: Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });


    if(!bootcamp) {
        return next(new ErrorResponse(`Resource could not be updated.`, 400));
    }

    res.status(200).json({success: true, data: bootcamp})
});

// @desc: Delete bootcamp
// @route: DELETE /api/v1/bootcamps/:id
// @access: Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`DB Error.`, 400));
    }

    await bootcamp.deleteOne({id: req.params.id});

    res.status(200).json({success: true})
});

// @desc: Get bootcamp within radius
// @route: GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access: Private
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // get lat/lang
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // calc radius using radians
    // Divide distance by earth's radius
    // Earth's radius: 3,963 mi / 6,378 km
    const radius  = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius]}}
    });

    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})
});

// @desc: Upload photo
// @route: PUT /api/v1/bootcamps/:id
// @access: Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);


    if(!bootcamp) {
        return next(new ErrorResponse(`Resource could not be updated.`, 400));
    }

    if(!req.file){
        return next(new ErrorResponse(`Please upload a file.`, 400));
    }

    const file = req.file;

    if(!file.mimetype.startsWith("image")) {
        return next(new ErrorResponse(`Please upload an image file.`, 400));
    }

    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD/1000}KB.`, 400));
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.originalname).ext}`;
console.log("file: ", file)
    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

    res.status(200).json({
        success: true,
        data: file.name
    });
});