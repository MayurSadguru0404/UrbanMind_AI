from fastapi import APIRouter
from pydantic import BaseModel

from backend.agents.city_agent import city_agent
from backend.data.live_cities import live_city_reports

router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    history: list = []


@router.post("/chat")
def chat(request: ChatRequest):

    result = city_agent(
        request.query,
        request.history
    )

    return result


@router.get("/monitor")
def monitor():

    critical = 0

    for city in live_city_reports:

        if city.get("traffic_risk") == "High":
            critical += 1

    return {
        "cities": live_city_reports,
        "total_cities": len(live_city_reports),
        "critical_cities": critical
    }