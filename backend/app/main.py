from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import extract_topics

app = FastAPI()

# Allow CORS (you can restrict to your frontend domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(extract_topics.router)
