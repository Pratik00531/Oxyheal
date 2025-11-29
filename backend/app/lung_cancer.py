# Backend implementation for lung cancer screening system

"""
Lung Cancer Screening Backend Module

This module handles:
1. Assessment creation and management
2. Report uploads (LDCT, Pathology, Biomarker, Staging)
3. Risk calculation
4. Eligibility determination based on USPSTF guidelines
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
import os

from .supabase_client import supabase
from .dependencies import get_current_user

router = APIRouter(prefix="/lung-cancer", tags=["lung-cancer"])


# Pydantic Models
class Demographics(BaseModel):
    age: int
    sex: str


class SmokingHistory(BaseModel):
    packsPerDay: float
    yearsSmoked: int
    packYears: float
    smokingStatus: str
    yearsQuit: Optional[int] = None


class MedicalHistory(BaseModel):
    hasLungDisease: bool
    lungDiseaseTypes: Optional[List[str]] = []
    hasChestRadiation: bool
    hasFamilyHistory: bool
    familyHistoryDetails: Optional[str] = None


class EnvironmentalExposures(BaseModel):
    radonExposure: bool
    asbestosExposure: bool
    airPollutionExposure: bool
    secondhandSmokeExposure: bool
    exposureDetails: Optional[str] = None


class Symptoms(BaseModel):
    persistentCough: bool
    shortnessOfBreath: bool
    chestPain: bool
    unexplainedWeightLoss: bool
    hemoptysis: bool
    otherSymptoms: Optional[str] = None


class ScreeningEligibility(BaseModel):
    isEligible: bool
    reason: str
    criteria: Dict[str, bool]
    recommendation: str


class LungCancerAssessmentCreate(BaseModel):
    demographics: Demographics
    smokingHistory: SmokingHistory
    medicalHistory: MedicalHistory
    environmentalExposures: EnvironmentalExposures
    symptoms: Symptoms
    eligibility: ScreeningEligibility
    status: str = "screening-eligible"
    notes: Optional[str] = None


class LDCTReportCreate(BaseModel):
    scanDate: str
    clinicalHistory: str
    technique: str
    findings: str
    impression: str
    lungRADS: int
    recommendation: str
    radiologistName: Optional[str] = None


class PathologyReportCreate(BaseModel):
    biopsyDate: str
    biopsySite: str
    cancerType: Optional[str] = None
    histology: Optional[str] = None
    findings: str
    diagnosis: str
    pathologistName: Optional[str] = None


class BiomarkerReportCreate(BaseModel):
    testDate: str
    egfr: bool
    alk: bool
    kras: bool
    ros1: bool
    braf: bool
    pdl1Expression: Optional[float] = None
    findings: str
    recommendation: str


class StagingReportCreate(BaseModel):
    scanDate: str
    scanType: str
    tumorSize: Optional[str] = None
    lymphNodeInvolvement: bool
    metastasis: bool
    metastasisSites: Optional[List[str]] = []
    stage: Optional[str] = None
    findings: str


# Endpoints
@router.post("/assessments")
async def create_assessment(
    assessment: LungCancerAssessmentCreate,
    user_id: str = Depends(get_current_user)
):
    """Create a new lung cancer screening assessment"""
    try:
        assessment_data = {
            "user_id": user_id,
            "demographics": assessment.demographics.dict(),
            "smoking_history": assessment.smokingHistory.dict(),
            "medical_history": assessment.medicalHistory.dict(),
            "environmental_exposures": assessment.environmentalExposures.dict(),
            "symptoms": assessment.symptoms.dict(),
            "eligibility": assessment.eligibility.dict(),
            "status": assessment.status,
            "notes": assessment.notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        result = supabase.table("lung_cancer_assessments").insert(assessment_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create assessment")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create assessment: {str(e)}")


@router.get("/assessments")
async def get_assessments(user_id: str = Depends(get_current_user)):
    """Get all assessments for the current user"""
    try:
        result = supabase.table("lung_cancer_assessments")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assessments: {str(e)}")


@router.get("/assessments/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get a specific assessment"""
    try:
        result = supabase.table("lung_cancer_assessments")\
            .select("*")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        assessment = result.data[0]
        
        # Get all reports
        ldct_result = supabase.table("ldct_reports")\
            .select("*")\
            .eq("assessment_id", assessment_id)\
            .order("scan_date", desc=True)\
            .execute()
        
        pathology_result = supabase.table("pathology_reports")\
            .select("*")\
            .eq("assessment_id", assessment_id)\
            .order("biopsy_date", desc=True)\
            .execute()
        
        biomarker_result = supabase.table("biomarker_reports")\
            .select("*")\
            .eq("assessment_id", assessment_id)\
            .order("test_date", desc=True)\
            .execute()
        
        staging_result = supabase.table("staging_reports")\
            .select("*")\
            .eq("assessment_id", assessment_id)\
            .order("scan_date", desc=True)\
            .execute()
        
        # Attach reports as arrays
        assessment["ldct_reports"] = ldct_result.data if ldct_result.data else []
        assessment["pathology_reports"] = pathology_result.data if pathology_result.data else []
        assessment["biomarker_reports"] = biomarker_result.data if biomarker_result.data else []
        assessment["staging_reports"] = staging_result.data if staging_result.data else []
        
        return assessment
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assessment: {str(e)}")


@router.put("/assessments/{assessment_id}")
async def update_assessment(
    assessment_id: str,
    assessment: LungCancerAssessmentCreate,
    user_id: str = Depends(get_current_user)
):
    """Update an existing assessment"""
    try:
        # Verify ownership
        existing = supabase.table("lung_cancer_assessments")\
            .select("id")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        assessment_data = {
            "demographics": assessment.demographics.dict(),
            "smoking_history": assessment.smokingHistory.dict(),
            "medical_history": assessment.medicalHistory.dict(),
            "environmental_exposures": assessment.environmentalExposures.dict(),
            "symptoms": assessment.symptoms.dict(),
            "eligibility": assessment.eligibility.dict(),
            "status": assessment.status,
            "notes": assessment.notes,
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        result = supabase.table("lung_cancer_assessments")\
            .update(assessment_data)\
            .eq("id", assessment_id)\
            .execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update assessment: {str(e)}")


@router.delete("/assessments/{assessment_id}")
async def delete_assessment(
    assessment_id: str,
    user_id: str = Depends(get_current_user)
):
    """Delete an assessment"""
    try:
        # Verify ownership
        existing = supabase.table("lung_cancer_assessments")\
            .select("id")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        supabase.table("lung_cancer_assessments")\
            .delete()\
            .eq("id", assessment_id)\
            .execute()
        
        return {"message": "Assessment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete assessment: {str(e)}")


# Report upload endpoints
@router.post("/assessments/{assessment_id}/ldct-report")
async def upload_ldct_report(
    assessment_id: str,
    report: str = Form(...),
    file: Optional[UploadFile] = File(None),
    user_id: str = Depends(get_current_user)
):
    """Upload LDCT report"""
    try:
        # Verify assessment ownership
        assessment = supabase.table("lung_cancer_assessments")\
            .select("id")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not assessment.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        report_json = json.loads(report)
        
        # Convert camelCase to snake_case for database
        report_data = {
            "assessment_id": assessment_id,
            "patient_id": user_id,
            "scan_date": report_json.get("scanDate"),
            "clinical_history": report_json.get("clinicalHistory", ""),
            "technique": report_json.get("technique", "Low-dose CT"),
            "findings": report_json.get("findings"),
            "impression": report_json.get("impression"),
            "lung_rads": report_json.get("lungRADS"),
            "recommendation": report_json.get("recommendation"),
            "radiologist_name": report_json.get("radiologistName"),
            "uploaded_at": datetime.utcnow().isoformat()
        }
        
        # Handle file upload if provided
        if file:
            # Save file logic here - for now just store filename
            report_data["file_path"] = file.filename
        
        result = supabase.table("ldct_reports").insert(report_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to insert report")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in report field")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {str(e)}")


# Similar endpoints for other report types...
@router.post("/assessments/{assessment_id}/pathology-report")
async def upload_pathology_report(
    assessment_id: str,
    report: str = Form(...),
    file: Optional[UploadFile] = File(None),
    user_id: str = Depends(get_current_user)
):
    """Upload pathology report"""
    try:
        assessment = supabase.table("lung_cancer_assessments")\
            .select("id")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not assessment.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        report_data = json.loads(report)
        report_data["assessment_id"] = assessment_id
        report_data["patient_id"] = user_id
        report_data["uploaded_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("pathology_reports").insert(report_data).execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {str(e)}")


@router.post("/assessments/{assessment_id}/biomarker-report")
async def upload_biomarker_report(
    assessment_id: str,
    report: str = Form(...),
    file: Optional[UploadFile] = File(None),
    user_id: str = Depends(get_current_user)
):
    """Upload biomarker report"""
    try:
        assessment = supabase.table("lung_cancer_assessments")\
            .select("id")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not assessment.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        report_data = json.loads(report)
        report_data["assessment_id"] = assessment_id
        report_data["patient_id"] = user_id
        report_data["uploaded_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("biomarker_reports").insert(report_data).execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {str(e)}")


@router.post("/assessments/{assessment_id}/staging-report")
async def upload_staging_report(
    assessment_id: str,
    report: str = Form(...),
    file: Optional[UploadFile] = File(None),
    user_id: str = Depends(get_current_user)
):
    """Upload staging report"""
    try:
        assessment = supabase.table("lung_cancer_assessments")\
            .select("id")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not assessment.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        report_data = json.loads(report)
        report_data["assessment_id"] = assessment_id
        report_data["patient_id"] = user_id
        report_data["uploaded_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("staging_reports").insert(report_data).execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {str(e)}")


@router.get("/assessments/{assessment_id}/reports")
async def get_reports(
    assessment_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get all reports for an assessment"""
    try:
        # Verify ownership
        assessment = supabase.table("lung_cancer_assessments")\
            .select("id")\
            .eq("id", assessment_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not assessment.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        reports = {}
        
        # Get all report types
        ldct = supabase.table("ldct_reports").select("*").eq("assessment_id", assessment_id).execute()
        if ldct.data:
            reports["ldct"] = ldct.data
        
        pathology = supabase.table("pathology_reports").select("*").eq("assessment_id", assessment_id).execute()
        if pathology.data:
            reports["pathology"] = pathology.data
        
        biomarker = supabase.table("biomarker_reports").select("*").eq("assessment_id", assessment_id).execute()
        if biomarker.data:
            reports["biomarker"] = biomarker.data
        
        staging = supabase.table("staging_reports").select("*").eq("assessment_id", assessment_id).execute()
        if staging.data:
            reports["staging"] = staging.data
        
        return reports
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reports: {str(e)}")
