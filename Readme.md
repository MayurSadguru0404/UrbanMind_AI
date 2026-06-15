# UrbanMind AI 🏙️

> An agentic smart city intelligence platform powered by LLMs, real-time weather data, and live traffic analysis.

![Tech Stack](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/LLM-Groq%20%2F%20LLaMA%203.3-FF6B35?style=flat)
![Tech Stack](https://img.shields.io/badge/Maps-Leaflet-22C55E?style=flat&logo=leaflet)
![Deployment](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel)
![Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)

---

## What is UrbanMind AI?

UrbanMind AI is a full-stack intelligent city monitoring platform that combines **real-time weather data**, **live traffic incident feeds**, and **LLM-powered analysis** to give city operators and travelers instant, accurate answers about urban conditions across Indian cities.

Ask it anything:
- *"What is the traffic situation in Mumbai right now?"*
- *"Should I travel from Pune to Bangalore today?"*
- *"Give me a weather and risk report for Chennai."*

---

## Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend | [urbanmind-ai.vercel.app](https://urban-mind-ai-ochre.vercel.app/) |
| ⚙️ Backend API | [urbanmind-backend.onrender.com](https://urbanmind-ai-backend.onrender.com) |
| 📖 API Docs | [urbanmind-backend.onrender.com/docs](https://urbanmind-backend.onrender.com/docs) |

> **Note:** The backend runs on Render's free tier. First request may take 30-60 seconds to wake up.

---

## Features

### 🤖 AI Chat
- Natural language queries about any Indian city
- Powered by **Groq + LLaMA 3.3 70B** for fast, accurate responses
- Conversation memory — remembers context across messages
- Auto-detects city names and route queries from natural language
- Module-aware responses (Traffic, Weather, Route Planning, Risk Assessment)

### 🗺️ Live City Map
- Interactive dark map powered by **Leaflet + CartoDB**
- All 15 monitored cities plotted with real weather and risk data
- Search any city in the world — map flies to it with live data
- Real **TomTom traffic incidents** shown as markers with delay info
- Live congestion flow data (current speed vs free flow speed)
- Filter cities by traffic risk level (High / Medium / Low)

### 📊 City Dashboard
- Live KPI cards from real backend data
- Temperature chart across all monitored cities (color-coded by heat)
- Traffic risk distribution chart
- Humidity trends line chart
- City highlights (hottest, coolest, high-risk alerts)
- Full monitored cities table with AI insights

### 🏠 Homepage
- Live stats from backend (cities monitored, avg temperature, risk alerts)
- Module cards for quick navigation
- Fully responsive — works on mobile and desktop

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| React Router v6 | Client-side routing |
| React Leaflet | Interactive maps |
| Recharts | Data visualization |
| Vercel | Deployment & hosting |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| Groq API (LLaMA 3.3 70B) | LLM inference |
| OpenWeatherMap API | Real-time weather data |
| TomTom Traffic API | Live traffic flow & incidents |
| Render | Backend hosting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  HomePage  │  ChatPage  │  Dashboard  │  MapPage        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST
┌──────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  /chat          →  City Agent  →  Groq LLM              │
│  /monitor       →  Live City Reports                     │
│  /city/{name}   →  OpenWeatherMap API                   │
│  /traffic/flow  →  TomTom Flow API                      │
│  /traffic/incidents → TomTom Incidents API              │
│  /health        →  Status check                         │
└──────────────────────────────────────────────────────────┘
         │                    │                    │
   OpenWeatherMap          TomTom              Groq API
   (Weather Data)     (Traffic Data)        (LLM Responses)
```

---
## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- API keys for OpenWeatherMap, Groq, and TomTom

### 1. Clone the repository
```bash
git clone https://github.com/MayurSadguru0404/UrbanMind_AI.git
cd UrbanMind_AI
```

### 2. Backend setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your API keys to .env
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
WEATHER_API_KEY=your_openweathermap_key
GROQ_API_KEY=your_groq_key
TOMTOM_API_KEY=your_tomtom_key
FRONTEND_URL=http://localhost:3000
```

### 4. Run the backend
```bash
uvicorn backend.main:app --reload
```
Backend will start at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### 5. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

### 6. Run the frontend
```bash
npm start
```
App will open at `http://localhost:3000`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Backend health check |
| `GET` | `/monitor` | All monitored cities with live weather + risk |
| `POST` | `/chat` | AI chat query with conversation history |
| `GET` | `/city/{name}` | Live weather + AI insight for any city |
| `GET` | `/traffic/flow/{city}` | Real-time traffic flow data |
| `GET` | `/traffic/incidents/{city}` | Live traffic incidents near a city |

### Example chat request
```json
POST /chat
{
  "query": "What is the traffic situation in Mumbai?",
  "history": [
    { "role": "user", "text": "Tell me about Mumbai" },
    { "role": "assistant", "text": "Mumbai is..." }
  ]
}
```

### Example response
```json
{
  "ai_explanation": "Given the current weather conditions in Mumbai with clear skies and a temperature of 31°C, the traffic risk is medium. Peak congestion is expected on the Western Express Highway between 8-10 AM and 6-8 PM. Overall road conditions are favorable for travel."
}
```

---

## Deployment

### Frontend — Vercel
1. Connect GitHub repo to Vercel
2. Set Root Directory to `frontend`
3. Add environment variable: `REACT_APP_API_URL=your_render_backend_url`
4. Deploy

### Backend — Render
1. Connect GitHub repo to Render
2. Set Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Add all environment variables (API keys + `FRONTEND_URL`)
4. Deploy

Every `git push` to `main` triggers automatic redeployment on both platforms.

---

## Monitored Cities

UrbanMind AI monitors **15 major Indian cities** on startup:

Pune • Mumbai • Delhi • Bangalore • Hyderabad • Chennai • Kolkata • Ahmedabad • Jaipur • Lucknow • Nagpur • Surat • Patna • Nashik • Indore

Additional cities can be searched on-demand via the map or chat interface.

---

## Get API Keys

| API | Free Tier | Link |
|-----|-----------|------|
| OpenWeatherMap | 1,000 calls/day | [openweathermap.org](https://openweathermap.org/api) |
| Groq | Generous free tier | [console.groq.com](https://console.groq.com) |
| TomTom | 2,500 calls/day | [developer.tomtom.com](https://developer.tomtom.com) |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT License — feel free to use this project for learning or portfolio purposes.

---

<div align="center">
  Built with ❤️ using FastAPI, React, Groq, and real-time city data APIs
</div>
