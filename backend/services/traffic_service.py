import requests
import os
from dotenv import load_dotenv

load_dotenv()

TOMTOM_KEY = os.getenv("TOMTOM_API_KEY")


def get_traffic_flow(lat: float, lng: float):
    """Get real-time traffic flow for a coordinate."""
    try:
        url = (
            f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
            f"?point={lat},{lng}&key={TOMTOM_KEY}"
        )
        res = requests.get(url, timeout=10)
        data = res.json()

        if "flowSegmentData" not in data:
            return {"error": "No flow data found"}

        flow = data["flowSegmentData"]
        current_speed = flow.get("currentSpeed", 0)
        free_flow_speed = flow.get("freeFlowSpeed", 1)
        confidence = flow.get("confidence", 0)

        # Calculate congestion percentage
        congestion = round((1 - current_speed / free_flow_speed) * 100)
        congestion = max(0, min(100, congestion))

        # Determine congestion level
        if congestion >= 60:
            level = "Heavy"
        elif congestion >= 30:
            level = "Moderate"
        else:
            level = "Free Flow"

        return {
            "current_speed_kmh": current_speed,
            "free_flow_speed_kmh": free_flow_speed,
            "congestion_percent": congestion,
            "congestion_level": level,
            "confidence": confidence,
        }

    except Exception as e:
        return {"error": str(e)}


def get_traffic_incidents(lat: float, lng: float, radius_km: int = 10):
    """Get real-time traffic incidents around a coordinate."""
    try:
        # Bounding box around the coordinate
        offset = radius_km / 111  # roughly 1 degree = 111km
        bbox = f"{lng - offset},{lat - offset},{lng + offset},{lat + offset}"

        url = (
            f"https://api.tomtom.com/traffic/services/5/incidentDetails"
            f"?bbox={bbox}&fields={{incidents{{type,geometry{{type,coordinates}},"
            f"properties{{iconCategory,magnitudeOfDelay,events{{description,code}},"
            f"startTime,endTime,from,to,length,delay,roadNumbers}}}}}}"
            f"&language=en-GB&timeValidityFilter=present&key={TOMTOM_KEY}"
        )

        res = requests.get(url, timeout=10)
        data = res.json()

        incidents = []
        for inc in data.get("incidents", []):
            props = inc.get("properties", {})
            geom = inc.get("geometry", {})
            coords = geom.get("coordinates", [])

            # Get coordinates
            if geom.get("type") == "Point":
                inc_lng, inc_lat = coords[0], coords[1]
            elif geom.get("type") == "LineString" and coords:
                inc_lng, inc_lat = coords[0][0], coords[0][1]
            else:
                continue

            events = props.get("events", [])
            description = events[0].get("description", "Traffic incident") if events else "Traffic incident"

            delay = props.get("delay", 0)
            magnitude = props.get("magnitudeOfDelay", 0)

            if magnitude >= 3:
                severity = "high"
            elif magnitude >= 2:
                severity = "medium"
            else:
                severity = "low"

            incidents.append({
                "lat": inc_lat,
                "lng": inc_lng,
                "description": description,
                "severity": severity,
                "delay_seconds": delay,
                "from": props.get("from", ""),
                "to": props.get("to", ""),
                "road": props.get("roadNumbers", [""])[0] if props.get("roadNumbers") else "",
            })

        return incidents

    except Exception as e:
        return []