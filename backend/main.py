from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.services.monitor_service import refresh_all_cities


@asynccontextmanager
async def lifespan(app: FastAPI):
    refresh_all_cities()
    yield


app = FastAPI(
    title="UrbanMind AI",
    description="Agentic Smart City Intelligence Platform",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {"message": "UrbanMind AI Backend Running", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}