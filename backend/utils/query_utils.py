import os
import pickle
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

# Load Groq API key
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

def query_vector_db(query, store_dir="vector_store", top_k=3):
    """
    Given a user query, searches FAISS index and returns top similar pages.
    """
    query_vec = model.encode([query])
    index = faiss.read_index(os.path.join(store_dir, "faiss.index"))

    D, I = index.search(np.array(query_vec).astype('float32'), k=top_k)

    with open(os.path.join(store_dir, "metadata.pkl"), "rb") as f:
        pages = pickle.load(f)

    top_pages = [pages[i] for i in I[0]]
    return top_pages


def summarize_with_llm(query, passages, is_quiz=False):
    """
    Uses Groq to generate an answer using top-matched passages.
    """
    limited_passages = passages[:3]
    context_chunks = []
    for p in limited_passages:
        text = p['text']
        if len(text) > 500:
            text = text[:500] + "..."
        context_chunks.append(f"Page {p['page']}:\n{text}")

    context = "\n\n".join(context_chunks)

    if is_quiz:
        prompt = f"""Using the following context from a document, generate 5 multiple choice quiz questions with 4 options each. Provide the correct answer at the end.

Context:
{context}"""
    else:
        prompt = f"""Answer the question using only the context below.

Context:
{context}

Question:
{query}

Answer:"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )

    for chunk in response:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content
