from fastapi import FastAPI, UploadFile, File, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import documentai_v1 as documentai
from fastapi import HTTPException
from google.cloud.exceptions import GoogleCloudError
from .auth import verify_token
from .auth import router as auth_router
from google import genai
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from firebase_admin import firestore

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(os.path.dirname(__file__), "service_config.json")

load_dotenv()

project_id = os.getenv("PROJECT_ID")
location = os.getenv("LOCATION")
processor_id = os.getenv("PROCESSOR_ID")
api_key = os.getenv("GENAI_API_KEY")

db = firestore.client()

app = FastAPI()
client_ai = genai.Client(api_key=api_key)

origin = "http://localhost:8000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://educationalanalyzer-d9304.web.app",
        "https://educationalanalyzer-d9304.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)

def save_to_firestore(user_id, filename, summary, answers, quiz=None):
    doc_ref = db.collection("materials").document()
    doc_ref.set({
        "user_id": user_id,
        "filename": filename,
        "summary": summary,
        "quiz": quiz,
        "answers": answers,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@app.get("/")
def root():
    return {"message": "Educational Analyzer is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user_id: str = Depends(verify_token)):
    try:
        contents = await file.read()

        opts = {
            "api_endpoint": f"{location}-documentai.googleapis.com",
        }

        client = documentai.DocumentProcessorServiceClient(client_options=opts)
        name = client.processor_path(project_id, location, processor_id)

        raw_document = documentai.RawDocument(content=contents, mime_type=file.content_type)
        request = documentai.ProcessRequest(name=name, raw_document=raw_document)
        result = client.process_document(request=request)

        document = result.document
        full_text = document.text

        summary = client_ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Please create a summary of the following text: {full_text}"
        )

        quiz = client_ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Please create 10 quiz question about the following text: {full_text}. Do not give any answears!"
        )

        answers = client_ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Please write answers for this quiz: {quiz.text} only using this text: {full_text}. Do not include original questions, only answers."
        )

        save_to_firestore(user_id, file.filename, summary=summary.text, answers=answers.text, quiz=quiz.text)
        return {
            "summary": summary.text,
            "quiz": quiz.text,
            "answers": answers.text,
            "length": len(full_text),
            "filename": file.filename
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.get("/history")
async def get_history(request: Request, user=Depends(verify_token)):
    try:
        user_id = user
        materials_ref = db.collection("materials").where("user_id", "==", user_id)
        docs = materials_ref.stream()

        history = []
        for doc in docs:
            data = doc.to_dict()
            history.append({
                "filename": data.get("filename"),
                "summary": data.get("summary"),
                "quiz": data.get("quiz"),
                "answers": data.get("answers"),
                "timestamp": data.get("timestamp")
            })

        history.sort(key=lambda x: x["timestamp"] or "", reverse=True)

        return {"history": history}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch history.")