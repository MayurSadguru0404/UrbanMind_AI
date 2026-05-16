import os

# Later we will plug real LLM API here
# For now we simulate LLM-style output structure

def generate_llm_summary(city_data):

    city = city_data["city"]
    weather = city_data["weather_condition"]
    temp = city_data["temperature"]
    risk = city_data["traffic_risk"]

    prompt = f"""
    City: {city}
    Weather: {weather}
    Temperature: {temp}
    Traffic Risk: {risk}

    Generate a short, human-like urban traffic insight.
    """

    # Simulated "LLM response"
    response = (
        f"UrbanMind Insight: In {city}, current conditions show {weather} "
        f"with temperature around {temp}°C. "
    )

    if risk == "High":
        response += "Severe impact on traffic is expected. Plan travel carefully."
    elif risk == "Medium":
        response += "Moderate delays possible during peak hours."
    else:
        response += "Traffic flow remains stable and normal."

    return response