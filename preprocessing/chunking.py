import json
import os

base_dir = os.path.dirname(os.path.dirname(__file__))

chunk_dir = os.path.join(base_dir, "data", "chunks")

# Ensure the output directory exists (creates it if not present)
os.makedirs(chunk_dir, exist_ok=True)

CHUNK_SIZE = 45
OVERLAP = 10

# Loop through every transcript
for transcript_file in os.listdir("data/transcripts"):
    with open(f"data/transcripts/{transcript_file}", "r", encoding="utf-8") as f:
        result = json.load(f)

    # Remove .json extension
    filename = transcript_file.replace(".json", "")

    # Extract tutorial number and tutorial name
    if "_" in filename:
        tutorial_num = filename.split("_")[0]
        tutorial_name = filename.split("_")[1]

    # Creating chunks from the segments
    chunk_id = 0
    merged_chunks = []
    current_text = ""
    current_start = None
    current_end = None

    for segment in result["segments"]:

        # First segment of current chunk
        if current_start is None:
            current_start = segment["start"]

        current_text += " " + segment["text"]
        current_end = segment["end"]

        # Check if chunk has reached the desired size
        if current_end - current_start >= CHUNK_SIZE:
            merged_chunks.append(
                {
                    "chunk_id": chunk_id,
                    "tutorial_number": tutorial_num,
                    "tutorial_name": tutorial_name,
                    "start": current_start,
                    "end": current_end,
                    "duration": current_end - current_start,
                    "text": current_text.strip(),
                }
            )
            chunk_id += 1

            # Reset for next chunk
            current_text = ""
            current_start = None
            current_end = None

    chunk_with_metadata = {"chunks": merged_chunks, "text": result["text"]}

    # Save using same filename (using absolute path via chunk_dir)
    output_file = filename + "_chunks.json"
    with open(os.path.join(chunk_dir, output_file), "w", encoding="utf-8") as f:
        json.dump(chunk_with_metadata, f, ensure_ascii=False, indent=2)
    print(f"Saved {output_file} in {chunk_dir}")

print("All transcripts converted into chunks successfully!")
