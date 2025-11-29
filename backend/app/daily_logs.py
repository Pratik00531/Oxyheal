"""
Daily Logs Backend Module

Handles daily health metrics tracking:
- Mood tracking
- Breathing quality
- Cough frequency
- Water intake
- Physical activity
- Symptoms
- Medications
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta

from .supabase_client import supabase
from .dependencies import get_current_user

router = APIRouter(prefix="/daily-logs", tags=["daily-logs"])


# Pydantic Models
class DailyLogCreate(BaseModel):
    mood: str  # 'great', 'okay', 'not_good'
    breathing_quality: int  # 1-10
    cough_frequency: int  # 0-20+
    water_intake: int  # glasses
    steps: int  # daily steps
    energy_level: int  # 1-10
    sleep_quality: int  # 1-10
    symptoms: Optional[List[str]] = []  # ['cough', 'breathlessness', 'fatigue', etc.]
    medications_taken: Optional[List[str]] = []
    notes: Optional[str] = None


class DailyLogResponse(BaseModel):
    id: str
    user_id: str
    log_date: str
    mood: str
    breathing_quality: int
    cough_frequency: int
    water_intake: int
    steps: int
    energy_level: int
    sleep_quality: int
    symptoms: List[str]
    medications_taken: List[str]
    notes: Optional[str]
    created_at: str


class DailyLogStats(BaseModel):
    total_logs: int
    current_streak: int
    avg_breathing_quality: float
    avg_water_intake: float
    avg_steps: int
    most_common_mood: str
    recent_trends: dict


# API Endpoints
@router.post("/")
async def create_daily_log(
    log: DailyLogCreate,
    user_id: str = Depends(get_current_user)
):
    """Create or update today's daily log"""
    try:
        today = date.today().isoformat()
        
        # Check if log already exists for today
        existing = supabase.table("daily_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("log_date", today)\
            .execute()
        
        log_data = {
            "user_id": user_id,
            "log_date": today,
            "mood": log.mood,
            "breathing_quality": log.breathing_quality,
            "cough_frequency": log.cough_frequency,
            "water_intake": log.water_intake,
            "steps": log.steps,
            "energy_level": log.energy_level,
            "sleep_quality": log.sleep_quality,
            "symptoms": log.symptoms or [],
            "medications_taken": log.medications_taken or [],
            "notes": log.notes,
            "created_at": datetime.utcnow().isoformat()
        }
        
        if existing.data:
            # Update existing log
            result = supabase.table("daily_logs")\
                .update(log_data)\
                .eq("id", existing.data[0]["id"])\
                .execute()
        else:
            # Create new log
            result = supabase.table("daily_logs").insert(log_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save log")
        
        return {
            "success": True,
            "message": "Daily log saved successfully",
            "data": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save log: {str(e)}")


@router.get("/today")
async def get_today_log(user_id: str = Depends(get_current_user)):
    """Get today's log if it exists"""
    try:
        today = date.today().isoformat()
        
        result = supabase.table("daily_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("log_date", today)\
            .execute()
        
        if result.data:
            return result.data[0]
        else:
            return None
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get today's log: {str(e)}")


@router.get("/history")
async def get_log_history(
    limit: int = 30,
    user_id: str = Depends(get_current_user)
):
    """Get user's log history"""
    try:
        result = supabase.table("daily_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("log_date", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")


@router.get("/stats")
async def get_log_stats(user_id: str = Depends(get_current_user)):
    """Get user's logging statistics and trends"""
    try:
        # Get all logs
        result = supabase.table("daily_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("log_date", desc=True)\
            .execute()
        
        logs = result.data
        
        if not logs:
            return {
                "total_logs": 0,
                "current_streak": 0,
                "avg_breathing_quality": 0,
                "avg_water_intake": 0,
                "avg_steps": 0,
                "most_common_mood": "N/A",
                "recent_trends": {}
            }
        
        # Calculate statistics
        total_logs = len(logs)
        
        # Calculate current streak
        current_streak = 0
        today = date.today()
        check_date = today
        
        log_dates = {log["log_date"] for log in logs}
        
        while check_date.isoformat() in log_dates:
            current_streak += 1
            check_date = check_date - timedelta(days=1)
        
        # Calculate averages
        avg_breathing = sum(log["breathing_quality"] for log in logs) / total_logs
        avg_water = sum(log["water_intake"] for log in logs) / total_logs
        avg_steps = int(sum(log["steps"] for log in logs) / total_logs)
        
        # Most common mood
        mood_counts = {}
        for log in logs:
            mood = log["mood"]
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        most_common_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "N/A"
        
        # Recent trends (last 7 days)
        last_7_days = logs[:7] if len(logs) >= 7 else logs
        
        recent_trends = {
            "breathing_trend": "stable",
            "water_trend": "stable",
            "mood_trend": "stable",
            "avg_breathing_last_7": round(sum(log["breathing_quality"] for log in last_7_days) / len(last_7_days), 1) if last_7_days else 0,
            "avg_water_last_7": round(sum(log["water_intake"] for log in last_7_days) / len(last_7_days), 1) if last_7_days else 0,
        }
        
        # Determine trends
        if len(logs) >= 14:
            last_7_breathing = sum(log["breathing_quality"] for log in logs[:7]) / 7
            prev_7_breathing = sum(log["breathing_quality"] for log in logs[7:14]) / 7
            
            if last_7_breathing > prev_7_breathing + 1:
                recent_trends["breathing_trend"] = "improving"
            elif last_7_breathing < prev_7_breathing - 1:
                recent_trends["breathing_trend"] = "declining"
        
        return {
            "total_logs": total_logs,
            "current_streak": current_streak,
            "avg_breathing_quality": round(avg_breathing, 1),
            "avg_water_intake": round(avg_water, 1),
            "avg_steps": avg_steps,
            "most_common_mood": most_common_mood,
            "recent_trends": recent_trends
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@router.get("/chart-data")
async def get_chart_data(
    days: int = 7,
    user_id: str = Depends(get_current_user)
):
    """Get data for charts (last N days)"""
    try:
        result = supabase.table("daily_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("log_date", desc=True)\
            .limit(days)\
            .execute()
        
        logs = result.data
        
        # Format for charts
        chart_data = {
            "dates": [],
            "breathing_quality": [],
            "cough_frequency": [],
            "water_intake": [],
            "steps": [],
            "energy_level": [],
            "sleep_quality": []
        }
        
        # Reverse to show oldest first
        for log in reversed(logs):
            chart_data["dates"].append(log["log_date"])
            chart_data["breathing_quality"].append(log["breathing_quality"])
            chart_data["cough_frequency"].append(log["cough_frequency"])
            chart_data["water_intake"].append(log["water_intake"])
            chart_data["steps"].append(log["steps"])
            chart_data["energy_level"].append(log["energy_level"])
            chart_data["sleep_quality"].append(log["sleep_quality"])
        
        return chart_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chart data: {str(e)}")
