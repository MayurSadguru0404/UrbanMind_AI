import React from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const cityCoordinates = {
  Mumbai: [19.0760, 72.8777],
  Pune: [18.5204, 73.8567],
  Delhi: [28.7041, 77.1025],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.3850, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Nagpur: [21.1458, 79.0882],
  Nashik: [19.9975, 73.7898],
  Baramati: [18.1510, 74.5777],
  Surat: [21.1702, 72.8311],
  Indore: [22.7196, 75.8577]
};

function LiveMap({ reports }) {

  return (

    <div className="rounded-2xl overflow-hidden border border-gray-700 mt-6">

      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        style={{ height: "500px", width: "100%" }}
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((city, index) => {

          const coords = cityCoordinates[city.city];

          if (!coords) return null;

          return (
            <Marker
              key={index}
              position={coords}
              icon={icon}
            >

              <Popup>

                <div>
                  <h2><b>{city.city}</b></h2>

                  <p>
                    Weather: {city.weather_condition}
                  </p>

                  <p>
                    Temp: {city.temperature}°C
                  </p>

                  <p>
                    Traffic Risk: {city.traffic_risk}
                  </p>
                </div>

              </Popup>

            </Marker>
          );
        })}

      </MapContainer>

    </div>
  );
}

export default LiveMap;