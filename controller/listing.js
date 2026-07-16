const Listing =require("../models/listing");
const axios = require("axios");
module.exports.index = async (req, res) => {

    let filter = {};

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.search) {
        filter.$or = [
            { title: { $regex: req.query.search, $options: "i" } },
            { location: { $regex: req.query.search, $options: "i" } },
            { country: { $regex: req.query.search, $options: "i" } }
        ];
    }

    if (req.query.maxPrice) {
        filter.price = {
            $lte: Number(req.query.maxPrice)
        };
    }

    const listings = await Listing.find(filter);

    res.render("index.ejs", {
        listings,
        search: req.query.search,
        maxPrice: req.query.maxPrice
    });
};


module.exports.renderNewForm =(req, res) => {
  
  res.render("listings/new.ejs");
}


module.exports.showListing=async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}



module.exports.createListing = async (req, res) => {
    const { location, country } = req.body.listing;

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.category = req.body.listing.category;
    newListing.owner = req.user._id;

    newListing.image = {
        url,
        filename,
    };

    const searchText = `${location}, ${country}`;

    const response = await axios.get(
    "https://us1.locationiq.com/v1/search",
    {
        params: {
            key: process.env.LOCATIONIQ_API_KEY,
            q: searchText,
            format: "json",
            limit: 1,
        },
    }
);

    if (response.data.length > 0) {
        newListing.geometry = {
            type: "Point",
            coordinates: [
                Number(response.data[0].lon),
                Number(response.data[0].lat),
            ],
        };
    } else {
        req.flash("error", "Location not found!");
        return res.redirect("/listings/new");
    }

    console.log("Saved Geometry:", newListing.geometry);
    console.log("Search:", searchText);
console.log("API Response:", response.data);
console.log("Geometry:", newListing.geometry);
    await newListing.save();

    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.editListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/h_300,w_250"
    );

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl,
    });
}; 

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.category = req.body.listing.category;
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    const searchText = `${listing.location}, ${listing.country}`;

    const response = await axios.get(
    "https://us1.locationiq.com/v1/search",
    {
        params: {
            key: process.env.LOCATIONIQ_API_KEY,
            q: searchText,
            format: "json",
            limit: 1,
        },
    }
);

    if (response.data.length > 0) {
        listing.geometry = {
            type: "Point",
            coordinates: [
                Number(response.data[0].lon),
                Number(response.data[0].lat),
            ],
        };
    }

    console.log("Updated Geometry:", listing.geometry);

    await listing.save();

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${listing._id}`);
};
module.exports.destroyListing=async(req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
}

