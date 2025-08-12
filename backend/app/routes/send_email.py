import smtplib
import os
from fastapi import APIRouter, Form, File, UploadFile
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

load_dotenv()

router = APIRouter()

# Get email credentials from environment variables
EMAIL_USER = os.getenv("EMAIL_USER", "your-email@gmail.com")
EMAIL_PASS = os.getenv("EMAIL_PASS", "your-app-password")

@router.post("/send-email")
async def send_email(
    to: str = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    file: UploadFile = File(None)
):
    try:
        # Check if email credentials are properly configured
        if EMAIL_USER == "your-email@gmail.com" or EMAIL_PASS == "your-app-password":
            return JSONResponse(
                content={"status": "error", "message": "Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables."}, 
                status_code=500
            )
        
        # Email setup
        msg = MIMEMultipart()
        msg["From"] = EMAIL_USER
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Attach file if present
        if file:
            file_content = await file.read()
            part = MIMEBase("application", "octet-stream")
            part.set_payload(file_content)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={file.filename}")
            msg.attach(part)

        # Send email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to, msg.as_string())

        return JSONResponse(content={"status": "success", "message": "Email sent successfully"})

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
