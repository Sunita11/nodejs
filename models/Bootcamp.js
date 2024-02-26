const mongoose = require("mongoose");
const slugify = require("slugify");
const geoCoder = require("./../utils/geoCode");

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        unique: true,
        trim: true,
        maxlength: [50, "Name cannot be more than 50 character"]
    },
    slug: String,
    description: {
        type: String,
        required: [true, "Please add a description"],
        maxlength: [500, "Description cannot be more than 500 character"]
    },
    website: {
        type: String,
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            "Please add a valid URL with HTTP/HTTPS."
        ]
    },
    phone: {
        type: Number,
        maxlength: [20, "Phone no can not be more than 20 digits"]
    },
    email: {
        type: String,
        match: [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, "Please enter a valid email ID."]
    },
    address: {
        type: String,
        required: [true, "Please add an address"]
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        },
        formattedAddress: String,
        street: String,
        city: String,
        zipcode: String,
        country: String,
        state: String,
    },
    career: {
        type: [String],
        required: true,
        enum: [
            "Web Development",
            "Mobile Development",
            "UI/UX",
            "Data Science",
            "Buisness",
            "Other"
        ]
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [2, "Rating can not be more than 10"]
    },
    averageCost: Number,
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create bootcamp slug from the name
BootcampSchema.pre("save", function(next){
    this.slug = slugify(this.name, {lower: true})
    next();
});

// Geocode  & location field
BootcampSchema.pre("save", async function(next) {
    const loc = await geoCoder.geocode(this.address);

    this.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
    };

    // Do not save address in DB
    this.address = undefined;
    next();
});


module.exports = mongoose.model("Bootcamp", BootcampSchema);