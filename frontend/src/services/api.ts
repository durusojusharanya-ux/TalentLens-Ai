import {
  Job,
  JobCreatePayload,
  Candidate,
  UploadBatchResponse,
  DashboardStats,
  AppSettingsData,
  ScreeningSession,
  AuditLog,
  CandidateCompareResult,
  BackupSnapshot
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorDetail = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string'
            ? errorJson.detail
            : JSON.stringify(errorJson.detail);
        } else if (errorJson.message) {
          errorDetail = errorJson.message;
        }
      } catch {
        // Fallback to response text
      }
      throw new ApiError(errorDetail, response.status);
    }
    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network unreachable / backend offline
    throw new ApiError(
      'Unable to connect to TalentLens AI backend. Please ensure the local backend server is running on http://127.0.0.1:8000.',
      0
    );
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    return request<{ status: string; ml_libraries: Record<string, string> }>('/health');
  },

  // Stats
  getStats: async (): Promise<DashboardStats> => {
    return request<DashboardStats>('/stats');
  },

  // Jobs
  getJobs: async (): Promise<Job[]> => {
    return request<Job[]>('/jobs');
  },

  getJob: async (id: string): Promise<Job> => {
    return request<Job>(`/jobs/${id}`);
  },

  getJobTemplates: async (): Promise<Job[]> => {
    return request<Job[]>('/jobs/templates');
  },

  createJob: async (payload: JobCreatePayload): Promise<Job> => {
    return request<Job>('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  updateJob: async (id: string, payload: Partial<JobCreatePayload>): Promise<Job> => {
    return request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  deleteJob: async (id: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload Resumes
  uploadResumes: async (jobId: string, files: File[], sessionId?: string): Promise<UploadBatchResponse> => {
    const formData = new FormData();
    formData.append('job_id', jobId);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }
    files.forEach((file) => {
      formData.append('files', file);
    });

    const url = `${API_BASE_URL}/resumes/upload`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = `Upload failed with status ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson.detail) {
            errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
          }
        } catch {}
        throw new ApiError(errorDetail, response.status);
      }
      return await response.json();
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to communicate with resume upload server.', 0);
    }
  },

  // Candidates
  getCandidates: async (params?: {
    search?: string;
    job_id?: string;
    session_id?: string;
    quick_view?: string;
    shortlisted?: boolean;
    min_score?: number;
    max_score?: number;
    sort_by?: 'score' | 'name' | 'date' | 'coverage';
    order?: 'asc' | 'desc';
  }): Promise<Candidate[]> => {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append('search', params.search);
      if (params.job_id) query.append('job_id', params.job_id);
      if (params.session_id) query.append('session_id', params.session_id);
      if (params.quick_view) query.append('quick_view', params.quick_view);
      if (params.shortlisted !== undefined) query.append('shortlisted', String(params.shortlisted));
      if (params.min_score !== undefined) query.append('min_score', String(params.min_score));
      if (params.max_score !== undefined) query.append('max_score', String(params.max_score));
      if (params.sort_by) query.append('sort_by', params.sort_by);
      if (params.order) query.append('order', params.order);
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Candidate[]>(`/candidates${qs}`);
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    return request<Candidate>(`/candidates/${id}`);
  },

  compareCandidates: async (candidateIds: string[]): Promise<CandidateCompareResult> => {
    return request<CandidateCompareResult>('/candidates/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_ids: candidateIds }),
    });
  },

  bulkShortlist: async (candidateIds: string[], shortlist_status: boolean): Promise<{ status: string; updated_count: number }> => {
    return request<{ status: string; updated_count: number }>('/candidates/bulk-shortlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_ids: candidateIds, shortlist_status }),
    });
  },

  toggleShortlist: async (id: string, shortlist_status: boolean): Promise<{ status: string; shortlist_status: boolean }> => {
    return request<{ status: string; shortlist_status: boolean }>(`/candidates/${id}/shortlist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortlist_status }),
    });
  },

  updateCandidateStage: async (id: string, stage: string): Promise<{ status: string; candidate_id: string; stage: string; shortlist_status: boolean }> => {
    return request<{ status: string; candidate_id: string; stage: string; shortlist_status: boolean }>(`/candidates/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
  },

  updateCandidateInterview: async (id: string, interviewData: any): Promise<{ status: string; candidate_id: string; stage: string; interview_notes: any }> => {
    return request<{ status: string; candidate_id: string; stage: string; interview_notes: any }>(`/candidates/${id}/interview`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interviewData),
    });
  },

  deleteCandidate: async (id: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>(`/candidates/${id}`, {
      method: 'DELETE',
    });
  },

  // Screening Sessions
  getSessions: async (): Promise<ScreeningSession[]> => {
    return request<ScreeningSession[]>('/sessions');
  },

  getSession: async (id: string): Promise<ScreeningSession & { candidates: Candidate[] }> => {
    return request<ScreeningSession & { candidates: Candidate[] }>(`/sessions/${id}`);
  },

  createSession: async (name: string, job_id: string): Promise<ScreeningSession> => {
    return request<ScreeningSession>('/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, job_id }),
    });
  },

  deleteSession: async (id: string): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  },

  // Audit Logs
  getAuditLogs: async (limit = 100, eventType?: string): Promise<AuditLog[]> => {
    const qs = eventType ? `?limit=${limit}&event_type=${encodeURIComponent(eventType)}` : `?limit=${limit}`;
    return request<AuditLog[]>(`/audit${qs}`);
  },

  // Backup & Restore
  getBackup: async (): Promise<BackupSnapshot> => {
    return request<BackupSnapshot>('/backup');
  },

  restoreBackup: async (payload: any): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>('/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Export CSV
  downloadCsv: async (shortlistOnly = false, jobId?: string) => {
    const query = new URLSearchParams();
    if (shortlistOnly) query.append('shortlist_only', 'true');
    if (jobId) query.append('job_id', jobId);

    const url = `${API_BASE_URL}/export/csv?${query.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CSV Export failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = shortlistOnly ? 'talentlens_shortlisted.csv' : 'talentlens_candidates.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },

  downloadJobsCsv: async () => {
    const url = `${API_BASE_URL}/export/jobs/csv`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Jobs CSV Export failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'talentlens_jobs.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },

  // Demo Data
  resetDemoData: async () => {
    return request<{ status: string; message: string; demo_count: number }>('/demo/reset', {
      method: 'POST',
    });
  },

  clearDemoData: async () => {
    return request<{ status: string; message: string; remaining_candidates: number }>('/demo/clear', {
      method: 'DELETE',
    });
  },

  // Settings
  getSettings: async (): Promise<AppSettingsData> => {
    return request<AppSettingsData>('/settings');
  },

  updateSettings: async (settings: Partial<AppSettingsData['settings']>) => {
    return request<{ status: string; settings: AppSettingsData['settings'] }>('/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  },
};
