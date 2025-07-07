import firebase_admin
from firebase_admin import auth, credentials
import requests
from fastapi import APIRouter, HTTPException, Request, Depends
import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), "firebase_config.json"))
firebase_admin.initialize_app(cred)

router = APIRouter()

firebase_key = os.getenv("FIREBASE_API_KEY")

class AuthData(BaseModel):
    email: str
    password: str

def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = auth_header.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/auth/signup")
def signup(data: AuthData):
    try:
        user = auth.create_user(
            email=data.email,
            password=data.password
        )
        return {"message": "User created", "uid": user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/login")
def login(data: AuthData):
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={firebase_key}"
        payload = {
            "email": data.email,
            "password": data.password,
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token_data = response.json()
        return {
            "idToken": token_data["idToken"],
            "refreshToken": token_data["refreshToken"],
            "expiresIn": token_data["expiresIn"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/google")
def google_login(id_token: str):
    try:
        decoded = auth.verify_id_token(id_token)
        return {"message": "Login successful", "uid": decoded["uid"]}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Google token")

def verify_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = auth_header.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

