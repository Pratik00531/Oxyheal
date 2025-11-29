// Utility functions for lung cancer risk assessment

import type { 
  SmokingHistory, 
  Demographics, 
  ScreeningEligibility,
  LungRADSScore 
} from '@/types/lungCancer';

/**
 * Calculate pack-years from smoking data
 */
export function calculatePackYears(packsPerDay: number, yearsSmoked: number): number {
  return packsPerDay * yearsSmoked;
}

/**
 * Determine if patient is eligible for LDCT screening based on USPSTF criteria
 * USPSTF 2021 Guidelines:
 * - Age 50-80
 * - ≥20 pack-year history
 * - Currently smoke OR quit within last 15 years
 */
export function assessScreeningEligibility(
  demographics: Demographics,
  smokingHistory: SmokingHistory
): ScreeningEligibility {
  const { age } = demographics;
  const { packYears, smokingStatus, yearsQuit } = smokingHistory;

  const ageEligible = age >= 50 && age <= 80;
  const packYearsEligible = packYears >= 20;
  
  let smokingStatusEligible = false;
  if (smokingStatus === 'current') {
    smokingStatusEligible = true;
  } else if (smokingStatus === 'former' && yearsQuit !== undefined) {
    smokingStatusEligible = yearsQuit <= 15;
  }

  const isEligible = ageEligible && packYearsEligible && smokingStatusEligible;

  let reason = '';
  let recommendation = '';

  if (isEligible) {
    reason = 'Patient meets USPSTF 2021 criteria for lung cancer screening';
    recommendation = 'Annual low-dose CT (LDCT) screening is recommended. Please schedule an appointment with your healthcare provider.';
  } else {
    const reasons: string[] = [];
    if (!ageEligible) {
      reasons.push(`Age ${age} is outside the recommended screening range (50-80)`);
    }
    if (!packYearsEligible) {
      reasons.push(`Pack-year history of ${packYears} is below the threshold (≥20 pack-years required)`);
    }
    if (!smokingStatusEligible) {
      if (smokingStatus === 'never') {
        reasons.push('No significant smoking history');
      } else if (smokingStatus === 'former' && yearsQuit !== undefined) {
        reasons.push(`Quit smoking ${yearsQuit} years ago (must be within last 15 years)`);
      }
    }
    
    reason = 'Patient does not meet USPSTF screening criteria: ' + reasons.join('; ');
    recommendation = 'Regular screening not recommended based on current guidelines. However, if you have symptoms or concerns, please consult with your healthcare provider.';
  }

  return {
    isEligible,
    reason,
    criteria: {
      ageEligible,
      packYearsEligible,
      smokingStatusEligible,
    },
    recommendation,
  };
}

/**
 * Calculate risk score based on multiple factors (0-100)
 * This is a simplified model - real clinical models are more complex
 */
export function calculateRiskScore(assessment: {
  demographics: Demographics;
  smokingHistory: SmokingHistory;
  medicalHistory: any;
  environmentalExposures: any;
}): number {
  let score = 0;

  // Age factor (max 20 points)
  const { age } = assessment.demographics;
  if (age >= 65) score += 20;
  else if (age >= 55) score += 15;
  else if (age >= 50) score += 10;

  // Smoking factor (max 40 points)
  const { packYears, smokingStatus } = assessment.smokingHistory;
  if (packYears >= 40) score += 30;
  else if (packYears >= 30) score += 25;
  else if (packYears >= 20) score += 20;
  else if (packYears >= 10) score += 10;

  if (smokingStatus === 'current') score += 10;
  else if (smokingStatus === 'former') score += 5;

  // Medical history (max 20 points)
  if (assessment.medicalHistory.hasLungDisease) score += 10;
  if (assessment.medicalHistory.hasChestRadiation) score += 5;
  if (assessment.medicalHistory.hasFamilyHistory) score += 5;

  // Environmental exposures (max 20 points)
  const exposures = [
    assessment.environmentalExposures.radonExposure,
    assessment.environmentalExposures.asbestosExposure,
    assessment.environmentalExposures.airPollutionExposure,
    assessment.environmentalExposures.secondhandSmokeExposure,
  ].filter(Boolean).length;
  
  score += exposures * 5;

  return Math.min(score, 100);
}

/**
 * Get risk level description
 */
export function getRiskLevel(score: number): {
  level: 'low' | 'moderate' | 'high' | 'very-high';
  description: string;
  color: string;
} {
  if (score < 25) {
    return {
      level: 'low',
      description: 'Low risk based on current factors',
      color: 'green',
    };
  } else if (score < 50) {
    return {
      level: 'moderate',
      description: 'Moderate risk - regular monitoring recommended',
      color: 'yellow',
    };
  } else if (score < 75) {
    return {
      level: 'high',
      description: 'High risk - screening strongly recommended',
      color: 'orange',
    };
  } else {
    return {
      level: 'very-high',
      description: 'Very high risk - immediate screening recommended',
      color: 'red',
    };
  }
}

/**
 * Interpret Lung-RADS score
 */
export function interpretLungRADS(score: LungRADSScore): {
  category: string;
  description: string;
  recommendation: string;
  urgency: 'routine' | 'monitor' | 'urgent';
} {
  switch (score) {
    case 0:
      return {
        category: 'Incomplete',
        description: 'Prior CT images or comparison needed',
        recommendation: 'Obtain prior CT scans or additional imaging',
        urgency: 'monitor',
      };
    case 1:
      return {
        category: 'Negative',
        description: 'No lung nodules or abnormalities',
        recommendation: 'Continue annual screening in 12 months',
        urgency: 'routine',
      };
    case 2:
      return {
        category: 'Benign',
        description: 'Benign appearance or behavior',
        recommendation: 'Continue annual screening in 12 months',
        urgency: 'routine',
      };
    case 3:
      return {
        category: 'Probably Benign',
        description: 'Probably benign finding - short-term follow-up suggested',
        recommendation: 'Repeat LDCT in 6 months',
        urgency: 'monitor',
      };
    case 4:
      return {
        category: 'Suspicious',
        description: 'Suspicious finding - may require tissue diagnosis',
        recommendation: 'Repeat LDCT in 3 months, PET-CT, or biopsy depending on findings',
        urgency: 'urgent',
      };
    default:
      return {
        category: 'Unknown',
        description: 'Invalid Lung-RADS score',
        recommendation: 'Consult with radiologist',
        urgency: 'monitor',
      };
  }
}

/**
 * Get cancer stage description
 */
export function getStageDescription(stage: string): string {
  const stages: Record<string, string> = {
    'IA': 'Stage I: Small tumor, no lymph node involvement, localized',
    'IB': 'Stage I: Larger tumor, no lymph node involvement, localized',
    'IIA': 'Stage II: Tumor with limited lymph node involvement',
    'IIB': 'Stage II: Larger tumor with limited lymph node involvement',
    'IIIA': 'Stage III: Locally advanced with lymph node involvement',
    'IIIB': 'Stage III: Extensive local spread and lymph node involvement',
    'IIIC': 'Stage III: Very advanced local disease',
    'IV': 'Stage IV: Metastatic disease - spread to distant organs',
  };
  
  return stages[stage] || 'Unknown stage';
}
