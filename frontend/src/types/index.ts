export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience_years?: number;
  location?: string;
  employment_type: string;
  created_at: string;
  updated_at: string;
}

export interface JobCreatePayload {
  title: string;
  department: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience_years?: number;
  location?: string;
  employment_type: string;
}

export type CandidateStage = 'New' | 'Reviewed' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';

export interface InterviewNotes {
  scheduled_date?: string;
  status?: string; // 'Scheduled' | 'Completed' | 'Pending' | 'Cancelled'
  interviewer?: string;
  rating?: number; // 1-5
  notes?: string;
  feedback?: string;
  next_steps?: string;
  updated_at?: string;
}

export interface Candidate {
  id: string;
  rank?: number;
  name: string;
  email: string;
  phone?: string;
  estimated_experience?: string;
  estimated_education?: string;
  stage?: CandidateStage;
  interview_notes?: InterviewNotes;
  job_id: string;
  job_title: string;
  session_id?: string;
  similarity_score: number;
  required_skills_matched: string[];
  required_skills_missing: string[];
  preferred_skills_matched: string[];
  required_skill_coverage: number;
  evidence_snippets?: Record<string, string>;
  explanation: string;
  warnings: string[];
  extracted_text: string;
  original_filename: string;
  stored_filename: string;
  shortlist_status: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadResultItem {
  filename: string;
  success: boolean;
  error?: string | null;
  candidate?: Candidate | null;
}

export interface UploadBatchResponse {
  job_id: string;
  job_title: string;
  total_files: number;
  successful_screenings: number;
  failed_screenings: number;
  results: UploadResultItem[];
}

export interface ScoreDistributionItem {
  range: string;
  count: number;
  label: string;
}

export interface StatusBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface SkillCountItem {
  skill: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  name: string;
  job_title: string;
  similarity_score: number;
  shortlist_status: boolean;
  created_at: string;
  is_demo: boolean;
}

export interface DashboardStats {
  total_resumes: number;
  analyzed_candidates: number;
  shortlisted_candidates: number;
  avg_match_score: number;
  highest_match_score: number;
  saved_jobs_count: number;
  score_distribution: ScoreDistributionItem[];
  status_breakdown: StatusBreakdownItem[];
  top_matched_skills: SkillCountItem[];
  top_missing_skills: SkillCountItem[];
  recent_activity: RecentActivityItem[];
  is_demo_mode: boolean;
  demo_count: number;
}

export interface AppSettingsData {
  settings: {
    score_threshold_strong: number;
    score_threshold_moderate: number;
    theme: string;
    max_upload_size_mb: number;
    max_batch_size: number;
    demo_mode_active: boolean;
  };
  storage_info: {
    data_directory: string;
    uploads_directory: string;
    storage_type: string;
    encryption: string;
  };
  privacy_notice: {
    local_execution: string;
    zero_cloud_calls: string;
    local_access_caution: string;
    production_notice: string;
  };
}

export interface ScreeningSession {
  id: string;
  name: string;
  job_id: string;
  job_title: string;
  job_snapshot: {
    title?: string;
    department?: string;
    description?: string;
    required_skills: string[];
    preferred_skills: string[];
  };
  candidate_ids: string[];
  candidate_count: number;
  avg_score: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  description: string;
  timestamp: string;
  candidate_id?: string;
  candidate_name?: string;
  job_id?: string;
  job_title?: string;
  session_id?: string;
  details?: Record<string, any>;
}

export interface SkillMatrixCandidateEntry {
  matched: boolean;
  evidence: string;
}

export interface SkillMatrixItem {
  skill: string;
  is_required: boolean;
  candidates: Record<string, SkillMatrixCandidateEntry>;
}

export interface CandidateCompareResult {
  candidate_count: number;
  candidates: Candidate[];
  skill_matrix: SkillMatrixItem[];
}

export interface BackupSnapshot {
  app: string;
  version: string;
  created_at: string;
  jobs: Job[];
  candidates: Candidate[];
  sessions: ScreeningSession[];
  audit_logs: AuditLog[];
  settings: any;
}
