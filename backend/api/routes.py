from fastapi import APIRouter
from backend.services.weather_service import get_weather
from backend.services.city_analyzer import analyze_weather
from backend.services.llm_summary import generate_summary
from backend.services.llm_service import generate_llm_summary
from backend.agents.city_agent import city_agent
from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str

router = APIRouter()

@router.get("/status")
def get_status():
    return {"status": "UrbanMind AI API Running"}

@router.get("/weather/{city}")
def weather(city: str):

    weather_data = get_weather(city)

    if "error" in weather_data:
        return weather_data

    analysis = analyze_weather(weather_data)

    return analysis

@router.get("/monitor")
def monitor_cities():
    cities=["Mumbai","Pune","Nashik","Baramati","Delhi","Bangalore"]
    reports=[]
    critical_cities=[]
    for city in cities:
        weather_data=get_weather(city)
        if "error" in weather_data:
            continue
        analysis = analyze_weather(weather_data)
        analysis["ai_insight"] = generate_llm_summary(analysis)
        reports.append(analysis)
        
        if analysis["traffic_risk"]=="High":
            critical_cities.append(city)
    return{
        "cities_monitored":len(reports),
        "critical_cities":critical_cities,
        "reports":reports
    }
    
@router.get("/agent/{query}")
def agent(query: str):
    return city_agent(query)

@router.post("/chat")
def chat(request: QueryRequest):

    result = city_agent(request.query)

    print(result)

    return result