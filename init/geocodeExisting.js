// Run this script ONCE to geocode all existing listings
// Usage: node init/geocodeExisting.js

if (process.env.NODE_ENV != "production") {
    require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const https = require("https");
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

function geocodeLocation(location, country) {
    return new Promise((resolve) => {
        const query = encodeURIComponent(`${location}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const options = { headers: { "User-Agent": "WanderLust-App/1.0" } };
        https.get(url, options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const results = JSON.parse(data);
                    if (results.length > 0) {
                        resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
                    } else {
                        resolve({ lat: null, lng: null });
                    }
                } catch {
                    resolve({ lat: null, lng: null });
                }
            });
        }).on("error", () => resolve({ lat: null, lng: null }));
    });
}

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({
        $or: [
            { "geometry.lat": null },
            { geometry: { $exists: false } }
        ]
    });

    console.log(`Found ${listings.length} listing(s) without coordinates.`);

    for (let listing of listings) {
        if (!listing.location || !listing.country) {
            console.log(`  Skipping "${listing.title}" — no location/country`);
            continue;
        }
        // Nominatim rate limit: 1 request per second
        await new Promise(r => setTimeout(r, 1100));
        const coords = await geocodeLocation(listing.location, listing.country);
        listing.geometry = coords;
        await listing.save();
        console.log(`  checked "${listing.title}" → lat:${coords.lat}, lng:${coords.lng}`);
    }

    console.log("Done! All listings geocoded.");
    mongoose.disconnect();
}

main().catch(console.error);
