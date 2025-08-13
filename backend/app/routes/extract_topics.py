from app.services.topic_extracting.topic_extractor import (
    extract_text_from_pdf,
    extract_topics_from_pdf_text,
)
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import os
import shutil

GENERATE_DB_PATH = "app/services/rag/generate_faiss_db.py"


router = APIRouter()


@router.post("/extract-topics/", response_class=JSONResponse)
async def extract_topics(file: UploadFile = File(...)):
    temp_file_path = f"temp_{file.filename}"
    # Save uploaded file to temp path
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Step 1: Extract text from the PDF
        extracted_text = extract_text_from_pdf(temp_file_path)

        # After extracting text from the PDF (assume variable is 'extracted_text')
        with open("app/services/mcq_generation/OCR_text.txt", "w", encoding="utf-8") as f:
            f.write(extracted_text)

        # Starting the FAISS database generation pipeline
        os.system(f"python3 {GENERATE_DB_PATH}")

        # Step 2: Extract topics
        topics_result = extract_topics_from_pdf_text(extracted_text)

        return topics_result
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
