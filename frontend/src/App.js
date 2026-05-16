import React, { useEffect, useState } from "react";

function App() {

  const [data, setData] = useState(null);

  const [query, setQuery] = useState("");
  const [chatResponse, setChatResponse] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/monitor")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));

  }, []);

  const handleChat = async () => {

    if (!query.trim()) return;

    // clear old response
    setChatResponse(null);

    try {

      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: query
          })
        }
      );

      const data = await response.json();

      setChatResponse(data);

      // clear input field
      setQuery("");

    } catch (error) {

      console.error(error);

      setChatResponse({
        ai_explanation: "Failed to connect to UrbanMind AI backend."
      });

    } finally {

      setLoading(false);

    }
  };

  const handleKeyPress = (e) => {

    if (e.key === "Enter") {
      handleChat();
    }
  };

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

    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-bold text-center mb-8">
        UrbanMind AI Dashboard
      </h1>

      {/* AI CHAT SECTION */}

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">

        <h2 className="text-2xl font-bold mb-4">
          UrbanMind AI Assistant
        </h2>

        <div className="flex gap-4">

          <input
            type="text"
            placeholder="Ask about city traffic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 border rounded-xl p-3"
          />

          <button
            onClick={handleChat}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Ask AI
          </button>

        </div>

        {loading && (

          <div className="mt-6 bg-yellow-100 p-4 rounded-xl">
            🧠 UrbanMind AI is thinking...
          </div>

        )}

        {chatResponse && (

          <div className="mt-6 bg-gray-100 p-4 rounded-xl">

            <p className="font-semibold text-lg mb-2">
              AI Response
            </p>

            <p className="text-gray-700">
              {chatResponse.ai_explanation ||
                chatResponse.error ||
                "No response generated."}
            </p>

          </div>

        )}

      </div>

      {/* CITY DASHBOARD */}

      {!data ? (

        <div className="text-center text-xl">
          Loading intelligence...
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {data.reports.map((city, index) => (

            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6"
            >

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
                  🌤 Weather: {city.weather_condition}
                </p>

                <p>
                  🌡 Temperature: {city.temperature}°C
                </p>

                <p>
                  💧 Humidity: {city.humidity}%
                </p>

                <p>
                  🚨 Alert: {city.alert_level}
                </p>

                <p className="font-semibold mt-4">
                  🧠 AI Insight
                </p>

                <p className="text-gray-700">
                  {city.ai_insight || "No insight available"}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );
}

export default App;