import React from "react";

function CityCard({ city, darkMode }) {

  const getRiskColor = (risk) => {

    if (risk === "High") {
      return "bg-red-500";
    }

    if (risk === "Medium") {
      return "bg-yellow-500";
    }

    return "bg-green-500";
  };

  return (

    <div className={`rounded-2xl shadow-lg p-6 transition-all duration-500 ${
      darkMode
        ? "bg-gray-800"
        : "bg-white"
    }`}>

      <div className="flex justify-between items-center">

        <h2 className="text-2xl font-bold">
          {city.city}
        </h2>

        <div
          className={`px-4 py-2 rounded-full text-white ${getRiskColor(city.traffic_risk)}`}
        >
          {city.traffic_risk}
        </div>

      </div>

      <div className="mt-4 space-y-2">

        <p>
          🌤 Weather:
          {" "}
          {city.weather_condition}
        </p>

        <p>
          🌡 Temperature:
          {" "}
          {city.temperature}°C
        </p>

        <p>
          💧 Humidity:
          {" "}
          {city.humidity}%
        </p>

        <p>
          🚨 Alert:
          {" "}
          {city.alert_level}
        </p>

        <p className="font-semibold mt-4">
          🧠 AI Insight
        </p>

        <p className={
          darkMode
            ? "text-gray-300"
            : "text-gray-700"
        }>
          {city.ai_insight}
        </p>

      </div>

    </div>

  );
}

export default CityCard;