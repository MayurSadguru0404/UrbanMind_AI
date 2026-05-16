from backend.services.weather_service import get_weather
from backend.services.city_analyzer import analyze_weather
from backend.rag.vector_store import retrieve_context
from backend.services.hf_llm import generate_hf_insight
from backend.utils.nlp import extract_city

def city_agent(query:str):
    memory=retrieve_context(query)
    city = extract_city(query)
    if not city:
        return {
            'error':"Please mention a city in your query"
        }
    weather_data=get_weather(city)
    if "error" in weather_data:
        return weather_data
    analysis=analyze_weather(weather_data)
    
    prompt = f"""<|system|>
You are UrbanMind AI.
Answer ONLY in 2-3 short sentences.
No extra explanation.
No background information.

<|user|>
City: {city}
Weather: {analysis}
Memory: {memory}

Give travel advice.

<|assistant|>
"""

    ai_explanation = generate_hf_insight(prompt)
    
    if (
        not ai_explanation
        or "City:" in ai_explanation
        or len(ai_explanation)<15
    ):
        risk=analysis["traffic_risk"]
        weather=analysis["weather_condition"]
        temp=analysis["temperature"]
        
        ai_explanation=(
            f"{city} currently has {weather} weather"
            f"with a temperature of {temp}."
            f"Traffic risk is {risk}."
            f"Travel carefully during busy hours"
        )

    response = {
    "city": city,
    "memory_context": memory,
    "weather_analysis": analysis,
    "ai_explanation": ai_explanation,
    "agent_thought": "Generated using RAG + Weather + HuggingFace LLM"
}
    
    return response