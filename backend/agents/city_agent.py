import re

from backend.services.weather_service import get_weather
from backend.agents.weather_agent import weather_agent
from backend.services.hf_llm import generate_hf_insight
from backend.data.live_cities import live_city_reports


def extract_city(query):

    query = query.lower()

    # ROUTE DETECTION
    route_match = re.search(
        r"from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)",
        query
    )

    if route_match:

        source = route_match.group(1).strip().title()

        destination = route_match.group(2).strip().title()

        return (source, destination)

    # SINGLE CITY DETECTION
    patterns = [

        r"\bin\s+([a-zA-Z]+)",

        r"\bfor\s+([a-zA-Z]+)",

        r"\bweather\s+in\s+([a-zA-Z]+)",

        r"\btraffic\s+in\s+([a-zA-Z]+)",

        r"\btravel\s+to\s+([a-zA-Z]+)"
    ]

    for pattern in patterns:

        match = re.search(pattern, query)

        if match:

            city = match.group(1).strip().title()

            return city

    return None


def city_agent(user_query, history=[]):

    city_data = extract_city(user_query)

    # MEMORY FALLBACK
    if not city_data and history:

        last_user_messages = [

            msg["text"]

            for msg in reversed(history)

            if msg["role"] == "user"
        ]

        for old_query in last_user_messages:

            old_city_data = extract_city(old_query)

            if old_city_data:

                city_data = old_city_data

                break

    if not city_data:

        return {
            "ai_explanation":
            "Please mention a valid city."
        }

    # ROUTE QUERY
    if isinstance(city_data, tuple):

        source_city = city_data[0]

        destination_city = city_data[1]

        weather_data = get_weather(source_city)

        if "error" in weather_data:

            return {
                "ai_explanation":
                "Unable to fetch city traffic data."
            }

        weather_result = weather_agent(weather_data)

        # CONVERSATION HISTORY
        conversation_history = ""

        for msg in history[-6:]:

            conversation_history += f"""
            {msg['role']}:
            {msg['text']}
            """

        prompt = f"""
        You are an advanced smart city AI travel assistant.

        A user is travelling from {source_city}
        to {destination_city}.

        Weather in {source_city}:
        {weather_data}

        Traffic Risk:
        {weather_result['traffic_risk']}

        Previous Conversation:
        {conversation_history}

        Current User Query:
        {user_query}

        Analyze:
        - best departure timing
        - expected congestion
        - weather impact
        - highway conditions
        - smart travel recommendation

        Give a detailed professional response.
        """

        ai_explanation = generate_hf_insight(prompt)

        city_report = {
            **weather_result,
            "ai_insight": ai_explanation
        }

        already_exists = any(
            c["city"].lower() == source_city.lower()
            for c in live_city_reports
        )

        if not already_exists:

            live_city_reports.append(city_report)

        return {
            "ai_explanation": ai_explanation
        }

    # SINGLE CITY QUERY
    city = city_data

    weather_data = get_weather(city)

    if "error" in weather_data:

        return {
            "ai_explanation":
            f"Could not fetch weather for {city}."
        }

    weather_result = weather_agent(weather_data)

    conversation_history = ""

    for msg in history[-6:]:

        conversation_history += f"""
        {msg['role']}:
        {msg['text']}
        """

    prompt = f"""
    You are an advanced smart city AI assistant.

    City:
    {city}

    Weather:
    {weather_data}

    Traffic Risk:
    {weather_result['traffic_risk']}

    Previous Conversation:
    {conversation_history}

    Current User Query:
    {user_query}

    Analyze:
    - traffic condition
    - weather impact
    - congestion probability
    - travel safety
    - smart recommendations

    Give a detailed professional response.
    """

    ai_explanation = generate_hf_insight(prompt)

    city_report = {
        **weather_result,
        "ai_insight": ai_explanation
    }

    already_exists = any(
        c["city"].lower() == city.lower()
        for c in live_city_reports
    )

    updated = False

    for i, c in enumerate(live_city_reports):

        if c["city"].lower() == city_report["city"].lower():

            live_city_reports[i] = city_report
            updated = True
            break

        if not updated:
            live_city_reports.append(city_report)

    return {
        "ai_explanation": ai_explanation
    }