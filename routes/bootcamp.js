const express = require("express");
const multer  = require('multer');
const Bootcamp = require("./../models/Bootcamp");
const advancedResults = require("./../middleware/advancedResults");
const { protect } = require("./../middleware/auth");


// Set multer file storage folder
const upload = multer({
    dest: process.env.FILE_UPLOAD_PATH,
    rename: function (fieldname, filename) {
      return fieldname;
    },
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting ...')
    },
    limits: {
      files: 1
    },
    onFileUploadComplete: function (file) {
      console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
  });

const {
    getAllBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
 } = require("../controllers/bootcamps");


// Include other resources

const courseRouter = require("./course");

const router = express.Router();

router.use("/:bootcampId/courses", courseRouter);

router.route("/").get(advancedResults(Bootcamp, "courses"), getAllBootcamps).post(protect, createBootcamp);

router.route("/:id").get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp);

router.route("/:id/photo").put(upload.single("file"), bootcampPhotoUpload);

router.route("/radius/:zipcode/:distance").get(getBootcampInRadius)

module.exports = router;