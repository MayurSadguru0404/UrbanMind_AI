import re

from backend.services.weather_service import get_weather
from backend.agents.weather_agent import weather_agent
from backend.services.hf_llm import generate_hf_insight
from backend.data.live_cities import live_city_reports


# ---------------------------
# CITY COORDINATES (IMPORTANT)
# ---------------------------
CITY_COORDS = {
    "Pune": (18.5204, 73.8567),
    "Mumbai": (19.0760, 72.8777),
    "Nashik": (19.9975, 73.7898),
    "Delhi": (28.7041, 77.1025),
    "Bangalore": (12.9716, 77.5946)
}


# ---------------------------
# CITY EXTRACTION
# ---------------------------
KNOWN_CITIES = {
    "pune", "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
    "kolkata", "ahmedabad", "jaipur", "lucknow", "nagpur", "surat",
    "patna", "nashik", "indore", "bhopal", "vadodara", "coimbatore",
    "visakhapatnam", "thane", "agra", "meerut", "rajkot", "chandigarh",
    "new delhi", "bengaluru"
}

def extract_city(query):
    query_lower = query.lower()

    # ROUTE DETECTION — from X to Y
    route_match = re.search(
        r"from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s|$|\.|\?)",
        query_lower
    )
    if route_match:
        source = route_match.group(1).strip().title()
        destination = route_match.group(2).strip().title()
        if source.lower() in KNOWN_CITIES or destination.lower() in KNOWN_CITIES:
            return (source, destination)

    # KNOWN CITY MATCH — scan every word/bigram against known cities list
    words = query_lower.split()
    # check bigrams first (e.g. "new delhi")
    for i in range(len(words) - 1):
        bigram = words[i] + " " + words[i+1]
        if bigram in KNOWN_CITIES:
            return bigram.title()
    # then single words
    for word in words:
        clean = re.sub(r"[^a-z]", "", word)
        if clean in KNOWN_CITIES:
            return clean.title()

    return None


# ---------------------------
# MAIN AGENT
# ---------------------------
def city_agent(user_query, history=[]):

    city_data = extract_city(user_query)

    # ---------------------------
    # MEMORY FALLBACK
    # ---------------------------
    if not city_data and history:
        for msg in reversed(history):
            if msg["role"] == "user":
                old = extract_city(msg["text"])
                if old:
                    city_data = old
                    break

    if not city_data:
        return {
            "ai_explanation": (
                "I couldn't detect a city in your query. "
                "Try asking something like:\n"
                "• 'What is the traffic situation in Mumbai?'\n"
                "• 'Weather in Delhi'\n"
                "• 'Travel from Pune to Mumbai'\n\n"
                "I currently support Indian cities including Mumbai, Delhi, "
                "Bangalore, Pune, Hyderabad, Chennai, Kolkata, Jaipur, and more."
            )
        }

    # ---------------------------
    # ROUTE CASE
    # ---------------------------
    if isinstance(city_data, tuple):

        source_city, destination_city = city_data

        weather_data = get_weather(source_city)

        if "error" in weather_data:
            return {
                "ai_explanation": "Unable to fetch weather data."
            }

        weather_result = weather_agent(weather_data)

        lat, lng = CITY_COORDS.get(
            source_city,
            (18.5204, 73.8567)
        )

        conversation_history = ""
        for msg in history[-6:]:
            conversation_history += f"{msg['role']}: {msg['text']}\n"

        prompt = f"""
        User is traveling from {source_city} to {destination_city}.

        Weather:
        {weather_data}

        Traffic Risk:
        {weather_result.get('traffic_risk', 'Unknown')}

        Conversation:
        {conversation_history}

        Provide:
        - best departure time
        - traffic condition
        - weather impact
        - travel safety advice
        """

        ai_explanation = generate_hf_insight(prompt)

        city_report = {
            **weather_result,
            "city": source_city,
            "ai_insight": ai_explanation,
            "lat": lat,
            "lng": lng
        }

        if not any(c["city"] == source_city for c in live_city_reports):
            live_city_reports.append(city_report)

        return {"ai_explanation": ai_explanation}

    # ---------------------------
    # SINGLE CITY CASE
    # ---------------------------
    city = city_data

    weather_data = get_weather(city)

    if "error" in weather_data:
        return {
            "ai_explanation": f"Could not fetch weather for {city}."
        }

    weather_result = weather_agent(weather_data)

    lat, lng = CITY_COORDS.get(city, (18.5204, 73.8567))

    conversation_history = ""
    for msg in history[-6:]:
        conversation_history += f"{msg['role']}: {msg['text']}\n"

    prompt = f"""
    City: {city}

    Weather:
    {weather_data}

    Traffic Risk:
    {weather_result.get('traffic_risk', 'Unknown')}

    Conversation:
    {conversation_history}

    Give:
    - traffic analysis
    - weather impact
    - travel advice
    """

    ai_explanation = generate_hf_insight(prompt)

    city_report = {
        **weather_result,
        "city": city,
        "ai_insight": ai_explanation,
        "lat": lat,
        "lng": lng
    }

    if not any(c["city"] == city for c in live_city_reports):
        live_city_reports.append(city_report)

    return {"ai_explanation": ai_explanation}
