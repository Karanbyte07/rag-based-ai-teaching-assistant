# embeddings/generate_embeddings.py

import pandas as pd
import joblib
import os
from embeddings.embedding_utils import create_embedding

EMBEDDINGS_PATH = "data/embeddings/embeddings.pkl"

def embed_and_store(chunks: list[dict]):
    os.makedirs("data/embeddings", exist_ok=True)

    texts = [chunk["text"] for chunk in chunks]
    embeddings = create_embedding(texts)

    for i, chunk in enumerate(chunks):
        chunk["embedding"] = embeddings[i]

    new_df = pd.DataFrame.from_records(chunks)

    # append to existing embeddings if file already exists
    if os.path.exists(EMBEDDINGS_PATH):
        old_df = joblib.load(EMBEDDINGS_PATH)
        combined_df = pd.concat([old_df, new_df], ignore_index=True)
    else:
        combined_df = new_df

    joblib.dump(combined_df, EMBEDDINGS_PATH)
    print(f"Stored {len(chunks)} chunks. Total in store: {len(combined_df)}")