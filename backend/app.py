from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
from utils.pdf_utils import extract_text_per_page
from utils.embedding_utils import create_vector_store
from utils.query_utils import query_vector_db, summarize_with_llm
import os
from firebase_auth import verify_token

app = Flask(__name__)
CORS(app)  # allow frontend to connect

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/upload', methods=['POST'])
@verify_token
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['pdf']
    uid = request.user['uid']
    user_folder = os.path.join(UPLOAD_FOLDER, uid)
    os.makedirs(user_folder, exist_ok=True)
    
    path = os.path.join(user_folder, file.filename)
    file.save(path)

    pages = extract_text_per_page(path)
    # Note: Global vector store might mix users, but instructions say "Do NOT change the RAG pipeline"
    create_vector_store(pages)

    return jsonify({"message": f"Document '{file.filename}' uploaded successfully."})

@app.route('/pdf/<uid>/<filename>', methods=['GET'])
def get_pdf(uid, filename):
    user_folder = os.path.join(UPLOAD_FOLDER, uid)
    return send_from_directory(user_folder, filename)


@app.route('/ask', methods=['POST'])
@verify_token
def ask_question():
    try:
        data = request.get_json()
        query = data.get('query', '')

        if not query:
            return jsonify({"error": "No query provided"}), 400

        passages = query_vector_db(query)  # uses the default stored vector data
        
        quiz_triggers = ["generate quiz", "make a quiz", "test me", "generate question"]
        is_quiz = any(trigger in query.lower() for trigger in quiz_triggers)
        
        def generate():
            for chunk in summarize_with_llm(query, passages, is_quiz=is_quiz):
                yield chunk

            # Add reference pages only if not quiz
            if not is_quiz:
                pages = sorted({p.get("page") for p in passages if p.get("page") is not None})
                if pages:
                    yield f"\n\n__CITATIONS__:[{', '.join(map(str, pages))}]"

        return Response(generate(), mimetype='text/event-stream')
    except Exception as e:
        print(f"Error processing /ask: {e}")
        return jsonify({"answer": "Sorry, something went wrong while processing your request. Please try again."})



if __name__ == '__main__':
    app.run(port=5000, debug=True)
