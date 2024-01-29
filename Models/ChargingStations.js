const mongoose = require('mongoose')
const StationSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number,
    description: String,
    chargers: [{
        chargetype: String,
        status: String,
        availability: [{
            bookedtime: String
        }]
    }],

});


const StationModel = mongoose.model("stations", StationSchema)
module.exports = StationModel