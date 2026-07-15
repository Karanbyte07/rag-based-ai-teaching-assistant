import json
import os

base_dir = os.path.dirname(os.path.dirname(__file__))

chunk_dir = os.path.join(base_dir, "data", "chunks")


#loop through every transcript
for transcript_file in os.listdir("data/transcripts"):
    with open(f"data/transcripts/{transcript_file}", "r", encoding="utf-8") as f:
        result = json.load(f)

    # Remove .json extension
    filename = transcript_file.replace(".json", "")

    # Extract tutorial number and tutorial name
    if "_" in filename:
        tutorial_num = filename.split("_")[0]
        tutorial_name = filename.split("_")[1]

    # creating a chunks from the segments
    chunks = []
    for segment in result["segments"]:
        chunks.append(
            {
                "tutorial_number": tutorial_num,
                "tutorial_name": tutorial_name,
                "start": segment["start"],
                "end": segment["end"],
                "duration": segment["end"] - segment["start"],
                "text": segment["text"],
            }
        )

    chunk_with_metadata = {"chunks": chunks, "text": result["text"]}

    #save using same filename
    output_file = filename + "_chunks.json"
    with open(f"data/chunks/{output_file}", "w", encoding="utf-8") as f:
        json.dump(chunk_with_metadata, f, ensure_ascii=False, indent=2)
    print(f"Saved {output_file} in {chunk_dir}")

print("All transcripts converted into chunks succesfully!")
