from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class EmailRequest(BaseModel):
    to: EmailStr = Field(..., description="Recipient email address")
    subject: str = Field(..., min_length=1, max_length=200, description="Email subject")
    body: str = Field(..., min_length=1, description="Email body content")

class EmailResponse(BaseModel):
    status: str = Field(..., description="Response status: 'success' or 'error'")
    message: str = Field(..., description="Response message")

class EmailErrorResponse(BaseModel):
    status: str = Field(default="error", description="Error status")
    message: str = Field(..., description="Error message")