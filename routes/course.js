const express = require("express");
const router = express.Router({
    mergeParams: true
});

const Course = require("./../models/Course");
const advancedResults = require("./../middleware/advancedResults");

const {
    getAllCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require("./../controllers/courses");

router.route("/").get(advancedResults(Course, {
    path: "bootcamp",
    select: "name description"
}), getAllCourses).post(addCourse);
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;