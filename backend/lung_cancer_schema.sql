-- Lung Cancer Screening Database Schema
-- Run this in Supabase SQL Editor after running the base schema.sql

-- Lung Cancer Assessments Table
CREATE TABLE IF NOT EXISTS lung_cancer_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  demographics JSONB NOT NULL,
  smoking_history JSONB NOT NULL,
  medical_history JSONB NOT NULL,
  environmental_exposures JSONB NOT NULL,
  symptoms JSONB NOT NULL,
  eligibility JSONB NOT NULL,
  status TEXT DEFAULT 'screening-eligible',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LDCT (Low-Dose CT) Reports Table
CREATE TABLE IF NOT EXISTS ldct_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES lung_cancer_assessments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  scan_date DATE NOT NULL,
  clinical_history TEXT,
  technique TEXT,
  findings TEXT NOT NULL,
  impression TEXT NOT NULL,
  lung_rads INTEGER CHECK (lung_rads >= 0 AND lung_rads <= 4),
  recommendation TEXT NOT NULL,
  radiologist_name TEXT,
  file_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pathology Reports Table
CREATE TABLE IF NOT EXISTS pathology_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES lung_cancer_assessments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  biopsy_date DATE NOT NULL,
  biopsy_site TEXT NOT NULL,
  cancer_type TEXT CHECK (cancer_type IN ('non-small-cell', 'small-cell', 'negative')),
  histology TEXT CHECK (histology IN ('adenocarcinoma', 'squamous-cell', 'large-cell', 'other')),
  findings TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  pathologist_name TEXT,
  file_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biomarker Reports Table
CREATE TABLE IF NOT EXISTS biomarker_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES lung_cancer_assessments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  test_date DATE NOT NULL,
  egfr BOOLEAN DEFAULT FALSE,
  alk BOOLEAN DEFAULT FALSE,
  kras BOOLEAN DEFAULT FALSE,
  ros1 BOOLEAN DEFAULT FALSE,
  braf BOOLEAN DEFAULT FALSE,
  pdl1_expression DECIMAL(5,2),
  findings TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  file_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staging Reports Table
CREATE TABLE IF NOT EXISTS staging_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES lung_cancer_assessments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  scan_date DATE NOT NULL,
  scan_type TEXT CHECK (scan_type IN ('PET-CT', 'CT', 'MRI')) NOT NULL,
  tumor_size TEXT,
  lymph_node_involvement BOOLEAN DEFAULT FALSE,
  metastasis BOOLEAN DEFAULT FALSE,
  metastasis_sites TEXT[],
  stage TEXT,
  findings TEXT NOT NULL,
  file_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lung_cancer_assessments_user_id 
  ON lung_cancer_assessments(user_id);

CREATE INDEX IF NOT EXISTS idx_lung_cancer_assessments_status 
  ON lung_cancer_assessments(status);

CREATE INDEX IF NOT EXISTS idx_lung_cancer_assessments_created_at 
  ON lung_cancer_assessments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ldct_reports_assessment_id 
  ON ldct_reports(assessment_id);

CREATE INDEX IF NOT EXISTS idx_ldct_reports_patient_id 
  ON ldct_reports(patient_id);

CREATE INDEX IF NOT EXISTS idx_ldct_reports_scan_date 
  ON ldct_reports(scan_date DESC);

CREATE INDEX IF NOT EXISTS idx_pathology_reports_assessment_id 
  ON pathology_reports(assessment_id);

CREATE INDEX IF NOT EXISTS idx_pathology_reports_patient_id 
  ON pathology_reports(patient_id);

CREATE INDEX IF NOT EXISTS idx_biomarker_reports_assessment_id 
  ON biomarker_reports(assessment_id);

CREATE INDEX IF NOT EXISTS idx_biomarker_reports_patient_id 
  ON biomarker_reports(patient_id);

CREATE INDEX IF NOT EXISTS idx_staging_reports_assessment_id 
  ON staging_reports(assessment_id);

CREATE INDEX IF NOT EXISTS idx_staging_reports_patient_id 
  ON staging_reports(patient_id);

-- Comments for documentation
COMMENT ON TABLE lung_cancer_assessments IS 'Stores patient lung cancer risk assessments including demographics, smoking history, and eligibility for screening';
COMMENT ON TABLE ldct_reports IS 'Low-Dose CT scan reports with Lung-RADS scoring';
COMMENT ON TABLE pathology_reports IS 'Pathology/biopsy reports for tissue diagnosis';
COMMENT ON TABLE biomarker_reports IS 'Molecular and biomarker test results (EGFR, ALK, KRAS, etc.)';
COMMENT ON TABLE staging_reports IS 'Cancer staging reports from PET-CT or other imaging';

COMMENT ON COLUMN ldct_reports.lung_rads IS 'Lung-RADS score: 0 (incomplete), 1 (negative), 2 (benign), 3 (probably benign), 4 (suspicious)';
COMMENT ON COLUMN biomarker_reports.pdl1_expression IS 'PD-L1 expression percentage (0-100)';
COMMENT ON COLUMN staging_reports.stage IS 'TNM cancer stage (e.g., IA, IIB, IIIA, IV)';
