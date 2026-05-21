def traffic_agent(analysis):
    risk=analysis["traffic_risk"]
    
    if risk=="High":
        return "Heavy traffic congestion expected."
    if risk=="Medium":
        return "Moderate traffic conditions detected."
    return "Traffic flow appears manageable."