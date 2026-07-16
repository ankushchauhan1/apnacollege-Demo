const mongoose = require("mongoose");
const axios = require("axios");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
    await mongoose.connect("mongodb://localhost:27017/wanderlust");
}

main()
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});

    const listings = [];

    for (let obj of initData.data) {

        const searchText = `${obj.location}, ${obj.country}`;

        let geometry = {
            type: "Point",
            coordinates: [77.2090, 28.6139], // fallback
        };

        try {
            const response = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: searchText,
                        format: "jsonv2",
                        limit: 1,
                    },
                    headers: {
                        "User-Agent": "Wanderlust (your-email@example.com)",
                    },
                }
            );

            if (response.data.length > 0) {
                geometry = {
                    type: "Point",
                    coordinates: [
                        Number(response.data[0].lon),
                        Number(response.data[0].lat),
                    ],
                };
            }

            console.log(`${searchText} -> ${geometry.coordinates}`);

        }  catch (err) {
    console.log(`Failed: ${searchText}`);
    console.log("Error:", err.message);

    if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response:", err.response.data);
    }
}

        listings.push({
            ...obj,
            geometry,
            owner: "6a48d94e82821a39946f4461",
        });
    }

    await Listing.insertMany(listings);

    console.log("Database initialized successfully!");
    mongoose.connection.close();
};

initDB();