document.addEventListener("DOMContentLoaded", () => {
    const mapContainer = document.getElementById("location-picker-map");
    if (!mapContainer) return;

    const latInput = document.getElementById("picker-lat");
    const lngInput = document.getElementById("picker-lng");
    const locateBtn = document.getElementById("btn-locate-on-map");
    const locationInput = document.getElementById("listing-location");
    const countryInput = document.getElementById("listing-country");
    const landmarkInput = document.getElementById("listing-landmark");
    const statusText = document.getElementById("picker-status-text");

    // Existing coordinates if editing, or default to India (center)
    const initialLat = parseFloat(latInput.value) || 20.5937;
    const initialLng = parseFloat(lngInput.value) || 78.9629;
    const initialZoom = (latInput.value && lngInput.value) ? 14 : 5;

    const map = L.map("location-picker-map").setView([initialLat, initialLng], initialZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    const pickerIcon = L.divIcon({
        className: "custom-picker-marker",
        html: '<div style="background:#fe424d;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.35);cursor:grab;"></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
    });

    let marker = null;

    function setCoordinates(lat, lng, zoomLevel = null) {
        latInput.value = lat.toFixed(7);
        lngInput.value = lng.toFixed(7);

        if (!marker) {
            marker = L.marker([lat, lng], { icon: pickerIcon, draggable: true }).addTo(map);
            marker.on("dragend", (e) => {
                const pos = e.target.getLatLng();
                setCoordinates(pos.lat, pos.lng);
            });
        } else {
            marker.setLatLng([lat, lng]);
        }

        marker.bindPopup("<b>Pinpoint Location</b><br>Drag this pin to fine-tune the exact place!").openPopup();

        if (zoomLevel) {
            map.setView([lat, lng], zoomLevel);
        } else {
            map.panTo([lat, lng]);
        }

        if (statusText) {
            statusText.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> Pin set at: <b>${lat.toFixed(4)}, ${lng.toFixed(4)}</b> (You can drag the pin)`;
        }
    }

    // If initial coordinates already exist (edit mode)
    if (latInput.value && lngInput.value) {
        setCoordinates(parseFloat(latInput.value), parseFloat(lngInput.value), 14);
    }

    // User clicks anywhere on the map to place/move the marker
    map.on("click", (e) => {
        setCoordinates(e.latlng.lat, e.latlng.lng);
    });

    // "Locate on Map" button click handler
    if (locateBtn) {
        locateBtn.addEventListener("click", async () => {
            const loc = locationInput ? locationInput.value.trim() : "";
            const country = countryInput ? countryInput.value.trim() : "";
            const landmark = landmarkInput ? landmarkInput.value.trim() : "";

            if (!loc && !country && !landmark) {
                alert("Please enter a Location or Landmark first!");
                return;
            }

            const queryParts = [landmark, loc, country].filter(Boolean);
            const query = encodeURIComponent(queryParts.join(", "));
            
            locateBtn.disabled = true;
            locateBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Finding...';
            if (statusText) statusText.innerHTML = `<i class="fa-solid fa-magnifying-glass text-primary"></i> Searching location...`;

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
                    headers: { "Accept": "application/json" }
                });
                const data = await res.json();

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    setCoordinates(lat, lon, 15);
                } else if (landmark && (loc || country)) {
                    // Try fallback without landmark if too specific
                    const fallbackQuery = encodeURIComponent([loc, country].filter(Boolean).join(", "));
                    const fbRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${fallbackQuery}&format=json&limit=1`);
                    const fbData = await fbRes.json();
                    if (fbData && fbData.length > 0) {
                        const lat = parseFloat(fbData[0].lat);
                        const lon = parseFloat(fbData[0].lon);
                        setCoordinates(lat, lon, 13);
                        if (statusText) {
                            statusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-warning"></i> Found city area. Please drag the pin to your exact spot!`;
                        }
                    } else {
                        alert("Could not find this location on map. Please click on the map to place your pin manually.");
                    }
                } else {
                    alert("Could not find this location on map. Please click on the map to place your pin manually.");
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                alert("Error searching map. You can click anywhere on the map to place your pin directly.");
            } finally {
                locateBtn.disabled = false;
                locateBtn.innerHTML = '<i class="fa fa-crosshairs me-1"></i> Locate on Map';
            }
        });
    }

    // Refresh size after container renders
    setTimeout(() => {
        map.invalidateSize();
    }, 300);
});
