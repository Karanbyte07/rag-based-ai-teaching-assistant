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
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2025-04-01-preview",
    azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
)

def inference_openai(prompt):
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=[{"role": "user", "content": prompt}],
    )
    return response

prompt = f"""You are an expert AI teaching assistant for a programming course. \
Students ask you questions about course video content, and you answer using ONLY \
the transcript context provided below — which comes directly from the actual lecture videos.

HOW TO ANSWER — always follow this structure:

1. ANSWER THE QUESTION FIRST: Using the actual content in the context chunks, explain \
the concept/topic clearly and directly — as if you are teaching it yourself, based on \
what was actually said in the lecture. Do not just point to a timestamp — explain what \
is taught there, in your own words, grounded in the transcript content.

2. THEN CITE THE SOURCE: After explaining, tell the student exactly where this is covered, \
e.g., "This is covered in '{{video_title}}' between 2:15 and 4:40." If the explanation \
draws from multiple chunks or videos, cite each one for the relevant part of your answer.

3. FOR BROAD/SUMMARY QUESTIONS (e.g., "what is taught in this video", "summarize this"):
   - Give a proper summary of ALL topics covered in the given context, explained briefly, \
each with its timestamp — organized in the order they appear.

4. IF THE CONTEXT GENUINELY DOES NOT CONTAIN THE ANSWER: only then say \
"This topic is not covered in the course material." Do not use this for broad/summary \
questions — always summarize whatever is available for those.

5. Never make up information that isn't in the context — if the transcript is unclear or \
incomplete on a point, say so rather than guessing.

6. Use MM:SS format for timestamps, and keep the explanation clear and student-friendly \
(as if tutoring a beginner).

CONTEXT (Transcript chunks from lecture videos):
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