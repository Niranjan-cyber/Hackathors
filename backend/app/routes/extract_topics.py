from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import os
import shutil

from app.models.topic_extracting.topic_extractor import (
    extract_text_from_pdf,
    extract_topics_from_pdf_text,
)

router = APIRouter()

@router.post("/extract-topics/", response_class=JSONResponse)
async def extract_topics(file: UploadFile = File(...)):
    print("hello")
    temp_file_path = f"temp_{file.filename}"
    # Save uploaded file to temp path
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        print("HI")
        # Step 1: Extract text from the PDF
        extracted_text = extract_text_from_pdf(temp_file_path)
        
        # Step 2: Extract topics
        topics = extract_topics_from_pdf_text(extracted_text)

        return topics
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
