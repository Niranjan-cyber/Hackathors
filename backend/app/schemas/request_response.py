# schemas/request_response.py

from pydantic import BaseModel

class PredictionRequest(BaseModel):
    text: str
