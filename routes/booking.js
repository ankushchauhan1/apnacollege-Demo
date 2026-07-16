const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware");
const bookingController = require("../controller/booking");

// My Bookings page
router.get(
    "/mybookings",
    isLoggedIn,
    bookingController.myBookings
);
router.delete(
    "/bookings/:bookingId",
    isLoggedIn,
    bookingController.cancelBooking
);
router.get(
    "/bookings/:bookingId/invoice",
    isLoggedIn,
    bookingController.downloadInvoice
);
module.exports = router;