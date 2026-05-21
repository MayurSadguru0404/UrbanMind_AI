from backend.services.weather_service import get_weather
from backend.agents.weather_agent import weather_agent
from backend.services.hf_llm import generate_hf_insight
from backend.data.live_cities import live_city_reports

cities = [

    "Pune",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Nagpur",
    "Surat",
    "Patna",
    "Nashik",
    "Indore"
]


def refresh_all_cities():

    live_city_reports.clear()

    for city in cities:

        weather_data = get_weather(city)

        if "error" in weather_data:
            continue

        weather_result = weather_agent(weather_data)

        prompt = f"""
        You are a smart city monitoring AI.

        City: {city}

        Weather:
        {weather_data}

        Traffic Risk:
        {weather_result['traffic_risk']}

        Give ONLY:
        - 1 or 2 short lines
        - concise traffic insight
        - concise travel recommendation

        Keep response under 25 words.
        """

        ai_explanation = generate_hf_insight(prompt)

        city_report = {
            **weather_result,
            "ai_insight": ai_explanation
        }

        live_city_reports.append(city_report)