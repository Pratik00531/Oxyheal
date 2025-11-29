// Types for Lung Cancer Detection System

export interface Demographics {
  age: number;
  sex: 'male' | 'female' | 'other';
}

export interface SmokingHistory {
  packsPerDay: number;
  yearsSmoked: number;
  packYears: number; // Calculated: packsPerDay × yearsSmoked
  smokingStatus: 'current' | 'former' | 'never';
  yearsQuit?: number; // If former smoker
}

export interface MedicalHistory {
  hasLungDisease: boolean;
  lungDiseaseTypes?: string[]; // e.g., ['COPD', 'emphysema']
  hasChestRadiation: boolean;
  hasFamilyHistory: boolean;
  familyHistoryDetails?: string;
}

export interface EnvironmentalExposures {
  radonExposure: boolean;
  asbestosExposure: boolean;
  airPollutionExposure: boolean;
  secondhandSmokeExposure: boolean;
  exposureDetails?: string;
}

export interface Symptoms {
  persistentCough: boolean;
  shortnessOfBreath: boolean;
  chestPain: boolean;
  unexplainedWeightLoss: boolean;
  hemoptysis: boolean; // Coughing up blood
  otherSymptoms?: string;
}

export interface ScreeningEligibility {
  isEligible: boolean;
  reason: string;
  criteria: {
    ageEligible: boolean;
    packYearsEligible: boolean;
    smokingStatusEligible: boolean;
  };
  recommendation: string;
}

// Report Types

export type LungRADSScore = 0 | 1 | 2 | 3 | 4;

export interface LDCTReport {
  id: string;
  patientId: string;
  scanDate: string;
  clinicalHistory: string;
  technique: string;
  findings: string;
  impression: string;
  lungRADS: LungRADSScore;
  recommendation: string;
  radiologistName?: string;
  uploadedAt: string;
}

export interface PathologyReport {
  id: string;
  patientId: string;
  biopsyDate: string;
  biopsySite: string;
  cancerType?: 'non-small-cell' | 'small-cell' | 'negative';
  histology?: 'adenocarcinoma' | 'squamous-cell' | 'large-cell' | 'other';
  findings: string;
  diagnosis: string;
  pathologistName?: string;
  uploadedAt: string;
}

export interface BiomarkerReport {
  id: string;
  patientId: string;
  testDate: string;
  egfr: boolean;
  alk: boolean;
  kras: boolean;
  ros1: boolean;
  braf: boolean;
  pdl1Expression?: number; // Percentage
  findings: string;
  recommendation: string;
  uploadedAt: string;
}

export interface StagingReport {
  id: string;
  patientId: string;
  scanDate: string;
  scanType: 'PET-CT' | 'CT' | 'MRI';
  tumorSize?: string;
  lymphNodeInvolvement: boolean;
  metastasis: boolean;
  metastasisSites?: string[];
  stage?: string; // e.g., 'IA', 'IIB', 'IIIA', 'IV'
  findings: string;
  uploadedAt: string;
}

// Main Patient Assessment
export interface LungCancerAssessment {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Patient Information
  demographics: Demographics;
  smokingHistory: SmokingHistory;
  medicalHistory: MedicalHistory;
  environmentalExposures: EnvironmentalExposures;
  symptoms: Symptoms;
  
  // Eligibility
  eligibility: ScreeningEligibility;
  
  // Reports (optional, added later)
  ldctReport?: LDCTReport;
  pathologyReport?: PathologyReport;
  biomarkerReport?: BiomarkerReport;
  stagingReport?: StagingReport;
  
  // Status
  status: 'screening-eligible' | 'screening-scheduled' | 'results-pending' | 'follow-up-required' | 'negative' | 'diagnosed';
  notes?: string;
}

// Form state for multi-step form
export interface LungCancerFormData {
  demographics: Partial<Demographics>;
  smokingHistory: Partial<SmokingHistory>;
  medicalHistory: Partial<MedicalHistory>;
  environmentalExposures: Partial<EnvironmentalExposures>;
  symptoms: Partial<Symptoms>;
}
