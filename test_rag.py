from backend.rag.vector_store import retrieve_context
query = "traffic in Mumbai"

results = retrieve_context(query)

print("Query:", query)
print("Top matches:")
for r in results:
    print("-", r)