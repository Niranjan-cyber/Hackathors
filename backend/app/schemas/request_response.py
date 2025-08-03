from pydantic import BaseModel
from typing import List

class TopicsResponse(BaseModel):
    topics: List[str]
class QuestionRequest(BaseModel):
    """
    Pydantic model to validate the incoming request body for question generation.
    """
    topics: List[str] = Field(
        ..., 
        example=["Bias Variance trade-off"], 
        description="A list of topics the questions should cover."
    )
    difficulty: str = Field(
        ..., 
        example="medium", 
        description="The desired difficulty level for the questions (e.g., easy, medium, hard)."
    )
    num_questions: int = Field(
        ..., 
        gt=0, 
        example=5, 
        description="The number of questions to generate."
    )
