def weather_agent(weather: dict):

    if not isinstance(weather, dict):
        return {
            "city": "Unknown",
            "weather_condition": "unknown",
            "temperature": 0,
            "humidity": 0,
            "traffic_risk": "Unknown",
            "insight": "Invalid weather data format"
        }

    condition = weather.get("weather_condition", "unknown")
    temp = weather.get("temperature", 0)
    humidity = weather.get("humidity", 0)
    city = weather.get("city", "Unknown")

    if temp > 40:
        risk = "High"
    elif temp > 35:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "city": city,
        "weather_condition": condition,
        "temperature": temp,
        "humidity": humidity,
        "traffic_risk": risk,
        "insight": f"{city}: {condition}, {temp}°C, risk={risk}"
    }