const fs = require("fs");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config({path: "./config/config.env"});

// models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

// connect DB
connectDB();

// Read JSON file
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8"));

const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8"));

// Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
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
        await Bootcamp.deleteMany();
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