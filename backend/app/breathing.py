# Backend implementation for breathing exercises

"""
Breathing Exercises Backend Module

This module handles:
1. Breathing exercise definitions and metadata
2. Exercise session tracking
3. Progress and completion tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from .supabase_client import supabase
from .dependencies import get_current_user

router = APIRouter(prefix="/breathing", tags=["breathing"])


# Pydantic Models
class BreathingPattern(BaseModel):
    inhale: int  # seconds
    hold_in: Optional[int] = 0  # seconds
    exhale: int  # seconds
    hold_out: Optional[int] = 0  # seconds


class BreathingExercise(BaseModel):
    id: str
    name: str
    description: str
    duration: int  # seconds (total duration)
    difficulty: str  # beginner, intermediate, advanced
    pattern: BreathingPattern
    benefits: List[str]
    instructions: List[str]
    cycles: int  # number of breathing cycles


class ExerciseSessionCreate(BaseModel):
    exercise_id: str
    duration: int  # actual duration in seconds
    cycles_completed: int
    completion_status: str  # 'completed', 'incomplete', 'abandoned'
    notes: Optional[str] = None


class ExerciseSessionResponse(BaseModel):
    id: str
    user_id: str
    exercise_id: str
    duration: int
    cycles_completed: int
    completion_status: str
    notes: Optional[str]
    created_at: str


# Predefined breathing exercises
BREATHING_EXERCISES = {
    "478-breathing": {
        "id": "478-breathing",
        "name": "4-7-8 Breathing",
        "description": "A powerful technique to calm your mind and improve oxygen flow. Perfect for beginners and experienced practitioners alike.",
        "duration": 300,  # 5 minutes in seconds
        "difficulty": "beginner",
        "pattern": {
            "inhale": 4,
            "hold_in": 7,
            "exhale": 8,
            "hold_out": 0
        },
        "benefits": [
            "Reduces anxiety and stress",
            "Improves sleep quality",
            "Lowers heart rate",
            "Promotes relaxation"
        ],
        "instructions": [
            "Sit in a comfortable position with your back straight",
            "Place the tip of your tongue behind your upper front teeth",
            "Breathe in quietly through your nose for 4 seconds",
            "Hold your breath for 7 seconds",
            "Exhale completely through your mouth for 8 seconds",
            "Repeat for the recommended number of cycles"
        ],
        "cycles": 8
    },
    "deep-breathing": {
        "id": "deep-breathing",
        "name": "Deep Breathing",
        "description": "Inhale deeply through nose, exhale slowly through mouth",
        "duration": 300,  # 5 minutes in seconds
        "difficulty": "beginner",
        "pattern": {
            "inhale": 4,
            "hold_in": 0,
            "exhale": 6,
            "hold_out": 0
        },
        "benefits": [
            "Reduces stress and tension",
            "Improves oxygen intake",
            "Calms nervous system",
            "Enhances focus"
        ],
        "instructions": [
            "Find a quiet, comfortable place to sit or lie down",
            "Place one hand on your chest and the other on your belly",
            "Breathe in slowly through your nose for 4 seconds",
            "Feel your belly rise more than your chest",
            "Exhale slowly through your mouth for 6 seconds",
            "Repeat for 10 cycles"
        ],
        "cycles": 10
    },
    "box-breathing": {
        "id": "box-breathing",
        "name": "Box Breathing",
        "description": "Inhale 4s, hold 4s, exhale 4s, hold 4s - repeat",
        "duration": 600,  # 10 minutes in seconds
        "difficulty": "intermediate",
        "pattern": {
            "inhale": 4,
            "hold_in": 4,
            "exhale": 4,
            "hold_out": 4
        },
        "benefits": [
            "Calms nervous system",
            "Increases focus and concentration",
            "Reduces stress and anxiety",
            "Improves emotional regulation"
        ],
        "instructions": [
            "Sit comfortably with your feet flat on the floor",
            "Breathe in through your nose for 4 seconds",
            "Hold your breath for 4 seconds",
            "Exhale slowly through your mouth for 4 seconds",
            "Hold your breath again for 4 seconds",
            "Repeat the cycle - this creates a 'box' pattern"
        ],
        "cycles": 8
    },
    "alternate-nostril": {
        "id": "alternate-nostril",
        "name": "Alternate Nostril Breathing",
        "description": "Breathe through one nostril at a time - balancing technique",
        "duration": 600,  # 10 minutes in seconds
        "difficulty": "intermediate",
        "pattern": {
            "inhale": 5,
            "hold_in": 5,
            "exhale": 5,
            "hold_out": 0
        },
        "benefits": [
            "Balances left and right brain hemispheres",
            "Reduces anxiety and stress",
            "Improves respiratory function",
            "Enhances mental clarity"
        ],
        "instructions": [
            "Sit comfortably with your spine straight",
            "Use your right thumb to close your right nostril",
            "Inhale slowly through your left nostril for 5 seconds",
            "Hold your breath for 5 seconds",
            "Close your left nostril with your ring finger",
            "Release your right nostril and exhale for 5 seconds",
            "Inhale through the right nostril and repeat, alternating sides"
        ],
        "cycles": 10
    },
    "breath-of-fire": {
        "id": "breath-of-fire",
        "name": "Breath of Fire",
        "description": "Rapid rhythmic breathing - energizing and detoxifying",
        "duration": 300,  # 5 minutes in seconds
        "difficulty": "advanced",
        "pattern": {
            "inhale": 1,
            "hold_in": 0,
            "exhale": 1,
            "hold_out": 0
        },
        "benefits": [
            "Increases energy and vitality",
            "Detoxifies lungs and bloodstream",
            "Strengthens core muscles",
            "Stimulates nervous system"
        ],
        "instructions": [
            "Sit in a comfortable cross-legged position",
            "Keep your spine straight and shoulders relaxed",
            "Breathe rapidly through your nose with equal emphasis on inhale and exhale",
            "Use your diaphragm powerfully - feel your belly pump",
            "Start slowly and build up speed as you get comfortable",
            "Take a break if you feel dizzy or lightheaded"
        ],
        "cycles": 30
    }
}


@router.get("/exercises")
async def get_exercises():
    """Get all available breathing exercises"""
    return list(BREATHING_EXERCISES.values())


@router.get("/exercises/{exercise_id}")
async def get_exercise(exercise_id: str):
    """Get a specific breathing exercise"""
    if exercise_id not in BREATHING_EXERCISES:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    return BREATHING_EXERCISES[exercise_id]


@router.post("/sessions")
async def create_session(
    session: ExerciseSessionCreate,
    user_id: str = Depends(get_current_user)
):
    """Create a new breathing exercise session"""
    try:
        # Verify exercise exists
        if session.exercise_id not in BREATHING_EXERCISES:
            raise HTTPException(status_code=400, detail="Invalid exercise ID")
        
        session_data = {
            "user_id": user_id,
            "exercise_id": session.exercise_id,
            "duration": session.duration,
            "cycles_completed": session.cycles_completed,
            "completion_status": session.completion_status,
            "notes": session.notes,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("breathing_sessions").insert(session_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/sessions")
async def get_sessions(
    limit: int = 10,
    user_id: str = Depends(get_current_user)
):
    """Get user's breathing exercise sessions"""
    try:
        result = supabase.table("breathing_sessions")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")


@router.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user)):
    """Get user's breathing exercise statistics"""
    try:
        result = supabase.table("breathing_sessions")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        sessions = result.data or []
        
        total_sessions = len(sessions)
        total_duration = sum(s.get("duration", 0) for s in sessions)
        total_cycles = sum(s.get("cycles_completed", 0) for s in sessions)
        completed_sessions = len([s for s in sessions if s.get("completed", False)])
        
        # Exercise frequency
        exercise_counts = {}
        for session in sessions:
            ex_id = session.get("exercise_id")
            if ex_id:
                exercise_counts[ex_id] = exercise_counts.get(ex_id, 0) + 1
        
        favorite_exercise = max(exercise_counts.items(), key=lambda x: x[1])[0] if exercise_counts else None
        
        return {
            "total_sessions": total_sessions,
            "total_duration_seconds": total_duration,
            "total_cycles": total_cycles,
            "completed_sessions": completed_sessions,
            "completion_rate": (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
            "favorite_exercise": favorite_exercise,
            "exercise_counts": exercise_counts
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
