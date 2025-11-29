// API functions for lung cancer assessment

import { api } from './api';
import type { LungCancerAssessment, LDCTReport, PathologyReport, BiomarkerReport, StagingReport } from '@/types/lungCancer';

const LUNG_CANCER_BASE = '/lung-cancer';

export const lungCancerApi = {
  // Assessment CRUD
  async createAssessment(data: Partial<LungCancerAssessment>) {
    return api.request<LungCancerAssessment>(`${LUNG_CANCER_BASE}/assessments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAssessments() {
    return api.request<LungCancerAssessment[]>(`${LUNG_CANCER_BASE}/assessments`);
  },

  async getAssessment(id: string) {
    return api.request<LungCancerAssessment>(`${LUNG_CANCER_BASE}/assessments/${id}`);
  },

  async updateAssessment(id: string, data: Partial<LungCancerAssessment>) {
    return api.request<LungCancerAssessment>(`${LUNG_CANCER_BASE}/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAssessment(id: string) {
    return api.request(`${LUNG_CANCER_BASE}/assessments/${id}`, {
      method: 'DELETE',
    });
  },

  // LDCT Reports
  async uploadLDCTReport(assessmentId: string, report: Partial<LDCTReport>, file?: File) {
    const formData = new FormData();
    formData.append('report', JSON.stringify(report));
    if (file) {
      formData.append('file', file);
    }

    console.log('Uploading LDCT Report:', report);
    console.log('Assessment ID:', assessmentId);

    const headers: HeadersInit = {};
    if (api.getToken()) {
      headers['Authorization'] = `Bearer ${api.getToken()}`;
    }

    try {
      const response = await fetch(`${api.getBaseUrl()}${LUNG_CANCER_BASE}/assessments/${assessmentId}/ldct-report`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        console.error('Upload Error Response:', error);
        console.error('Full Error:', JSON.stringify(error, null, 2));
        
        // Handle validation errors
        if (Array.isArray(error.detail)) {
          const errorMessages = error.detail.map((e: any) => 
            `${e.loc?.join('.') || 'field'}: ${e.msg}`
          ).join(', ');
          return { error: errorMessages };
        }
        
        return { error: error.detail || JSON.stringify(error) || 'Upload failed' };
      }

      const data = await response.json();
      console.log('Upload Success:', data);
      return { data };
    } catch (error) {
      console.error('Upload Exception:', error);
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  // Pathology Reports
  async uploadPathologyReport(assessmentId: string, report: Partial<PathologyReport>, file?: File) {
    const formData = new FormData();
    formData.append('report', JSON.stringify(report));
    if (file) {
      formData.append('file', file);
    }

    const headers: HeadersInit = {};
    if (api.getToken()) {
      headers['Authorization'] = `Bearer ${api.getToken()}`;
    }

    try {
      const response = await fetch(`${api.getBaseUrl()}${LUNG_CANCER_BASE}/assessments/${assessmentId}/pathology-report`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  // Biomarker Reports
  async uploadBiomarkerReport(assessmentId: string, report: Partial<BiomarkerReport>, file?: File) {
    const formData = new FormData();
    formData.append('report', JSON.stringify(report));
    if (file) {
      formData.append('file', file);
    }

    const headers: HeadersInit = {};
    if (api.getToken()) {
      headers['Authorization'] = `Bearer ${api.getToken()}`;
    }

    try {
      const response = await fetch(`${api.getBaseUrl()}${LUNG_CANCER_BASE}/assessments/${assessmentId}/biomarker-report`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  // Staging Reports
  async uploadStagingReport(assessmentId: string, report: Partial<StagingReport>, file?: File) {
    const formData = new FormData();
    formData.append('report', JSON.stringify(report));
    if (file) {
      formData.append('file', file);
    }

    const headers: HeadersInit = {};
    if (api.getToken()) {
      headers['Authorization'] = `Bearer ${api.getToken()}`;
    }

    try {
      const response = await fetch(`${api.getBaseUrl()}${LUNG_CANCER_BASE}/assessments/${assessmentId}/staging-report`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  },

  // Get all reports for an assessment
  async getReports(assessmentId: string) {
    return api.request<{
      ldct?: LDCTReport;
      pathology?: PathologyReport;
      biomarker?: BiomarkerReport;
      staging?: StagingReport;
    }>(`${LUNG_CANCER_BASE}/assessments/${assessmentId}/reports`);
  },
};
