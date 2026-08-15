from fastapi import APIRouter
from pydantic import BaseModel
from openai import AzureOpenAI
from dotenv import load_dotenv
import os

from google import genai

from rag.retrieve import retrieve

load_dotenv()

router = APIRouter()

# ── Provider selection ──────────────────────────────────────────────────────
# Set LLM_PROVIDER=gemini  to use Google Gemini
# Set LLM_PROVIDER=azure   (or leave unset) to use Azure OpenAI
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "azure").lower()

# ── Azure OpenAI client (only initialised when needed) ─────────────────────
azure_client = None
if LLM_PROVIDER == "azure":
    azure_client = AzureOpenAI(
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
        api_version="2025-04-01-preview",
    )

# ── Gemini client (only initialised when needed) ───────────────────────────
gemini_client = None
if LLM_PROVIDER == "gemini":
    gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# ── Pydantic schemas ────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    video_id: str | None = None
    top_k: int = 5


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


# ── Prompt builder ──────────────────────────────────────────────────────────
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


# ── LLM call helper ─────────────────────────────────────────────────────────
def call_llm(prompt: str) -> str:
    if LLM_PROVIDER == "gemini":
        model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")
        response = gemini_client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        return response.text
    else:
        # Azure OpenAI
        response = azure_client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content


# ── Route ───────────────────────────────────────────────────────────────────
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
    answer = call_llm(prompt)

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