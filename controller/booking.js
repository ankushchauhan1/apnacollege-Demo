const Booking = require("../models/booking");
const Listing = require("../models/listing");
const PDFDocument = require("pdfkit");
module.exports.createBooking = async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        guests: req.body.guests,
        totalPrice: req.body.totalPrice,
    });


    await booking.save();

    listing.bookings.push(booking._id);

    await listing.save();

    req.flash("success", "Booking Confirmed!");

    res.redirect(`/listings/${listing._id}`);
};
module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id
    })
    .populate("listing");

    res.render("bookings/index", { bookings });

};
module.exports.cancelBooking = async (req, res) => {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/mybookings");
    }

    await Listing.findByIdAndUpdate(
        booking.listing,
        {
            $pull: {
                bookings: booking._id,
            },
        }
    );

    await Booking.findByIdAndDelete(bookingId);

    req.flash("success", "Booking Cancelled Successfully!");

    res.redirect("/mybookings");
};
module.exports.downloadInvoice = async (req, res) => {

    const booking = await Booking.findById(req.params.bookingId)
        .populate("listing")
        .populate("user");

    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/mybookings");
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=Invoice-${booking._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(24).text("Wanderlust", {
        align: "center",
    });

    doc.moveDown();

    doc.fontSize(18).text("Booking Invoice");

    doc.moveDown();

    doc.text(`Booking ID : ${booking._id}`);
    doc.text(`Guest Name : ${booking.user.username}`);
    doc.text(`Property : ${booking.listing.title}`);
    doc.text(`Location : ${booking.listing.location}, ${booking.listing.country}`);
    doc.text(`Check In : ${booking.checkIn.toDateString()}`);
    doc.text(`Check Out : ${booking.checkOut.toDateString()}`);
    doc.text(`Guests : ${booking.guests}`);
    doc.text(`Status : ${booking.status}`);
    doc.text(`Total Paid : ₹${booking.totalPrice}`);

    doc.moveDown();

    doc.text("Thank you for booking with Wanderlust!");

    doc.end();

};