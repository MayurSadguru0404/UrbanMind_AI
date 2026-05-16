def analyze_weather(weather_data):
    temperature=weather_data['temperature']
    humidity=weather_data['humidity']
    condition=weather_data['weather']
    
    traffic_risk='Low'
    alert_level="Normal"
    risk_score=2
    recommendation="Traffic conditions looks normal."
    
    if "rain" in condition.lower():
        traffic_risk="High"
        alert_level="Warning"
        risk_score=8
        recommendation=(
            "Heavy rainfall may cause traffic congestion "
            "and slippery road conditions.")
        
    elif humidity>80:
        traffic_risk="Medium"
        alert_level="Moderate"
        risk_score=5
        recommendation=("High humidity may reduce visibility slightly")
        
    elif temperature>35:
        traffic_risk="Medium"
        alert_level="Moderate"
        risk_score=6
        recommendation=( "Extreme heat detected. Traffic flow may slow down.")
        
        
    analysis={
        "city":weather_data["city"],
        "weather_condition":condition,
        "temperature":temperature,
        "humidity":humidity,
        "traffic_risk":traffic_risk,
        "alert_level":alert_level,
        "traffic_risk_score":risk_score,
        "recommendation":recommendation
    }
    return analysis