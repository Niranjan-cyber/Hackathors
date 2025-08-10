from flask import Flask, request, jsonify
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

app = Flask(__name__)


def send_email(to_email, report_data):
    from_email = "your-email@example.com"
    from_password = "your-email-password" # Use environment variables!

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = "Your Report"
    
    # Body of the email
    body = "Here is the report you requested."
    msg.attach(MIMEText(body, 'plain'))
    
    # Example of generating a simple report (e.g., a text file)
    report_content = "This is the content of your report."
    part = MIMEApplication(report_content, Name="report.txt")
    part['Content-Disposition'] = 'attachment; filename="report.txt"'
    msg.attach(part)
    
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(from_email, from_password)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@app.route('/api/send-report', methods=['POST'])
def handle_send_report():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({'success': False, 'error': 'Email is required'}), 400

    # You would generate the actual report here
    report_data = "Some report data"

    if send_email(email, report_data):
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'error': 'Failed to send email'}), 500

if __name__ == '__main__':
    app.run(debug=True)