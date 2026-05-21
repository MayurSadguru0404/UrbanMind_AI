from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router

from backend.services.monitor_service import refresh_all_cities

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def startup_event():

    refresh_all_cities()

@app.get("/")
def home():
    return {"message": "UrbanMind AI Backend Running"}