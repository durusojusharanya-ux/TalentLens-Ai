import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookmarkCheck,
  BookmarkPlus,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert
} from 'lucide-react';
import { Candidate } from '../types';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onToggleShortlist: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onToggleShortlist,
  onDelete,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!candidate) return null;

  const score = candidate.similarity_score;
  const scoreClass = score >= 70 ? 'badge-strong' : score >= 40 ? 'badge-moderate' : 'badge-lower';
  const scoreLabel = score >= 70 ? 'Strong Text Match' : score >= 40 ? 'Moderate Text Match' : 'Lower Text Match';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '840px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#FFFFFF',
              }}
            >
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {candidate.name}
                </h2>
                {candidate.is_demo && <span className="badge badge-demo">Demo Data</span>}
                <span className={`badge ${scoreClass}`}>{scoreLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={13} /> {candidate.job_title}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> Screened: {new Date(candidate.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Statutory ML Disclaimer */}
          <div className="disclaimer-banner">
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#818CF8' }} />
            <div>
              <strong>Resume–job text similarity estimate notice:</strong> Scores are decision-support signals based on TF-IDF text similarity and skill matching. They are not hiring probabilities and should not be used as the sole basis for employment decisions.
            </div>
          </div>

          {/* Warnings Alert if any */}
          {candidate.warnings && candidate.warnings.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FBBF24', marginBottom: '4px' }}>
                  Extraction & Analysis Warnings
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#FDE68A' }}>
                  {candidate.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Contact & Detection Details Card */}
          <div className="saas-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontSize: '0.875rem', color: candidate.email === 'Not detected' ? 'var(--text-dim)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="var(--primary)" /> {candidate.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Phone Number</div>
                <div style={{ fontSize: '0.875rem', color: !candidate.phone || candidate.phone === 'Not detected' ? 'var(--text-dim)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="var(--primary)" /> {candidate.phone || 'Not detected'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Estimated Experience</div>
                <div style={{ fontSize: '0.875rem', color: candidate.estimated_experience === 'Not detected' ? 'var(--text-dim)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="var(--primary)" /> {candidate.estimated_experience || 'Not detected'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Original Document</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={candidate.original_filename}>
                  {candidate.original_filename}
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Score Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* TF-IDF Cosine Similarity Score */}
            <div className="saas-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  TF-IDF Cosine Similarity
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: score >= 70 ? '#34D399' : score >= 40 ? '#818CF8' : '#94A3B8' }}>
                  {score.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, score))}%`,
                    background: score >= 70 ? 'linear-gradient(90deg, #10B981, #34D399)' : score >= 40 ? 'linear-gradient(90deg, #6366F1, #818CF8)' : '#64748B',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                Numerical vector alignment between job description text and extracted resume terms.
              </div>
            </div>

            {/* Required Skill Coverage */}
            <div className="saas-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Required Skill Coverage
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8' }}>
                  {candidate.required_skill_coverage.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, candidate.required_skill_coverage))}%`,
                    background: 'linear-gradient(90deg, #0284C7, #38BDF8)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                {candidate.required_skills_matched.length} of {candidate.required_skills_matched.length + candidate.required_skills_missing.length} mandatory role skills identified.
              </div>
            </div>
          </div>

          {/* Explainable Summary */}
          <div className="saas-card" style={{ backgroundColor: 'var(--bg-card-subtle)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={15} color="var(--primary)" /> Machine Learning Analysis Summary
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.6, margin: 0 }}>
              {candidate.explanation || 'No detailed analysis summary available.'}
            </p>
          </div>

          {/* Detailed Skill Breakdown Pills */}
          <div className="saas-card">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
              Skill Alignment Breakdown
            </h4>

            {/* Matched Required Skills */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <CheckCircle size={14} /> Matched Required Skills ({candidate.required_skills_matched.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {candidate.required_skills_matched.length > 0 ? (
                  candidate.required_skills_matched.map((s, idx) => (
                    <span key={idx} className="skill-tag skill-tag-matched">
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>None matched</span>
                )}
              </div>
            </div>

            {/* Missing Required Skills */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <XCircle size={14} /> Missing Required Skills ({candidate.required_skills_missing.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {candidate.required_skills_missing.length > 0 ? (
                  candidate.required_skills_missing.map((s, idx) => (
                    <span key={idx} className="skill-tag skill-tag-missing">
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#34D399' }}>All required skills present!</span>
                )}
              </div>
            </div>

            {/* Preferred Skills */}
            {candidate.preferred_skills_matched && candidate.preferred_skills_matched.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <CheckCircle size={14} /> Matched Preferred Skills ({candidate.preferred_skills_matched.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {candidate.preferred_skills_matched.map((s, idx) => (
                    <span key={idx} className="skill-tag skill-tag-pref">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Extracted Text Accordion */}
          <div className="saas-card" style={{ padding: '16px' }}>
            <button
              onClick={() => setShowFullText(!showFullText)}
              style={{
                background: 'transparent',
                border: 'none',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--primary)" />
                Extracted Resume Text ({candidate.extracted_text ? candidate.extracted_text.split(/\s+/).length : 0} words)
              </span>
              {showFullText ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showFullText && (
              <div
                style={{
                  marginTop: '14px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '14px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  lineHeight: 1.6,
                  color: '#94A3B8',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {candidate.extracted_text || 'No text content available.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete candidate "${candidate.name}"? This removes their record and stored PDF file.`)) {
                onDelete(candidate.id);
                onClose();
              }
            }}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={15} /> Delete Candidate
          </button>

          <button
            onClick={() => onToggleShortlist(candidate.id, candidate.shortlist_status)}
            className={`btn btn-sm ${candidate.shortlist_status ? 'btn-secondary' : 'btn-success'}`}
          >
            {candidate.shortlist_status ? (
              <>
                <BookmarkCheck size={15} /> Remove from Shortlist
              </>
            ) : (
              <>
                <BookmarkPlus size={15} /> Add to Shortlist
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
