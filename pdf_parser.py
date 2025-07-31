import pdfplumber

def extract_text_from_pdf(pdf_path):
    all_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                all_text += text + "\n"
    return all_text

def clean_text(text):
    lines = text.splitlines()
    cleaned = [line.strip() for line in lines if len(line.strip()) > 10]
    return " ".join(cleaned)

