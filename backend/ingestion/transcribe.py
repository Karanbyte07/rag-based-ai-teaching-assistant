import gc
from faster_whisper import WhisperModel


def transcribe_audio(audio_path: str) -> list[dict]:
    model = WhisperModel("tiny", device="cpu", compute_type="int8")

    segments_gen, _ = model.transcribe(
        audio_path,
        language="hi",
        task="translate",
        beam_size=1,
        vad_filter=True,
    )

    result_segments = []
    for seg in segments_gen:
        result_segments.append({
            "text": seg.text,
            "start": seg.start,
            "end": seg.end,
        })

    del model
    gc.collect()

    return result_segments