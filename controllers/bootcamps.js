const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("./../utils/errorResponse");
const asyncHandler = require("./../middleware/async");
const geocoder = require("./../utils/geoCode");


// @desc: Get all bootcamps
// @route: GET /api/v1/bootcamps 
// @access: Public
exports.getAllBootcamps = asyncHandler( async (req, res, next) => {
    let query;
    const reqQuery = {...req.query};

    const { select, sort : sortQ } = req.query;

    const removeFields = ["select", "sort", "limit", "page"];

    removeFields.forEach((field) => delete reqQuery[field]);
    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // create operators ($gt, $gte etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, (match)=>`$${match}`);

    try {
        // convert string to JSON object
        query =  Bootcamp.find(JSON.parse(queryStr));
    } catch(err){
        console.error(err)
    }

    // Select fields
    if(select) {
        const fields = select.split(",").join(" ");
        query = query.select(fields);
    }

    // Sort
    let sortBy = "-createdAt";
    if(sortQ) {
        sortBy = sortQ.split(",").join(" ");
    }
    query = query.sort(sortBy);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const startIndex = (page - 1 ) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(skip).limit(limit);

    // Executing query
    const bootcamps = await query;

    const pagination = {};
    if(endIndex < total) {
        pagination.next={
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev={
            page: page - 1,
            limit
        }
    }

    res.status(200).json({success: true, count: bootcamps.length, pagination, total, data: bootcamps})
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
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`DB Error.`, 400));
    }

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