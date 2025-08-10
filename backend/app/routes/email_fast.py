import smtplib
from fastapi import FastAPI, Form, File, UploadFile
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

load_dotenv()

app = FastAPI()

EMAIL_USER = "email@gamil.com"
EMAIL_PASS = "pass"

@app.post("/send-email")
async def send_email(
    to: str = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    file: UploadFile = File(None)
):
    try:
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
