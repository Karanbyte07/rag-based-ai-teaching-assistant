import whisper

model = whisper.load_model("large-v2")
result = model.transcribe(
	audio = "data/audios/6_Binary & Decimal Number System.mp3",
	# audio = "sample_audio2.m4a",
	language="hi",
	task="translate",
)
print("audio is translated from hindi to english successfully!")
# print(result["segments"])