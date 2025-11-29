# Lung Cancer Screening System

A comprehensive lung cancer screening and detection system integrated into OxyHeal Dashboard.

## Features

### 1. **Risk Assessment & Screening Eligibility**
- Multi-step form collecting:
  - Demographics (age, sex)
  - Smoking history with pack-year calculation
  - Medical history (lung disease, chest radiation, family history)
  - Environmental exposures (radon, asbestos, air pollution, secondhand smoke)
  - Current symptoms
- **USPSTF 2021 Guidelines** compliance:
  - Age 50-80
  - ≥20 pack-year smoking history
  - Currently smoking OR quit within last 15 years
- Automated eligibility determination
- Risk score calculation (0-100)

### 2. **Report Management**
Supports four types of medical reports:

#### LDCT (Low-Dose CT) Reports
- Lung-RADS scoring (0-4)
- Findings and impressions
- Follow-up recommendations

#### Pathology Reports
- Biopsy results
- Cancer type classification (non-small-cell vs small-cell)
- Histology details (adenocarcinoma, squamous-cell, etc.)

#### Biomarker Reports
- Genetic mutation testing (EGFR, ALK, KRAS, ROS1, BRAF)
- PD-L1 expression levels
- Treatment recommendations

#### Staging Reports
- PET-CT / CT / MRI results
- TNM staging
- Metastasis assessment
- Lymph node involvement

### 3. **Results Dashboard**
- Visual representation of risk factors
- Eligibility criteria breakdown
- Risk score with progress indicator
- Report upload interface
- Lung-RADS interpretation

## Database Schema

### Tables Created
```sql
- lung_cancer_assessments  # Patient assessments
- ldct_reports             # Low-Dose CT reports
- pathology_reports        # Biopsy results
- biomarker_reports        # Molecular testing
- staging_reports          # Cancer staging
```

## Setup Instructions

### Backend Setup

1. **Run SQL Schema**
   ```bash
   # First, make sure base schema (users, log_entries) is created
   # Then run the lung cancer schema:
   ```
   - Go to Supabase SQL Editor
   - Copy contents from `backend/lung_cancer_schema.sql`
   - Click "Run"

2. **Backend is already configured** with the lung cancer router

3. **Restart backend** (if needed):
   ```bash
   cd /home/pratik/oxyheal-dashboard
   source .venv/bin/activate
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

The frontend pages are created:
- `/src/pages/LungCancerScreening.tsx` - Multi-step assessment form
- `/src/pages/LungCancerResults.tsx` - Results and report management

You need to **add routes** to your routing configuration.

## Usage Flow

### For Patients

1. **Start Assessment**
   - Navigate to Lung Cancer Screening
   - Fill out 5-step questionnaire
   - System calculates pack-years automatically
   - Get instant eligibility results

2. **View Results**
   - See screening eligibility (Yes/No with explanation)
   - Review risk score (0-100 with visual indicator)
   - Understand risk factors
   - Get personalized recommendations

3. **Upload Reports**
   - Upload LDCT reports with Lung-RADS scoring
   - Add pathology reports from biopsies
   - Submit biomarker test results
   - Upload staging scans

4. **Track Progress**
   - View all assessments over time
   - Monitor Lung-RADS scores
   - Track staging changes
   - Export or print results

## API Endpoints

### Assessments
- `POST /lung-cancer/assessments` - Create new assessment
- `GET /lung-cancer/assessments` - List all user's assessments
- `GET /lung-cancer/assessments/{id}` - Get specific assessment with reports
- `PUT /lung-cancer/assessments/{id}` - Update assessment
- `DELETE /lung-cancer/assessments/{id}` - Delete assessment

### Reports
- `POST /lung-cancer/assessments/{id}/ldct-report` - Upload LDCT report
- `POST /lung-cancer/assessments/{id}/pathology-report` - Upload pathology report
- `POST /lung-cancer/assessments/{id}/biomarker-report` - Upload biomarker report
- `POST /lung-cancer/assessments/{id}/staging-report` - Upload staging report
- `GET /lung-cancer/assessments/{id}/reports` - Get all reports for assessment

## Clinical Guidelines

### USPSTF 2021 Screening Criteria
- **Age**: 50-80 years
- **Pack-Years**: ≥20 pack-years
  - Formula: Packs/day × Years smoked
  - Example: 1 pack/day for 20 years = 20 pack-years
- **Smoking Status**: 
  - Current smoker, OR
  - Former smoker who quit within last 15 years

### Lung-RADS Scores
- **0**: Incomplete - need prior images
- **1**: Negative - annual screening
- **2**: Benign - annual screening
- **3**: Probably benign - 6-month follow-up
- **4**: Suspicious - 3-month follow-up, PET-CT, or biopsy

### Cancer Stages
- **Stage I**: Localized, small tumor
- **Stage II**: Larger tumor, limited spread
- **Stage III**: Locally advanced, lymph nodes involved
- **Stage IV**: Metastatic disease

## Key Features

### Risk Calculation
Multi-factor risk scoring:
- Age (max 20 points)
- Smoking history (max 40 points)
- Medical history (max 20 points)
- Environmental exposures (max 20 points)

### Pack-Year Calculator
Automatic calculation of pack-years:
```typescript
packYears = packsPerDay × yearsSmoked
```

### Eligibility Engine
Automated screening eligibility based on:
- Age range validation
- Pack-year threshold
- Smoking status timeline

## Future Enhancements

- [ ] AI-powered CT scan analysis
- [ ] Risk prediction models (Bach, PLCOm2012)
- [ ] Integration with radiology systems (DICOM)
- [ ] Automated report parsing (NLP)
- [ ] Treatment tracking
- [ ] Survival rate calculator
- [ ] Clinical trial matching
- [ ] Telemedicine integration
- [ ] Mobile app notifications

## Security & Privacy

- All assessments tied to authenticated users
- HIPAA-compliant data handling practices
- JWT-based authentication
- Encrypted file storage
- User data isolation at database level

## Testing

### Test Data Example
```typescript
{
  demographics: { age: 62, sex: 'male' },
  smokingHistory: {
    packsPerDay: 1.5,
    yearsSmoked: 30,
    packYears: 45,
    smokingStatus: 'former',
    yearsQuit: 10
  },
  // ... other fields
}
```

Expected: **Eligible for screening** (age 50-80, ≥20 pack-years, quit <15 years ago)

## Support

For questions or issues:
- Email: support@oxyheal.com
- Documentation: `/docs`
- API Docs: `http://localhost:8000/docs`

## License

Part of OxyHeal Dashboard - All rights reserved
