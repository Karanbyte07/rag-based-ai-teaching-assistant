import json
import os
from transcribe import result

base_dir = os.path.dirname(os.path.dirname(__file__))
chunk_dir = os.path.join(base_dir, "data", "chunks")
chunk_path = os.path.join(chunk_dir, "chunks.json")

audios = os.listdir("data/audios")

for audio in audios:
    # print(audio)
    if("_" in audio):
        tutorial_num = audio.split("_")[0]
        tutorial_name = audio.split("_")[1][:-4]
    # print(f"tutorial number:->  {tutorial_num}  tutorial name:-> {tutorial_name}" )



# creating a chunks from the segments
chunks = []
for segment in result['segments']:
    chunks.append({"tutorial_number":tutorial_num,
                   "tutorial_name":tutorial_name,
                    "start": segment['start'],
                    "end": segment['end'], 
                    "text": segment['text']})
    chunk_with_metadata = {"chunks": chunks, "text" : result["text"]}
    

# print(chunks_with_metadata)


#saving chunks in data/chunks
os.makedirs(chunk_dir, exist_ok=True)
with open(chunk_path, "w") as f:
    json.dump(chunk_with_metadata, f)

display_path = os.path.join(os.path.basename(base_dir), "data", "chunks", "chunks.json")
print(f"Your audio is converted into the texts succesfully!{display_path}")