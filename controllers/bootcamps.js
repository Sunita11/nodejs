const Bootcamp = require("../models/Bootcamp");

// @desc: Get all bootcamps
// @route: GET /api/v1/bootcamps 
// @access: Public
exports.getAllBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})
    } catch(e) {
        res.status(400).json({success: false, msg: e.message})
    }
}


// @desc: Get single bootcamp
// @route: GET /api/v1/bootcamps/:id
// @access: Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            res.status(400).json({success: false, data: null})
        }
        res.status(200).json({success: true, data: bootcamp})
    } catch(e) {
        res.status(400).json({success: false, msg: e.message})
    }
}

// @desc: Create new bootcamp
// @route: POST /api/v1/bootcamps
// @access: Private
exports.createBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({success: true, data: bootcamp})
    } catch(e) {
        res.status(400).json({success: false, msg: e.message})
    }
}

// @desc: Update bootcamp
// @route: PUT /api/v1/bootcamps/:id
// @access: Private
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!bootcamp) {
            res.status(400).json({ success: false, msg: "Bootcamp could not be updated."});
        }

        res.status(200).json({success: true, data: bootcamp})
    } catch (error) {
        res.status(400).json({ success: false, msg: error.message})
    }
    res.status(200).json({success: true, msg: `Updated bootcamp ${req.params.id}`})
}

// @desc: Delete bootcamp
// @route: DELETE /api/v1/bootcamps/:id
// @access: Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if(!bootcamp) {
            res.status(400).json({success: false, msg: "DB error."});
        }

        res.status(200).json({success: true})
    } catch (error) {
        res.status(400).json({success: false, msg: "Something went wrong."})
    }
}