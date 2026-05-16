from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0"
)

def generate_hf_insight(prompt: str):

    result = generator(
        prompt,
        max_new_tokens=40,
        do_sample=False
    )

    full_text = result[0]["generated_text"]

    # remove original prompt completely
    generated = full_text[len(prompt):].strip()

    # fallback if model echoes prompt
    if not generated or "City:" in generated:

        return (
            "Traffic conditions appear manageable. "
            "Travel carefully and avoid crowded routes during peak hours."
        )

    return generated