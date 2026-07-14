import whisper
import os
import json


# Input and output directories
audio_dir = "data/audios"
transcript_dir = "data/transcripts"

model = whisper.load_model("base")


audios = os.listdir(audio_dir)

for audio in audios:
    audio_path = os.path.join(audio_dir, audio)
    print(f"Transcribing {audio}........")

    
    #transcribe the audio
    result = model.transcribe(
        audio=audio_path,
        language="hi",
        task="translate"
    )

    #output file name
    output_file = audio.replace(".mp3", ".json")

    #output path
    output_path = os.path.join(transcript_dir, output_file)

    #save transcript (use UTF-8 to avoid Windows encoding errors)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Saved: {output_file} in {transcript_dir}")



print("All audio files have been transcribed Successfully!")
