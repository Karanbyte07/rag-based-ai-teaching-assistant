import os
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer

# Load environment variables from .env file
load_dotenv()

# Load model and it cacheds locally
MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)

# Process texts in batches to avoid memory spikes on large corpora
BATCH_SIZE = 64


def create_embedding(texts):
    all_embeddings = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        batch_embeddings = model.encode(batch, show_progress_bar=False)
        all_embeddings.extend(batch_embeddings.tolist())

    return all_embeddings



# texts = ["tell me about the taj mahal", "how are you doing?"]
# result = create_embedding(texts)
# print("Embedding shape:", len(result[0]))  # should print 384
