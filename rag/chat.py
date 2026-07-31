from rag.retrieve import retrieve
from openai import AzureOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

incoming_query = input("Ask a question: ")
results = retrieve(incoming_query)

# results ko readable text mein convert karo prompt ke liye
context_text = "\n\n".join(
    f"[{r['title']} | {r['start']:.1f}s - {r['end']:.1f}s]\n{r['text']}"
    for r in results
)

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    api_version="2025-04-01-preview",
)

def inference_openai(prompt):
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=[{"role": "user", "content": prompt}],
    )
    return response

prompt = f"""You are an expert AI teaching assistant for a programming course. \
Your role is to help students find exactly where specific topics are covered in the course videos.

INSTRUCTIONS:
- Answer the student's question using ONLY the context provided below.
- Identify the relevant video(s) and timestamp(s) where the topic is taught.
- Guide the student to the exact video and timestamp (e.g., "Watch [Video Title] at 2:35").
- If the topic is not found in the context, respond with: "This topic is not covered in the course material."
- Be concise, clear, and helpful.

CONTEXT (Video Chunks):
{context_text}

STUDENT QUESTION:
{incoming_query}
"""

with open("data/prompt.txt", "w", encoding="utf-8") as f:
    f.write(prompt)

response = inference_openai(prompt)

with open("data/response.txt", "w", encoding="utf-8") as f:
    f.write(response.choices[0].message.content)

print(response.choices[0].message.content)