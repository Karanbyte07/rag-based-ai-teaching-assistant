from rag.retrieve import retrieve
from openai import OpenAI
import os


incoming_query = input("Ask a question: ")
results = retrieve(incoming_query)

client = OpenAI(
    base_url = os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
)

def inference_openai(prompt):
    response = client.chat.completions.create(
        model = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages = [{"role": "user", "content": prompt}],
    )
    return response
    

prompt = f"""You are an expert AI teaching assistant for a programming course. \
Your role is to help students find exactly where specific topics are covered in the course videos.

INSTRUCTIONS:
- Answer the student's question using ONLY the context provided below.
- Identify the relevant video(s) and timestamp(s) where the topic is taught.
- Guide the student to the exact video and timestamp (e.g., "Watch Tutorial 5 at 2:35").
- If the topic is not found in the context, respond with: "This topic is not covered in the course material."
- Be concise, clear, and helpful.

CONTEXT (Video Subtitle Chunks):
{results[["tutorial_number", "tutorial_name", "start", "end", "text"]].to_string()}

STUDENT QUESTION:
{incoming_query}
"""



# for index, row in results.iterrows():
#     print(f"Tutorial Number: {row['tutorial_number']}")
#     print(f"Tutorial Name: {row['tutorial_name']}")
#     print(f"Duration: {row['duration']}")
#     print(f"Text: {row['text']}")
#     print("-" * 50)

with open("prompt.txt", "w", encoding="utf-8") as f:
    f.write(prompt)
    
response = inference_openai(prompt)
# print(response.choices[0].message.content)

with open("response.txt", "w", encoding="utf-8") as f:
    f.write(response.choices[0].message.content)