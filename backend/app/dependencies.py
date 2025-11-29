"""
Shared dependencies for FastAPI endpoints
"""
import os
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    from jose import jwt, JWTError
    
    try:
        payload = jwt.decode(
            token, 
            os.getenv("JWT_SECRET", "replace-me"), 
            algorithms=[os.getenv("ALGORITHM", "HS256")]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=401, 
                detail="Invalid authentication credentials"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=401, 
            detail="Invalid authentication credentials"
        )
