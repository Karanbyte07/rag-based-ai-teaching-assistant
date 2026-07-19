import requests
import json
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

AZURE_EMBEDDING_ENDPOINT = os.getenv("AZURE_EMBEDDING_ENDPOINT", "").rstrip("/")
AZURE_EMBEDDING_MODEL = os.getenv("AZURE_EMBEDDING_MODEL", "text-embedding-3-small")
AZURE_EMBEDDING_DEPLOYMENT = os.getenv("AZURE_EMBEDDING_DEPLOYMENT", "")
AZURE_EMBEDDING_OPENAI_API_VERSION = os.getenv("AZURE_EMBEDDING_OPENAI_API_VERSION", "2023-05-15")
AZURE_EMBEDDING_OPEN_API_KEY = os.getenv("AZURE_EMBEDDING_OPEN_API_KEY", "")
AZURE_EMBEDDING_CHUNK_SIZE = int(os.getenv("AZURE_EMBEDDING_CHUNK_SIZE", "1000"))


def create_embedding(texts):
    url = (
        f"{AZURE_EMBEDDING_ENDPOINT}/openai/deployments/"
        f"{AZURE_EMBEDDING_DEPLOYMENT}/embeddings?api-version={AZURE_EMBEDDING_OPENAI_API_VERSION}"
    )

    all_embeddings = []
    for i in range(0, len(texts), AZURE_EMBEDDING_CHUNK_SIZE):
        batch = texts[i : i + AZURE_EMBEDDING_CHUNK_SIZE]
        r = requests.post(
            url,
            headers={"api-key": AZURE_EMBEDDING_OPEN_API_KEY, "Content-Type": "application/json"},
            json={"input": batch, "model": AZURE_EMBEDDING_MODEL},
            timeout=120,
        )
        response = r.json()
        all_embeddings.extend([item["embedding"] for item in response["data"]])

    return all_embeddings


# a = create_embedding(["tell me about the tajmahal", "how are you doing?"])
# print(len(a[0]))

chunks_dir = "data/chunks"

#loop through every file inside the chunks directory
for file in os.listdir(chunks_dir):

    #build complete file path
    path = os.path.join(chunks_dir, file)

    #read chunks from json file
    with open(path, "r") as f:
        data = json.load(f)
    
    #extract the text from the chunks
    texts = [chunk["text"] for chunk in data["chunks"]]


    #create embeddings in one batch for all the texts
    embeddings = create_embedding(texts)

    # print(f"Created {len(embeddings)} embeddings for {file}")
    
    # final data to save 
    embedded_data = []

    # combine metadata and embeddings for each chunk
    for i, chunk in enumerate(data["chunks"]):
         embedded_data.append({ 
            "chunk_id": i,
            **chunk, #it take all the arguments in chunks.json here.
            "embedding": embeddings[i]
            })

    print(embedded_data)