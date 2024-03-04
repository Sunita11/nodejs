const express = require("express");
const router = express.Router({
    mergeParams: true
});

const Course = require("./../models/Course");
const advancedResults = require("./../middleware/advancedResults");
const { authorize, protect } = require("./../middleware/auth");

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
}), getAllCourses).post(protect, authorize(["publisher", "admin"]), addCourse);
router.route("/:id").get(getCourse).put(protect, authorize(["publisher", "admin"]), updateCourse).delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;