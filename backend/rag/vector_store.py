from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# lightweight embedding model (good for i3)
model = SentenceTransformer('all-MiniLM-L6-v2')

# sample city knowledge base
documents = [
    "Mumbai has heavy traffic during monsoon season.",
    "Delhi suffers from high air pollution and traffic congestion.",
    "Bangalore has IT corridor traffic during office hours.",
    "Pune has moderate traffic but increases during peak hours."
]

# create embeddings
embeddings = model.encode(documents)

# create FAISS index
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

def retrieve_context(query):
    query_vec = model.encode([query])
    _, I = index.search(np.array(query_vec), k=2)

    results = [documents[i] for i in I[0]]
    return results