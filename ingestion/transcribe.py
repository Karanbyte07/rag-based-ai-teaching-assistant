from faster_whisper import WhisperModel

model = WhisperModel("base", device="cpu", compute_type="int8")

def transcribe_audio(audio_path: str) -> list[dict]:
    """
    Transcribes + translates audio to English.
    Returns list of segments: [{text, start, end}, ...]
    """
    segments, info = model.transcribe(
        audio_path,
        language="hi",
        task="translate",
    )

    result_segments = []
    for seg in segments:
        result_segments.append({
            "text": seg.text,
            "start": seg.start,
            "end": seg.end,
        })

    return result_segments