from fastapi import APIRouter
from backend.services.weather_service import get_weather

router = APIRouter()

@router.get("/status")
def get_status():
    return {"status": "UrbanMind AI API Running"}

@router.get("/weather/{city}")
def weather(city: str):
    return get_weather(city)