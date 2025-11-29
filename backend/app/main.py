import os
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from .supabase_client import supabase
from .auth import get_password_hash, verify_password, create_access_token
from .lung_cancer import router as lung_cancer_router
from .breathing import router as breathing_router
from .diet import router as diet_router
from .daily_logs import router as daily_logs_router
from .dependencies import get_current_user, oauth2_scheme

load_dotenv()

app = FastAPI(title="OxyHeal Backend")

# Include routers
app.include_router(lung_cancer_router)
app.include_router(breathing_router)
app.include_router(diet_router)
app.include_router(daily_logs_router)

# Pydantic models for request bodies
class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LogCreate(BaseModel):
    type: Optional[str] = None
    metrics: Optional[dict] = None
    notes: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    height: Optional[int] = None
    profile_picture: Optional[str] = None

# CORS middleware - allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081", 
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "https://oxyheal-frontend-e4f0f7c1aba7.herokuapp.com",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    os.makedirs(os.getenv("UPLOAD_DIR", "./uploads"), exist_ok=True)


@app.get("/")
def root():
    return {"status": "ok", "message": "OxyHeal Backend API"}


@app.post("/auth/signup")
def signup(request: SignupRequest):
    """Sign up a new user - stores in Supabase users table"""
    try:
        # Check if user already exists
        result = supabase.table("users").select("*").eq("email", request.email).execute()
        if result.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_password = get_password_hash(request.password)
        user_data = {
            "email": request.email,
            "hashed_password": hashed_password,
            "name": request.name
        }
        
        result = supabase.table("users").insert(user_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        user = result.data[0]
        return {"id": user["id"], "email": user["email"]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with email and password"""
    try:
        # Find user by email
        result = supabase.table("users").select("*").eq("email", form_data.username).execute()
        
        if not result.data:
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        user = result.data[0]
        
        # Verify password
        if not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        
        # Create access token
        token = create_access_token({"sub": str(user["id"])})
        return {"access_token": token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.get("/users/me")
def read_users_me(user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    try:
        result = supabase.table("users").select("id, email, name, age, height, profile_picture, created_at").eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")


@app.put("/users/me")
def update_user_profile(update: UserUpdate, user_id: str = Depends(get_current_user)):
    """Update current user profile"""
    try:
        # Check if email is being changed and if it's already taken
        if update.email:
            existing = supabase.table("users").select("id").eq("email", update.email).neq("id", user_id).execute()
            if existing.data:
                raise HTTPException(status_code=400, detail="Email already in use by another account")
        
        # Build update dict with only provided fields
        update_data = {}
        if update.name is not None:
            update_data["name"] = update.name
        if update.email is not None:
            update_data["email"] = update.email
        if update.age is not None:
            update_data["age"] = update.age
        if update.height is not None:
            update_data["height"] = update.height
        if update.profile_picture is not None:
            update_data["profile_picture"] = update.profile_picture
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update user
        result = supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update user")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")


@app.post("/users/me/upload-picture")
async def upload_profile_picture(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """Upload profile picture"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        content = await file.read()
        
        # Limit file size to 5MB
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
        
        # Generate unique filename
        import uuid
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"profile_{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
        
        # Save to local uploads directory (can be changed to Supabase Storage later)
        upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Update user profile with picture URL
        picture_url = f"/uploads/{filename}"
        result = supabase.table("users").update({"profile_picture": picture_url}).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update profile picture")
        
        return {"profile_picture": picture_url}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload picture: {str(e)}")


@app.post("/logs")
def create_log(entry: LogCreate, user_id: str = Depends(get_current_user)):
    """Create a new log entry"""
    try:
        log_data = {
            "user_id": user_id,
            "type": entry.type,
            "metrics": entry.metrics,
            "notes": entry.notes
        }
        
        result = supabase.table("log_entries").insert(log_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create log")
        
        return {"id": result.data[0]["id"]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create log: {str(e)}")


@app.get("/logs")
def list_logs(user_id: str = Depends(get_current_user)):
    """Get all logs for current user"""
    try:
        result = supabase.table("log_entries").select("*").eq("user_id", user_id).order("timestamp", desc=True).execute()
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get logs: {str(e)}")


@app.post("/upload")
def upload_file(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """Upload a file to local storage (can be changed to Supabase Storage)"""
    try:
        upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
        file_location = os.path.join(upload_dir, f"{user_id}_{file.filename}")
        
        with open(file_location, "wb") as f:
            content = file.file.read()
            f.write(content)
        
        return {"filename": file.filename, "size": len(content)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
