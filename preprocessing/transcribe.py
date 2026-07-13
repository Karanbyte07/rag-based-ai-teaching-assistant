import os
import json
import requests
from dotenv import load_dotenv

# load environment variables 
load_dotenv()

# directories
audio_dir = "data/audios"
transcript_dir = "data/transcripts"

# read whisper config from env
WHISPER_API_KEY = os.getenv("AZURE_WHISPER_API_KEY")
WHISPER_BASE_URL = os.getenv("AZURE_WHISPER_BASE_URL")

# loop through audios
for audio in os.listdir(audio_dir):
    audio_path = os.path.join(audio_dir, audio)

    with open(audio_path, "rb") as f:
        files = {"files": f}
        data = {
            "language": "hi",
            "task": "translate"
        }
        response = requests.post(
            f"{WHISPER_BASE_URL}/audio/transcriptions",
            headers={"api-key": WHISPER_API_KEY},
            data=data,
            files=files
        )

    result = response.json()

    # Save transcript with same name as audio (indented to be inside the loop)
    transcript_filename = os.path.splitext(audio)[0] + ".json"
    transcript_path = os.path.join(transcript_dir, transcript_filename)

    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Transcribed and saved: {transcript_filename}")


