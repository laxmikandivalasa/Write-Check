import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import pytesseract
from docx import Document
from PIL import Image
import io
import difflib

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in range(len(reader.pages)):
            text += reader.pages[page].extract_text()
    return text

# Function to extract text from DOCX
def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    text = ''
    for para in doc.paragraphs:
        text += para.text + '\n'
    return text

# Function to extract text from images (handwritten)
def extract_text_from_image(image_path):
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    return text

# Function to compare two texts
def compare_texts(text1, text2):
    sequence = difflib.SequenceMatcher(None, text1, text2)
    return sequence.ratio()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files' not in request.files:
        return {'error': 'No file part'}, 400

    files = request.files.getlist('files')
    filenames = []

    for file in files:
        filename = file.filename
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        filenames.append(filename)

        # Extract text from the uploaded file and compare it to others
        if filename.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(file_path)
        elif filename.endswith('.docx'):
            extracted_text = extract_text_from_docx(file_path)
        elif filename.lower().endswith(('png', 'jpg', 'jpeg')):
            extracted_text = extract_text_from_image(file_path)
        else:
            extracted_text = ""

        # Store extracted text for further comparison or flagging (you can add logic to compare this text with other uploaded texts)
        file.text = extracted_text

    return {'message': 'Files received successfully', 'files': filenames}, 200

@app.route('/check_duplicates', methods=['GET'])
def check_duplicates():
    files = os.listdir(UPLOAD_FOLDER)
    file_texts = {}

    # Extract texts from each file
    for filename in files:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if filename.endswith('.pdf'):
            file_texts[filename] = extract_text_from_pdf(file_path)
        elif filename.endswith('.docx'):
            file_texts[filename] = extract_text_from_docx(file_path)
        elif filename.lower().endswith(('png', 'jpg', 'jpeg')):
            file_texts[filename] = extract_text_from_image(file_path)

    # Compare all files with each other
    duplicates = []
    for file1, text1 in file_texts.items():
        for file2, text2 in file_texts.items():
            if file1 != file2:
                similarity = compare_texts(text1, text2)
                if similarity > 0.8:  # If similarity is greater than 80%
                    duplicates.append((file1, file2, similarity))

    return jsonify({'duplicates': duplicates}), 200

@app.route('/files', methods=['GET'])
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify({'files': files})

if __name__ == '__main__':
    app.run(debug=True)
