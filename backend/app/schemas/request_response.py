from pydantic import BaseModel
from typing import List

class TopicsResponse(BaseModel):
    topics: List[str]
