const asyncHandler = require("./../middleware/async");
const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("./../models/Bootcamp");


// @desc: Get all courses
// @route: GET /api/v1/courses
//  @route: GET /api/v1/bootcamps/:bootcampId/courses
// @access: Public
exports.getAllCourses = asyncHandler(async (req, res, next) => {
    let query;

    if(req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate({
            path: "bootcamp",
            select: "name description"
        });
    }

    const courses = await query;

    res.status(200).json({success: true, count: courses.length, data: courses})
});


// @desc: Get a courses
// @route: GET /api/v1/courses/:courseId
// @access: Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const courses = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "name description"
    });

    if(!courses) {
        return next(new ErrorResponse(`No course with id: ${req.params.id}`, 404));
    }

    res.status(200).json({success: true, count: courses.length, data: courses})
});

// @desc: Add a courses
// @route: POST /api/v1/bootcamps/:bootcampId/courses
// @access: Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id: ${req.params.bootcampId}`, 404));
    }

    const course = await Course.create(req.body);
    res.status(200).json({success: true, data: course})
});

// @desc: Update a courses
// @route: PUT /api/v1/courses/:id
// @access: Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if(!course) {
        return next(new ErrorResponse(`No course with id: ${req.params.id}`, 404));
    }

     course = await Course.findByIdAndUpdate(req.params.id, req.body).populate({
        path: "bootcamp",
        select: "name description"
    });

    console.log("course: ", course)

    res.status(200).json({success: true, data: course})
});

// @desc: Delete a courses
// @route: DELETE /api/v1/courses/:id
// @access: Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`No course with id: ${req.params.id}`, 404));
    }
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({success: true})
});