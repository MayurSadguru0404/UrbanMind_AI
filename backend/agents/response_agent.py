from backend.services.hf_llm import generate_hf_insight

def response_agent(
    city,
    weather_result,
    traffic_result,
    safety_result,
    memory,
    history_text
):

    prompt = f"""
You are UrbanMind AI.

City:
{city}

Conversation:
{history_text}

Weather Agent:
{weather_result}

Traffic Agent:
{traffic_result}

Safety Agent:
{safety_result}

Memory:
{memory}

Generate a smart human response.
Keep response short and conversational.
"""

    return generate_hf_insight(prompt)