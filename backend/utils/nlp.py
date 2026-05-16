import spacy

nlp = spacy.load("en_core_web_sm")

KNOWN_CITIES = [
    "Mumbai",
    "Nashik",
    "Baramati",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Pune",
    "Hyderabad",
    "Kolkata"
]

def extract_city(query: str):

    # First check known cities manually
    for city in KNOWN_CITIES:

        if city.lower() in query.lower():
            return city

    # Then fallback to spaCy
    doc = nlp(query)

    for ent in doc.ents:

        if ent.label_ == "GPE":
            return ent.text

    return None