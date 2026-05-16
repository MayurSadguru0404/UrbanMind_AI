def generate_summary(city_data):
    city=city_data['city']
    weather=city_data['weather_condition']
    risk=city_data['traffic_risk']
    recommendation=city_data['recommendation']
    
    summary=(f"In {city}, current weather conditions show {weather}.")
    
    if risk=="High":
        summary += (
            "This may significantly impact traffic flow, "
            "leading to delays and congestion. ")
    elif risk=="Medium":
        summary +=(
            "There is a moderate impact expected on traffic conditions. ")
    else:
         summary += (
            "Traffic conditions are expected to remain stable. "
        )

    summary += f" Recommendation: {recommendation}"
    return summary