const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
dotenv.config({path: "./config/config.env"});

// Connect to DB
connectDB();
// bootcamp routes
const bootcampRoutes = require("./routes/bootcamp");


const app = express();

// body parser
app.use(express.json())

// Dev logger
if(process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}


app.use("/api/v1/bootcamps", bootcampRoutes);
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, ()=>console.info(`Server is running in ${process.env.NODE_ENV} mode on port: ${PORT}`));

process.on("unhandledRejection", (err, promise)=>{
    console.error(`Error: ${err.message}`);

    // Close server and exit process
    server.close(()=>process.exit(1));
})