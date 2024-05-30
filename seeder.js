const fs = require("fs");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config({path: "./config/config.env"});

// models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const Users = require("./models/User");
const Reviews = require("./models/Review");


// connect DB
connectDB();

// Read JSON file
const bootcampsData = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8"));
const coursesData = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8"));
const usersData = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8"));
const reviewsData = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8"));

// Import into DB
const importData = async () => {
    try {
        await Users.create(usersData);
        await Bootcamp.create(bootcampsData);
        await Course.create(coursesData);
        await Reviews.create(reviewsData);

        console.log("Data imported ");
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

// Delete into DB
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await Users.deleteMany();
        await Reviews.deleteMany();
        console.log("Data deleted... ");
        process.exit();
    } catch (error) {
        console.error(error);
    }
}
if(process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}