from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import extract_topics
from app.routes import generate_questions
from app.routes import send_email
from app.routes import failed_topics

app = FastAPI()

# Allow CORS (customize origins in prod!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register your route
app.include_router(extract_topics.router)
app.include_router(generate_questions.router)
app.include_router(send_email.router)
app.include_router(failed_topics.router)