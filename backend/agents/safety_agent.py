def safety_agent(alert_level):
    if alert_level=="Critical":
        return "Travel should be avoided unless necessary."
    if alert_level=="Warning":
        return "Travel carefully and avoid crowded routes."
    return "Travel conditions currently appear safe."