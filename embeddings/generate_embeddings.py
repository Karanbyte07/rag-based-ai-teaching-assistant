import json
import os
import pandas as pd
import joblib

from embedding_utils import create_embedding

chunks_dir = "data/chunks"

# final data to save
embedded_data = []

# loop through every file inside the chunks directory
for file in os.listdir(chunks_dir):
    # build complete file path
    path = os.path.join(chunks_dir, file)

    # read chunks from json file
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # extract the text from the chunks
    texts = [chunk["text"] for chunk in data["chunks"]]

    print(f"creating embedding for {file}")

    # create embeddings in one batch for all the texts
    embeddings = create_embedding(texts)

    # print(f"Created {len(embeddings)} embeddings for {file}")


    # combine metadata and embeddings for each chunk
    for i, chunk in enumerate(data["chunks"]):
        embedded_data.append(
            {
                "chunk_id": i,
                **chunk,  # it take all the arguments in chunks.json here.
                "embedding": embeddings[i],
            }
        )
        if i == 1:
            break
    break
    # print(embedded_data)


# save embedding into panda dataframe
df = pd.DataFrame.from_records(embedded_data)

joblib.dump(df, "data/embeddings/embeddings.pkl")

print("Embeddings Saved Successfully")