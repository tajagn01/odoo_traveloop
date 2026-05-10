import PyPDF2
import sys

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for i in range(len(reader.pages)):
            page = reader.pages[i]
            text += f"--- Page {i+1} ---\n"
            text += page.extract_text() + "\n"
        print(text)

if __name__ == '__main__':
    extract_text_from_pdf(sys.argv[1])
