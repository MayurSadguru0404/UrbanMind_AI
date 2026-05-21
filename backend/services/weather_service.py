import requests
import os

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")


def get_weather(city):

    try:

        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?q={city}&appid={API_KEY}&units=metric"
        )

        response = requests.get(url)

        data = response.json()

        if response.status_code != 200:

            return {
                "error": "City not found"
            }

        return {
            "city": city,
            "weather_condition": data["weather"][0]["description"],
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"]
        }

    except Exception as e:

        return {
            "error": str(e)
        }