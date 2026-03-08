# StudyBuddy

StudyBuddy is an intelligent, RAG-powered (Retrieval-Augmented Generation) chat application that allows users to upload PDF documents and ask questions about their content. Built with a React frontend and a Flask backend, StudyBuddy extracts text from your documents, creates vector embeddings for semantic search, and uses a Large Language Model to generate accurate answers with direct page citations.

## Features

- **PDF Uploads**: Seamlessly upload PDF documents to the system.
- **RAG Pipeline**: Ask questions and get conversational answers based strictly on the uploaded document's content.
- **Clickable Citations**: AI responses include exact page numbers that, when clicked, open the PDF directly to the referenced page.
- **Streaming Responses**: Real-time answer generation for a smooth, ChatGPT-like experience.
- **Chat History**: A collapsible sidebar retains your previous chat sessions.
- **Change Document**: Easily swap out documents and start a fresh session context.
- **Firebase Authentication**: Secure login via Email/Password or Google Sign-In.
- **User-Isolated Storage**: Every user gets their own dedicated upload directory, ensuring complete privacy of documents between accounts.

## Tech Stack

### Frontend
- **React + Vite** (TypeScript)
- **Tailwind CSS** (Styling)
- **shadcn/ui** (Accessible UI components)
- **Firebase Auth** (User authentication)
- **TanStack React Query** (State and data fetching management)
- **React Router** (Navigation)

### Backend
- **Flask** (Python Web Framework)
- **Flask-CORS** (Handling Cross-Origin Resource Sharing)
- **PyMuPDF / fitz** (PDF text extraction)
- **Sentence Transformers** (Generating vector embeddings)
- **ChromaDB** (Vector database for similarity search)
- **Groq API** (Llama-3.1-8b-instant for fast LLM inference)
- **Firebase Admin SDK** (Token verification and secure routing)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.10+)
- Firebase Project (for Authentication)
- Groq API Key (for LLM generation)

### 1. Clone the repository

```bash
git clone https://github.com/M-V-RAGHUPATHI-SAI/StuddyBuddy.git
cd StuddyBuddy
```

### 2. Backend Setup

Configure the Python backend and install its dependencies.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/your/firebase-serviceAccountKey.json
```

*Note: You must generate a Firebase Service Account JSON key from your Firebase Console (Project Settings > Service Accounts) and place it in your local backend structure.*

**Run the Backend Server:**
```bash
python app.py
# The server will start on http://127.0.0.1:5000
```

### 3. Frontend Setup

Install the React dependencies and link Firebase.

```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend/` directory, using the credentials from your Firebase Console (Project Settings > General):

```env
VITE_API_URL=http://127.0.0.1:5000

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Run the Frontend Development Server:**
```bash
npm run dev
# The application will be accessible at http://localhost:8080 or port specified by Vite
```

## How It Works

1. **Upload Phase**: Authenticated users upload a PDF. Flow routes to `/upload`, the PDF gets saved into an isolated `uploads/<uid>/` folder. Using PyMuPDF, the text is extracted page by page, embedded using Sentence Transformers, and stored internally using ChromaDB.
2. **Conversation Phase**: The user submits a query to `/ask`. ChromaDB retrieves the most semantically relevant text chunks. The context is built and fed to the Groq LLM via streaming.
3. **Citations & Interface**: When Groq returns a cited answer, the frontend parses the `__CITATIONS__` block and maps them to clickable components. Clicking a chip natively accesses the backend's `/pdf/<uid>/<filename>` route.

## License

MIT
