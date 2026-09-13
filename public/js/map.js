document.addEventListener("DOMContentLoaded", () => {
    const mapEl = document.getElementById("listing-map");
    if (!mapEl) return;

    const lat = parseFloat(mapEl.dataset.lat);
    const lng = parseFloat(mapEl.dataset.lng);
    const title = mapEl.dataset.title || "Listing Location";
    const location = mapEl.dataset.location || "";
    const country = mapEl.dataset.country || "";
    const landmark = mapEl.dataset.landmark || "";

    const displayAddress = [landmark, location, country].filter(Boolean).join(", ");

    // Check if valid coordinates exist (lat and lng are numbers and not NaN)
    if (!isNaN(lat) && !isNaN(lng)) {
        const map = L.map("listing-map").setView([lat, lng], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);

        const customIcon = L.divIcon({
            className: "custom-map-marker",
            html: '<div style="background:#ff385c;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.35);"></div>',
            iconSize: [34, 34],
            iconAnchor: [17, 34],
            popupAnchor: [0, -36],
        });

        const popupContent = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px;">
                <b style="font-size: 14px; color: #222;">${title}</b>
                <p style="margin: 4px 0 0 0; color: #717171;">${displayAddress}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #ff385c; font-weight: 600;">Exact location will be provided after booking</p>
            </div>
        `;

        L.marker([lat, lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent)
            .openPopup();

        // Fix potential tile rendering issues if container rendered dynamically
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    } else {
        // Fallback placeholder if coordinates are not available
        mapEl.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center h-100 text-muted" style="background:#f8f9fa;border-radius:12px;border:1px dashed #dee2e6;">
                <i class="fa-solid fa-map-location-dot fa-2x mb-2" style="color:#adb5bd;"></i>
                <span style="font-weight: 500;">Exact map location not available for this listing</span>
                <small class="text-secondary mt-1">${location}${location && country ? ", " : ""}${country}</small>
            </div>
        `;
    }
});
