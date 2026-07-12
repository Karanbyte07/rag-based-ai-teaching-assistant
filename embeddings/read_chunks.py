import requests
import json
import os


def create_embedding(texts):
    r = requests.post(
        "http://localhost:11434/api/embed",
        json={"model": "bge-m3", "input": texts},
    )
    response = r.json()
    if "embeddings" not in response:
        print(f"API Response: {response}")
        raise KeyError(f"'embeddings' not in API response. Got: {list(response.keys())}")
    return response["embeddings"]


# a = create_embedding(["tell me about the tajmahal", "how are you doing?"])
# print(a)

chunks_dir = "data/chunks"

#loop through every file inside the chunks directory
for file in os.listdir(chunks_dir):

    #skip the file if it is not a json file
    if not file.endswith(".json"):
        continue

    #build complete file path
    path = os.path.join(chunks_dir, file)

    #read chunks from json file
    with open(path, "r") as f:
        data = json.load(f)
    
    #extract the text from the chunks
    texts = [chunk["text"] for chunk in data["chunks"]]


    #create embeddings in one batch for all the texts
    embeddings = create_embedding(texts)

    #print(f"Created {len(embeddings)} embeddings for {file}")
    
    #final data to save 
    embedded_data = []

    #combine metadata and embeddings for each chunk
    for i, chunk in enumerate(data["chunks"]):
        embedded_data.append({**chunk, "chunk_id": i, "embedding": embeddings[i]})

    #create output filename
    output_file = file.replace(".json", "_embedded.json")

    #save the file into new folder embeddings
    with open(os.path.join("data/embeddings", output_file), "w") as f:
        json.dump({"chunks": embedded_data}, f, indent=4)