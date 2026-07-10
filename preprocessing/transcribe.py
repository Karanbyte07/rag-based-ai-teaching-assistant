import whisper

model = whisper.load_model("base")
result = model.transcribe(
	"data/audios/6_Binary & Decimal Number System.mp3",
	language="hi",
	task="translate",
)
print("audio is translated from hindi to english successfully!")
# print(result["segments"])