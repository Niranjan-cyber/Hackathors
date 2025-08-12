import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from fastapi import UploadFile
from dotenv import load_dotenv
from app.schemas.email import EmailResponse, EmailErrorResponse

load_dotenv()

class EmailService:
    def __init__(self):
        self.email_user = os.getenv("EMAIL_USER", "your-email@gmail.com")
        self.email_pass = os.getenv("EMAIL_PASS", "your-app-password")
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587

    def _validate_credentials(self) -> bool:
        """Validate that email credentials are properly configured."""
        return not (
            self.email_user == "your-email@gmail.com" or 
            self.email_pass == "your-app-password"
        )

    async def _create_email_message(self, to: str, subject: str, body: str, file: UploadFile = None) -> MIMEMultipart:
        """Create and configure the email message."""
        msg = MIMEMultipart()
        msg["From"] = self.email_user
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Attach file if present
        if file:
            # Read file content asynchronously
            file_content = await file.read()
            part = MIMEBase("application", "octet-stream")
            part.set_payload(file_content)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={file.filename}")
            msg.attach(part)

        return msg

    def _send_email(self, msg: MIMEMultipart, to: str) -> None:
        """Send the email using SMTP."""
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.email_user, self.email_pass)
            server.sendmail(self.email_user, to, msg.as_string())

    async def send_email(
        self, 
        to: str, 
        subject: str, 
        body: str, 
        file: UploadFile = None
    ) -> EmailResponse:
        """
        Send an email with optional file attachment.
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body content
            file: Optional file attachment
            
        Returns:
            EmailResponse: Success response
            
        Raises:
            Exception: If email sending fails
        """
        # Validate credentials
        if not self._validate_credentials():
            raise Exception("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.")

        # Create email message
        msg = await self._create_email_message(to, subject, body, file)
        
        # Send email
        self._send_email(msg, to)
        
        return EmailResponse(status="success", message="Email sent successfully")

# Create a singleton instance
email_service = EmailService()
