import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Sparkles,
  Info,
  FolderOpen,
  PlusCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Job, UploadResultItem, Candidate, ScreeningSession } from '../types';
import { api } from '../services/api';

interface AnalyzePageProps {
  jobs: Job[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  onCandidateAnalyzed: (candidate: Candidate) => void;
  onNavigateCandidates: (sessionId?: string) => void;
  onSelectCandidate: (candidateId: string) => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({
  jobs,
  selectedJobId,
  setSelectedJobId,
  onCandidateAnalyzed,
  onNavigateCandidates,
  onSelectCandidate,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResultItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [selectedSessionOption, setSelectedSessionOption] = useState<string>('new');
  const [newSessionName, setNewSessionName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch {
      // Non-blocking
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setErrorMessage(null);
    const validPdfs: File[] = [];
    const rejected: string[] = [];

    newFiles.forEach((file) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        rejected.push(`${file.name} (not a PDF file)`);
      } else if (file.size > 5 * 1024 * 1024) {
        rejected.push(`${file.name} (exceeds 5MB limit)`);
      } else {
        validPdfs.push(file);
      }
    });

    if (rejected.length > 0) {
      setErrorMessage(`Rejected files: ${rejected.join(', ')}`);
    }

    // Check 20 files batch limit
    const combined = [...selectedFiles, ...validPdfs];
    if (combined.length > 20) {
      setErrorMessage('Batch limit exceeded: Maximum 20 PDF files per screening run.');
      setSelectedFiles(combined.slice(0, 20));
    } else {
      setSelectedFiles(combined);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setUploadResults(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadAndAnalyze = async () => {
    if (!activeJob) {
      setErrorMessage('Please select or create a job benchmark before screening resumes.');
      return;
    }
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one PDF resume to screen.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadResults(null);

    try {
      let targetSessionId: string | undefined = undefined;
      if (selectedSessionOption === 'new') {
        const defaultName = newSessionName.trim() || `${activeJob.title} — Screening Run ${new Date().toLocaleDateString()}`;
        try {
          const createdSess = await api.createSession(defaultName, activeJob.id);
          targetSessionId = createdSess.id;
          setSessions((prev) => [createdSess, ...prev]);
        } catch {
          // If explicit session creation fails, backend will create standard run session
        }
      } else {
        targetSessionId = selectedSessionOption;
      }

      const response = await api.uploadResumes(activeJob.id, selectedFiles, targetSessionId);
      setUploadResults(response.results);

      // Notify parent for each successfully created candidate
      response.results.forEach((item) => {
        if (item.success && item.candidate) {
          onCandidateAnalyzed(item.candidate);
        }
      });

      // Refresh sessions
      loadSessions();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and analyze resumes.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Target Job Benchmark & Screening Session Card */}
      <div className="saas-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Job Benchmark
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', margin: '4px 0 0' }}>
              {activeJob ? activeJob.title : 'No Job Selected'}
            </h2>
          </div>

          {jobs.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Switch Role:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="input-field"
                style={{ height: '36px', padding: '6px 32px 6px 12px', fontSize: '0.85rem', width: '220px' }}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeJob && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
              {activeJob.description.slice(0, 180)}...
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-bright)' }}>Required Skills:</span>
              {activeJob.required_skills.map((s, idx) => (
                <span key={idx} className="skill-tag skill-tag-matched">
                  {s}
                </span>
              ))}
            </div>

            {/* Screening Session Controls */}
            <div
              style={{
                backgroundColor: 'rgba(234, 246, 255, 0.65)',
                border: '1px solid rgba(191, 219, 254, 0.75)',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-bright)' }}>
                  Screening Session:
                </span>
              </div>

              <select
                value={selectedSessionOption}
                onChange={(e) => setSelectedSessionOption(e.target.value)}
                className="input-field"
                style={{ height: '34px', fontSize: '0.8125rem', width: '240px' }}
              >
                <option value="new">+ Create New Session Snapshot</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.candidate_count} candidates)
                  </option>
                ))}
              </select>

              {selectedSessionOption === 'new' && (
                <input
                  type="text"
                  placeholder="Session name (e.g. Q4 Campus Hiring Batch A)"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="input-field"
                  style={{ height: '34px', fontSize: '0.8125rem', flex: '1', minWidth: '200px' }}
                />
              )}

              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', width: '100%' }}>
                Preserves job description snapshot and matching criteria at analysis time for audit reproducibility.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Box */}
      <div
        className="saas-card card-upload"
        style={{
          border: isDragging ? '2px dashed var(--primary)' : '2px dashed rgba(59, 130, 246, 0.55)',
          background: isDragging
            ? 'linear-gradient(135deg, rgba(221, 251, 250, 0.85) 0%, rgba(222, 242, 255, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(221, 251, 250, 0.6) 0%, rgba(238, 231, 255, 0.55) 100%)',
          transition: 'all 0.22s ease',
          textAlign: 'center',
          padding: '44px 24px',
          cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(37, 99, 235, 0.06)',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)',
            border: '1px solid #DDD6FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 18px rgba(124, 58, 237, 0.15)',
          }}
        >
          <Upload size={28} color="#7C3AED" />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '6px' }}>
          Drag & Drop PDF Resumes Here
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          or <span style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>browse your files</span>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <span>• PDF format only (.pdf)</span>
          <span>• Selectable text (not scanned images)</span>
          <span>• Max 5 MB per file</span>
          <span>• Up to 20 files per batch</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid rgba(186, 60, 60, 0.25)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files Staging List with prominent CTA */}
      {selectedFiles.length > 0 && !uploadResults && (
        <div className="saas-card" style={{ border: '2px solid var(--primary)', background: 'linear-gradient(135deg, rgba(234, 246, 255, 0.92) 0%, rgba(243, 232, 255, 0.85) 100%)', boxShadow: '0 6px 24px rgba(2, 132, 199, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
                {selectedFiles.length} Resume{selectedFiles.length > 1 ? 's' : ''} Staged for Screening
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0 0' }}>
                Ready to analyze! Click the button below to extract text and compute match scores against <strong>{activeJob?.title}</strong>.
              </p>
            </div>
            <button onClick={clearFiles} className="btn btn-outline btn-sm">
              Clear All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>{file.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {(file.size / 1024).toFixed(1)} KB • PDF Document
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(idx)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleUploadAndAnalyze}
              disabled={isUploading}
              className="btn btn-ai btn-lg"
              style={{ width: '100%', maxWidth: '320px', padding: '14px 20px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              {isUploading ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  Analyzing & Screening Candidates...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Start Screening ({selectedFiles.length} Resume{selectedFiles.length > 1 ? 's' : ''})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Live Upload & Screening Results Table */}
      {uploadResults && (
        <div className="saas-card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Screening Batch Results
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Processed {uploadResults.length} files against "{activeJob?.title}"
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={clearFiles} className="btn btn-secondary btn-sm">
                Screen More Resumes
              </button>
              <button onClick={() => onNavigateCandidates()} className="btn btn-primary btn-sm">
                View in Candidate Table <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>File Name</th>
                  <th>Candidate Detected</th>
                  <th>Similarity Score</th>
                  <th>Required Skill Match</th>
                  <th>Details / Error Message</th>
                </tr>
              </thead>
              <tbody>
                {uploadResults.map((res, idx) => (
                  <tr key={idx}>
                    <td>
                      {res.success ? (
                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle size={16} /> Screened
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <AlertCircle size={16} /> Failed
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-bright)' }}>{res.filename}</td>
                    <td>
                      {res.candidate ? (
                        <div>
                          <div className="candidate-name" style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{res.candidate.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{res.candidate.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {res.candidate ? (
                        <span
                          className={`badge metric-val ${
                            res.candidate.similarity_score >= 70
                              ? 'badge-strong'
                              : res.candidate.similarity_score >= 40
                              ? 'badge-moderate'
                              : 'badge-lower'
                          }`}
                        >
                          {res.candidate.similarity_score.toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {res.candidate ? (
                        <span className="metric-val" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {res.candidate.required_skills_matched.length} of{' '}
                          {res.candidate.required_skills_matched.length + res.candidate.required_skills_missing.length}{' '}
                          ({res.candidate.required_skill_coverage.toFixed(0)}%)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {res.success && res.candidate ? (
                        <button
                          onClick={() => onSelectCandidate(res.candidate!.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px' }}
                        >
                          View Breakdown
                        </button>
                      ) : (
                        <div style={{ color: 'var(--danger)', fontSize: '0.75rem', maxWidth: '320px', lineHeight: 1.4 }}>
                          {res.error}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Saved Screening Sessions & Criteria Snapshots */}
      <div className="saas-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOpen size={18} color="var(--primary)" />
              Screening Sessions & Preserved Criteria Snapshots
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Reopen previous screening rounds with the exact matching criteria and job description preserved.
            </p>
          </div>
          <span className="badge badge-neutral">
            {sessions.length} Saved Sessions
          </span>
        </div>

        {sessions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="saas-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Session Name</th>
                  <th>Job Benchmark</th>
                  <th>Candidates Screened</th>
                  <th>Avg Match Score</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => (
                  <tr key={sess.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{sess.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ID: {sess.id}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {sess.job_title}
                    </td>
                    <td>
                      <span className="badge badge-accent">
                        {sess.candidate_count} candidates
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: sess.avg_score >= 70 ? 'var(--primary)' : sess.avg_score >= 40 ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                        {sess.avg_score > 0 ? `${sess.avg_score.toFixed(1)}%` : '—'}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      {new Date(sess.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigateCandidates(sess.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                        title="Reopen session in candidates view"
                      >
                        <ExternalLink size={13} /> Reopen Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
            No previous screening sessions created yet. New sessions are saved automatically upon screening.
          </div>
        )}
      </div>
    </div>
  );
};
