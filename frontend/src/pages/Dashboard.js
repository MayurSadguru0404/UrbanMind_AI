import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {

  const [monitorData, setMonitorData] = useState({
    cities: [],
    total_cities: 0,
    critical_cities: 0,
  });

  const fetchMonitorData = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/monitor"
      );

      const data = await response.json();

      setMonitorData({
        cities: data.cities || [],
        total_cities: data.total_cities || 0,
        critical_cities: data.critical_cities || 0,
      });

    } catch (error) {

      console.log(error);

    }
  };

  useEffect(() => {

    fetchMonitorData();

    const interval = setInterval(() => {

      fetchMonitorData();

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="min-h-screen bg-[#343541] text-white p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            UrbanMind AI Dashboard
          </h1>

          <p className="text-gray-400 mt-2">
            Smart City Monitoring System
          </p>

        </div>

        <Link
          to="/chat"
          className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-xl font-semibold transition"
        >
          AI Chat
        </Link>

      </div>

      {/* ANALYTICS */}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-[#202123] p-6 rounded-2xl border border-gray-700 shadow-lg">

          <h2 className="text-gray-400 text-lg">
            Cities Monitored
          </h2>

          <p className="text-4xl font-bold mt-3 text-green-400">
            {monitorData.total_cities}
          </p>

        </div>

        <div className="bg-[#202123] p-6 rounded-2xl border border-gray-700 shadow-lg">

          <h2 className="text-gray-400 text-lg">
            Critical Cities
          </h2>

          <p className="text-4xl font-bold mt-3 text-red-400">
            {monitorData.critical_cities}
          </p>

        </div>

        <div className="bg-[#202123] p-6 rounded-2xl border border-gray-700 shadow-lg">

          <h2 className="text-gray-400 text-lg">
            AI Monitoring
          </h2>

          <p className="text-2xl font-bold mt-3 text-blue-400">
            ACTIVE
          </p>

        </div>

      </div>

      {/* CITY CARDS */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {monitorData.cities.length === 0 && (

          <div className="text-gray-400 text-xl">

            No cities monitored yet.

          </div>

        )}

        {monitorData.cities.map((city, index) => (

          <div
            key={index}
            className="bg-[#202123] p-6 rounded-2xl border border-gray-700 shadow-lg hover:scale-[1.02] transition"
          >

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold">
                {city.city}
              </h2>

              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  city.traffic_risk === "High"
                    ? "bg-red-500/20 text-red-400"
                    : city.traffic_risk === "Medium"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {city.traffic_risk}
              </div>

            </div>

            <div className="space-y-3 text-gray-300">

              <p>
                🌤 {city.weather_condition}
              </p>

              <p>
                🌡 {city.temperature}°C
              </p>

              <p>
                💧 {city.humidity}%
              </p>

            </div>

            {/* AI INSIGHT */}

            <div className="mt-5 bg-[#2A2B32] p-4 rounded-xl border border-blue-500/20">

              <h3 className="text-sm uppercase tracking-wider text-blue-400 mb-2 font-semibold">
                AI Insight
              </h3>

              <p className="text-gray-300 text-sm leading-6">
                {city.ai_insight || "Monitoring live conditions..."}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Dashboard;