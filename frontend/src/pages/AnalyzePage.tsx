import React, { useState, useRef } from 'react';
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
  Info
} from 'lucide-react';
import { Job, UploadResultItem, Candidate } from '../types';
import { api } from '../services/api';

interface AnalyzePageProps {
  jobs: Job[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  onCandidateAnalyzed: (candidate: Candidate) => void;
  onNavigateCandidates: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

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
      const response = await api.uploadResumes(activeJob.id, selectedFiles);
      setUploadResults(response.results);

      // Notify parent for each successfully created candidate
      response.results.forEach((item) => {
        if (item.success && item.candidate) {
          onCandidateAnalyzed(item.candidate);
        }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and analyze resumes.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Target Job Benchmark Card */}
      <div className="saas-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Job Benchmark
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '4px 0 0' }}>
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
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '12px', lineHeight: 1.5 }}>
              {activeJob.description.slice(0, 180)}...
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>Required Skills:</span>
              {activeJob.required_skills.map((s, idx) => (
                <span key={idx} className="skill-tag skill-tag-matched">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Box */}
      <div
        className="saas-card"
        style={{
          border: isDragging ? '2px dashed #6366F1' : '2px dashed var(--border-strong)',
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          padding: '40px 24px',
          cursor: 'pointer',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.2)',
          }}
        >
          <Upload size={28} color="#818CF8" />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
          Drag & Drop PDF Resumes Here
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          or <span style={{ color: '#38BDF8', textDecoration: 'underline' }}>browse your local disk</span>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <span>• PDF format only</span>
          <span>• Max 5 MB per file</span>
          <span>• Up to 20 files per batch</span>
          <span>• 100% Local Processing</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
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

      {/* Selected Files Staging List */}
      {selectedFiles.length > 0 && !uploadResults && (
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
              Selected Files ({selectedFiles.length})
            </h3>
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
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#FFFFFF' }}>{file.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(idx)}
                  style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', padding: '4px' }}
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
              className="btn btn-primary btn-lg"
              style={{ width: '100%', maxWidth: '280px' }}
            >
              {isUploading ? (
                <>
                  <Sparkles size={18} className="animate-spin" />
                  Running Local ML Pipeline...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Screen {selectedFiles.length} Resumes
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
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
              <button onClick={onNavigateCandidates} className="btn btn-primary btn-sm">
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
                        <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle size={16} /> Screened
                        </span>
                      ) : (
                        <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <AlertCircle size={16} /> Failed
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500, color: '#FFFFFF' }}>{res.filename}</td>
                    <td>
                      {res.candidate ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{res.candidate.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{res.candidate.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {res.candidate ? (
                        <span
                          className={`badge ${
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
                        <span style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600 }}>
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
                        <div style={{ color: '#F87171', fontSize: '0.75rem', maxWidth: '320px', lineHeight: 1.4 }}>
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
    </div>
  );
};
