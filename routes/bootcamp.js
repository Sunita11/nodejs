const express = require("express");
const router = express.Router();
const {
    getAllBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp } = require("../controllers/bootcamps");

router.route("/").get(getAllBootcamps).post(createBootcamp);

router.route("/:id").get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;