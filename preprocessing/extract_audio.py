import os
import subprocess

files = os.listdir("videos")
for file in files:
    # Divide the file name using the actual colon in the filename.
    parts = file.split("：", 1)

    # Splits "Lecture 2" by space and takes the second item ("2")
    file_number = parts[0].split(" ")[1]
    # Removes the trailing ".mkv" extension from the second part to get tutorial name
    file_name = parts[1].split(".mkv")[0].strip()

    print(f"Tutorial Number: {file_number}")
    print(f"Tutorial Name: {file_number}")
    subprocess.run(["ffmpeg", "-i", f"videos/{file}", f"audios/{file_number}_{file_name}.mp3"])