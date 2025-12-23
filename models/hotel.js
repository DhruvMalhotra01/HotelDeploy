const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    type: String,
    description: String,
    size: String,
    guestCapacity: Number,
    bedType: String,
    features: [String],
    price: Number,
    image: String,
});

const diningSchema = new mongoose.Schema({
    name: String,
    description: String,
    address: String,
    contact: String,
    cuisine: String,
    dressCode: String,
    menuUrl: String,
    image: String,
});

const hotelSchema = new mongoose.Schema({
    name: String,
    location: String,
    description: String,
    images: [String],
    rooms: [roomSchema],
    diningOptions: [diningSchema],
});

module.exports = mongoose.model("Hotel", hotelSchema);
