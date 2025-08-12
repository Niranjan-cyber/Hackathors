from fastapi import APIRouter, Form, File, UploadFile
from fastapi.responses import JSONResponse
from app.schemas.email import EmailResponse, EmailErrorResponse
from app.services.send_email.email_service import email_service

router = APIRouter()

@router.post("/send-email", response_model=EmailResponse, responses={500: {"model": EmailErrorResponse}})
async def send_email(
    to: str = Form(..., description="Recipient email address"),
    subject: str = Form(..., description="Email subject"),
    body: str = Form(..., description="Email body content"),
    file: UploadFile = File(None, description="Optional file attachment")
):
    """
    Send an email with optional file attachment.
    
    This endpoint allows sending emails with:
    - Required: recipient email, subject, and body
    - Optional: file attachment
    """
    try:
        # Use the email service to send the email
        result = await email_service.send_email(to, subject, body, file)
        return result
        
    except Exception as e:
        return JSONResponse(
            content=EmailErrorResponse(status="error", message=str(e)).dict(), 
            status_code=500
        )
