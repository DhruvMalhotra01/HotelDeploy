const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const validateBooking = require("../middleware/validateBooking");
router.get("/:name", async (req, res) => {
    try {
        const decodedName = decodeURIComponent(req.params.name); // to handle %20 and special characters
        const hotel = await Hotel.findOne({ name: decodedName });

        if (!hotel) {
            return res
                .status(404)
                .send(`Hotel named "${decodedName}" not found.`);
        }

        res.render("hotelDetails", { hotel }); // make sure you have this EJS file
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});
router.post("/book", validateBooking, async (req, res) => {
    try {
        const {
            hotelName,
            firstName,
            lastName,
            email,
            phone,
            roomType,
            checkin,
            checkout,
        } = req.body;

        // Find hotel by name to get the hotel ID
        const hotel = await Hotel.findOne({ name: hotelName });

        if (!hotel) {
            return res.status(404).send("Hotel not found");
        }

        // Calculate price
        const roomRates = {
            Standard: 3000,
            Deluxe: 5000,
            Suite: 8000,
        };
        const pricePerNight = roomRates[roomType];
        const nights = Math.ceil(
            (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)
        );
        const basePrice = pricePerNight * nights;
        const tax = basePrice * 0.12;
        const totalAmount = basePrice + tax;

        // Create booking
        const booking = new Booking({
            hotelName,
            firstName,
            lastName,
            email,
            phone,
            roomType,
            checkin,
            checkout,
            bookingType: "room",
            hotelId: hotel._id,
            itemId: null, // You can add restaurantId if you do restaurant booking
            totalAmount,
        });

        await booking.save();

        res.render("bookingConfirmation", { booking });
    } catch (error) {
        console.error(error);
        res.status(500).send("Booking failed.");
    }
});

module.exports = router;
