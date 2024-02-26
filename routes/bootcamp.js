const express = require("express");
const {
    getAllBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius
 } = require("../controllers/bootcamps");


// Include other resources

const courseRouter = require("./course");

const router = express.Router();

router.use("/:bootcampId/courses", courseRouter);

router.route("/").get(getAllBootcamps).post(createBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);
router.route("/radius/:zipcode/:distance").get(getBootcampInRadius)

module.exports = router;