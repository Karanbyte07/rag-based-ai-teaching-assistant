from fastapi import APIRouter
from pydantic import BaseModel
from openai import AzureOpenAI
from dotenv import load_dotenv
import os

from rag.retrieve import retrieve

load_dotenv()

router = APIRouter()

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    api_version="2025-04-01-preview",
)


class ChatRequest(BaseModel):
    question: str
    video_id: str | None = None
    top_k: int = 5


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


def build_prompt(question: str, context_text: str) -> str:
    return f"""You are an expert AI teaching assistant. \
Students ask you questions about course video content, and you answer using ONLY \
the transcript context provided below — which comes directly from the actual lecture videos.

HOW TO ANSWER — always follow this structure:

1. ANSWER THE QUESTION FIRST: Using the actual content in the context chunks, explain \
the concept/topic clearly and directly — as if you are teaching it yourself, based on \
what was actually said in the lecture.

2. THEN CITE THE SOURCE: After explaining, tell the student exactly where this is covered, \
e.g., "This is covered in '{{video_title}}' between 2:15 and 4:40."

3. FOR BROAD/SUMMARY QUESTIONS: Give a proper summary of ALL topics covered in the given \
context, each with its timestamp — organized in the order they appear.

4. IF THE CONTEXT GENUINELY DOES NOT CONTAIN THE ANSWER: only then say \
"This topic is not covered in the course material."

5. Never make up information that isn't in the context.

6. Use MM:SS format for timestamps.

CONTEXT (Transcript chunks from lecture videos):
{context_text}

STUDENT QUESTION:
{question}
"""


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    results = retrieve(payload.question, top_k=payload.top_k, video_id=payload.video_id)

    if not results:
        return ChatResponse(
            answer="No course content has been ingested yet, so I can't answer this.",
            sources=[],
        )

    context_text = "\n\n".join(
        f"[{r['title']} | {r['start']:.1f}s - {r['end']:.1f}s]\n{r['text']}"
        for r in results
    )

    prompt = build_prompt(payload.question, context_text)

    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=[{"role": "user", "content": prompt}],
    )

    answer = response.choices[0].message.content

    sources = [
        {
            "title": r["title"],
            "video_id": r["video_id"],
            "start": r["start"],
            "end": r["end"],
            "score": r["score"],
        }
        for r in results
    ]

    return ChatResponse(answer=answer, sources=sources)