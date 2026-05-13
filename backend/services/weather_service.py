import requests
from backend.core.config import WEATHER_API_KEY

BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def get_weather(city: str):
    params = {
        "q": city,
        "appid": WEATHER_API_KEY,
        "units": "metric"
    }

    response = requests.get(BASE_URL, params=params)

    data = response.json()

    if response.status_code != 200:
        return {
            "error": data.get("message", "Failed to fetch weather")
        }

    weather_info = {
        "city": data["name"],
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "weather": data["weather"][0]["description"],
        "wind_speed": data["wind"]["speed"]
    }

    return weather_info