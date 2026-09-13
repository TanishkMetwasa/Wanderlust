const Listing = require("../models/listing");
const https = require("https");
const { cloudinary } = require("../cloudConfig");

// Free geocoding via OpenStreetMap Nominatim — no API key required
function geocodeLocation(location, country, landmark = "") {
    return new Promise((resolve) => {
        const queryParts = [landmark, location, country].filter(Boolean);
        const query = encodeURIComponent(queryParts.join(", "));
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const options = {
            headers: { "User-Agent": "WanderLust-App/1.0" },
        };
        https.get(url, options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", async () => {
                try {
                    const results = JSON.parse(data);
                    if (results.length > 0) {
                        resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
                    } else if (landmark) {
                        // Fallback: search without landmark if landmark was too specific
                        const fallbackQuery = encodeURIComponent(`${location}, ${country}`);
                        const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${fallbackQuery}&format=json&limit=1`;
                        https.get(fallbackUrl, options, (fbRes) => {
                            let fbData = "";
                            fbRes.on("data", (c) => (fbData += c));
                            fbRes.on("end", () => {
                                try {
                                    const fbResults = JSON.parse(fbData);
                                    if (fbResults.length > 0) {
                                        resolve({ lat: parseFloat(fbResults[0].lat), lng: parseFloat(fbResults[0].lon) });
                                    } else {
                                        resolve({ lat: null, lng: null });
                                    }
                                } catch {
                                    resolve({ lat: null, lng: null });
                                }
                            });
                        }).on("error", () => resolve({ lat: null, lng: null }));
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

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let url =  req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename};

    // If coordinates were picked on interactive map, use them directly
    if (req.body.listing.geometry && req.body.listing.geometry.lat && req.body.listing.geometry.lng) {
        newListing.geometry = {
            lat: parseFloat(req.body.listing.geometry.lat),
            lng: parseFloat(req.body.listing.geometry.lng)
        };
    } else {
        // Otherwise geocode via OpenStreetMap
        const coords = await geocodeLocation(newListing.location, newListing.country, newListing.landmark);
        newListing.geometry = coords;
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

     let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing,  });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    
    // Check if user set pin manually
    if (req.body.listing.geometry && req.body.listing.geometry.lat && req.body.listing.geometry.lng) {
        listing.geometry = {
            lat: parseFloat(req.body.listing.geometry.lat),
            lng: parseFloat(req.body.listing.geometry.lng)
        };
    } else {
        const coords = await geocodeLocation(listing.location, listing.country, listing.landmark);
        listing.geometry = coords;
    }

    if(typeof req.file !=="undefined"){
        // If an old image exists on Cloudinary, delete it first
        if (listing.image && listing.image.filename) {
            await cloudinary.uploader.destroy(listing.image.filename).catch(err => console.log("Cloudinary destroy error:", err));
        }
        let url =  req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename};
    }
    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    
    // Delete image from Cloudinary if it has a stored filename
    if (deletedListing && deletedListing.image && deletedListing.image.filename) {
        try {
            await cloudinary.uploader.destroy(deletedListing.image.filename);
            console.log(`Deleted Cloudinary image: ${deletedListing.image.filename}`);
        } catch (err) {
            console.error("Cloudinary deletion failed:", err);
        }
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};