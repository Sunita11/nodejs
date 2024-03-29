const asyncHandler = require("./../middleware/async");
const Course = require("../models/Course");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("./../models/Bootcamp");


// @desc: Get all courses
// @route: GET /api/v1/courses
//  @route: GET /api/v1/bootcamps/:bootcampId/courses
// @access: Public
exports.getAllCourses = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId) {
        const courses = Course.find({ bootcamp: req.params.bootcampId });
        return res.status(200).json({success: true, count: courses.length, data: courses})
    } else {
        res.status(200).json(res.advancedResults)
    }

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
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id: ${req.params.bootcampId}`, 404));
    }

    // Make sure it is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorised to add a course to ${bootcamp._id}`, 401)
        )
    }

    const course = await Course.create(req.body);
    res.status(200).json({success: true, data: course})
});

// @desc: Update a courses
// @route: PUT /api/v1/courses/:id
// @access: Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    

    let course = await Course.findById(req.params.id);
    if(!course) {
        return next(new ErrorResponse(`No course with id: ${req.params.id}`, 404));
    }

    // Make sure it is authorised owner
    if(course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorised to update a course to ${course._id}`, 401)
        )
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body).populate({
        path: "bootcamp",
        select: "name description"
    });

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

    // Make sure it is authorised owner
    if(course.user.toString() !== req.user.id && req.user.role !== "admin") {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorised to delete a course to ${course._id}`, 401)
        )
    }
    
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({success: true})
});