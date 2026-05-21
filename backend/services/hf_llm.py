import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_hf_insight(prompt: str):

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
         messages=[

            {
                "role": "system",

                "content":
                """
                You are UrbanMind AI,
                an intelligent smart-city traffic
                and travel analysis assistant.

                Give detailed, professional,
                realistic and complete responses.

                Never cut responses midway.

                Keep responses between
                120-180 words.
                """
            },

            {
                "role": "user",

                "content": prompt
            }
        ],

        temperature=0.7,

        max_tokens=300,

        top_p=0.95
    )

    return response.choices[0].message.content