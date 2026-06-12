from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.agents.city_agent import city_agent
from backend.data.live_cities import live_city_reports
from backend.services.weather_service import get_weather
from backend.agents.weather_agent import weather_agent
from backend.services.hf_llm import generate_hf_insight
from backend.services.traffic_service import get_traffic_flow, get_traffic_incidents

router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    history: list = []


@router.post("/chat")
def chat(request: ChatRequest):
    result = city_agent(request.query, request.history)
    return result


@router.get("/monitor")
def monitor():
    critical = sum(1 for city in live_city_reports if city.get("traffic_risk") == "High")
    return {
        "cities": live_city_reports,
        "total_cities": len(live_city_reports),
        "critical_cities": critical,
    }


@router.get("/city/{city_name}")
def get_city_data(city_name: str):
    # First check if already in live reports
    existing = next(
        (c for c in live_city_reports if c["city"].lower() == city_name.lower()),
        None
    )
    if existing:
        return existing

    # Otherwise fetch fresh from OpenWeatherMap
    weather_data = get_weather(city_name)

    if "error" in weather_data:
        raise HTTPException(
            status_code=404,
            detail=f"Could not fetch weather for '{city_name}'. Check the city name and try again."
        )

    weather_result = weather_agent(weather_data)
    weather_result["lat"] = weather_data.get("lat")
    weather_result["lng"] = weather_data.get("lng")

    prompt = f"""
    City: {city_name}
    Weather: {weather_data}
    Traffic Risk: {weather_result.get('traffic_risk', 'Unknown')}
    Give a concise traffic and travel insight in under 40 words.
    """

    ai_insight = generate_hf_insight(prompt)

    return {
        **weather_result,
        "city": weather_data["city"],
        "ai_insight": ai_insight,
    }
@router.get("/traffic/flow/{city_name}")
def traffic_flow(city_name: str):
    # Get city coordinates from weather API first
    weather_data = get_weather(city_name)
    if "error" in weather_data:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found.")

    lat = weather_data["lat"]
    lng = weather_data["lng"]

    flow = get_traffic_flow(lat, lng)
    if "error" in flow:
        raise HTTPException(status_code=503, detail=flow["error"])

    return {
        "city": weather_data["city"],
        "lat": lat,
        "lng": lng,
        **flow,
    }


@router.get("/traffic/incidents/{city_name}")
def traffic_incidents(city_name: str):
    # Get city coordinates from weather API first
    weather_data = get_weather(city_name)
    if "error" in weather_data:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found.")

    lat = weather_data["lat"]
    lng = weather_data["lng"]

    incidents = get_traffic_incidents(lat, lng)

    return {
        "city": weather_data["city"],
        "lat": lat,
        "lng": lng,
        "total_incidents": len(incidents),
        "incidents": incidents,
    }