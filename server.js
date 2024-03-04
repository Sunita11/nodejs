const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
dotenv.config({path: "./config/config.env"});

// Connect to DB
connectDB();
// bootcamp routes
const bootcampRoutes = require("./routes/bootcamp");
const coursesRoutes = require("./routes/course");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middleware/errorHandler");


const app = express();
const PORT = process.env.PORT || 4000;

// body parser
app.use(express.json())
app.use(cookieParser());


// Dev logger
if(process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use("/api/v1/bootcamps", bootcampRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/auth", authRoutes);
// Error handler middleware
app.use(errorHandler);

const server = app.listen(PORT, ()=>console.info(`Server is running in ${process.env.NODE_ENV} mode on port: ${PORT}`));

process.on("unhandledRejection", (err, promise)=>{
    console.error(`Error: ${err.message}`);

    // Close server and exit process
    server.close(()=>process.exit(1));
})