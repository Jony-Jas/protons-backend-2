const mongoose=require('mongoose')
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    pwd: String,
    age: Number,
    country: String,
    license: String,
    vehicles: [{
        vehicletype: String,
        modelname: String,
        mileage: Number,
        batterycapacity: Number,
        chargingtype: String
    }]
});


const UserModel=mongoose.model("users",UserSchema)
module.exports = UserModel