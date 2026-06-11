import L from "leaflet";
import "leaflet/dist/leaflet.css";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});


function MapPage() {
  const [cities, setCities] = useState([]);

  const fetchCities = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/monitor");
      const data = await res.json();
      setCities(data.cities || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCities();
    const interval = setInterval(fetchCities, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4">

      <h1 className="text-3xl font-bold text-cyan-400 mb-4">
        Live City Intelligence Map
      </h1>

      <MapContainer
        center={[18.5204, 73.8567]} // Pune default
        zoom={6}
        style={{ height: "85vh", width: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cities.map((city, index) => (
          <Marker
            key={index}
            position={[city.lat, city.lng]}
          >
            <Popup>

              <div className="text-black">

                <h2 className="font-bold">{city.city}</h2>

                <p>🌤 {city.weather_condition}</p>
                <p>🌡 {city.temperature}°C</p>
                <p>💧 {city.humidity}%</p>

                <p>
                  🚦 Risk:{" "}
                  <b>
                    {city.traffic_risk}
                  </b>
                </p>

                <p className="mt-2">
                  🧠 {city.ai_insight?.slice(0, 120)}...
                </p>

              </div>

            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}

export default MapPage;
