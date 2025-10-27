from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.pdf_utils import extract_text_per_page
from utils.embedding_utils import create_vector_store
from utils.query_utils import query_vector_db, summarize_with_llm
import os

app = Flask(__name__)
CORS(app)  # allow frontend to connect

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['pdf']
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    pages = extract_text_per_page(path)
    create_vector_store(pages)

    return jsonify({"message": f"Document '{file.filename}' uploaded successfully."})


@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    query = data.get('query', '')

    if not query:
        return jsonify({"error": "No query provided"}), 400

    passages = query_vector_db(query)  # uses the default stored vector data
    answer = summarize_with_llm(query, passages)

    # Add reference pages
    pages = sorted({p.get("page") for p in passages if p.get("page") is not None})
    if pages:
        answer = f"{answer.strip()} (refer page {', '.join(map(str, pages))})"

    return jsonify({"answer": answer})



if __name__ == '__main__':
    app.run(port=5000, debug=True)
