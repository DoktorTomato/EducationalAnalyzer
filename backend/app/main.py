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
from datetime import datetime
import firebase_admin
from firebase_admin import firestore

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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


def save_to_firestore(user_id, filename, summary, quiz=None):
    doc_ref = db.collection("materials").document()
    doc_ref.set({
        "user_id": user_id,
        "filename": filename,
        "summary": summary,
        "quiz": quiz,
        "timestamp": datetime.utcnow().isoformat()
    })

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

        response = client_ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Please create a summary of the following text: {full_text}"
        )

        quiz = client_ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Please create 10 quiz question about the following text: {full_text}. Write short correct answear for each at the end."
        )

        save_to_firestore(user_id, file.filename, summary=response.text, quiz=quiz.text)
        return {
            "abstract": response.text,
            "quiz": quiz.text,
            "length": len(full_text),
            "filename": file.filename
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
