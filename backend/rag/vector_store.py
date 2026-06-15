from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

documents = [
    "Mumbai has heavy traffic during monsoon season.",
    "Delhi suffers from high air pollution and traffic congestion.",
    "Bangalore has IT corridor traffic during office hours.",
    "Pune has moderate traffic but increases during peak hours."
]

embeddings = model.encode(documents)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

def retrieve_context(query):
    query_vec = model.encode([query])
    _, I = index.search(np.array(query_vec), k=2)

    results = [documents[i] for i in I[0]]
    return results
