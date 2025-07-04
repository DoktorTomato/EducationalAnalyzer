from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import documentai_v1 as documentai
from fastapi import HTTPException
from google.cloud.exceptions import GoogleCloudError
from .auth import router as auth_router

project_id = "your-project-id"  # Replace with your Google Cloud project ID
location = "us"  # Format is 'us' or 'eu'
processor_id = "your-processor-id"  # Replace with your Document AI processor ID

app = FastAPI()

origin = "http://localhost:8000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
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

        sentences = full_text.split(".")
        abstract = ". ".join(sentences[:3]) + "."

        return {
            "abstract": full_text,
            "length": len(full_text),
            "filename": file.filename
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
