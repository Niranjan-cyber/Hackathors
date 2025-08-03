from fastapi import APIRouter, UploadFile, File
from app.models.topic_extracting import extract_text_from_pdf, extract_topics_from_pdf_text
from app.schemas.request_response import TopicsResponse
import aiofiles
import tempfile
import os

router = APIRouter()

@router.post("/extract_topics", response_model=TopicsResponse)
async def extract_topics(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[-1]
    fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    async with aiofiles.open(temp_file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    # Your model functions
    text = extract_text_from_pdf(temp_file_path)
    topics = extract_topics_from_pdf_text(text)

    os.remove(temp_file_path)

    return {"topics": topics}
