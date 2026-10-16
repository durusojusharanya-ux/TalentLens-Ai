import React from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  BookmarkCheck,
  BookmarkPlus,
  Scale,
  ShieldCheck,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { CandidateCompareResult } from '../types';

interface CandidateCompareModalProps {
  comparison: CandidateCompareResult | null;
  onClose: () => void;
  onToggleShortlist: (id: string, currentStatus: boolean) => void;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  comparison,
  onClose,
  onToggleShortlist,
}) => {
  if (!comparison || comparison.candidates.length < 2) return null;

  const { candidates, skill_matrix } = comparison;

  const exportComparisonCsv = () => {
    const metaHeaders = ['Candidate Name', 'Stage', 'Score', 'Coverage', 'Experience', 'Education'];
    const metaRows = candidates.map(c => [
      `"${c.name}"`,
      `"${c.stage || (c.shortlist_status ? 'Shortlisted' : 'New')}"`,
      `"${c.similarity_score.toFixed(1)}%"`,
      `"${c.required_skill_coverage.toFixed(0)}%"`,
      `"${c.estimated_experience || 'Not detected'}"`,
      `"${c.estimated_education || 'Not detected'}"`
    ].join(','));

    const headers = ['Skill', 'Category', ...candidates.map(c => `"${c.name} (${c.similarity_score.toFixed(1)}%)"`)];
    const rows = skill_matrix.map(row => {
      const cat = row.is_required ? 'Required' : 'Preferred';
      const candVals = candidates.map(c => {
        const entry = row.candidates[c.id];
        const status = entry?.matched ? 'MATCHED' : 'NOT DETECTED';
        const evidence = entry?.evidence ? ` - ${entry.evidence.replace(/"/g, '""')}` : '';
        return `"${status}${evidence}"`;
      });
      return [`"${row.skill}"`, cat, ...candVals].join(',');
    });

    const csvContent = [
      '# CANDIDATE PROFILE OVERVIEW',
      metaHeaders.join(','),
      ...metaRows,
      '',
      '# SKILL MATRIX & EVIDENCE BREAKDOWN',
      headers.join(','),
      ...rows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `talentlens_candidate_comparison_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        style={{ maxWidth: candidates.length >= 4 ? '1280px' : '1080px', width: '96vw', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #087EA4 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0 }}>
                  Side-by-Side Candidate Comparison
                </h2>
                <span className="badge badge-accent">
                  {candidates.length} Profiles
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Directly cross-reference match scores, skill coverage, and textual evidence.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={exportComparisonCsv}
              className="btn btn-secondary btn-sm"
              title="Export this side-by-side comparison matrix to CSV"
            >
              <Download size={14} /> Export CSV
            </button>
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
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowX: 'auto' }}>
          
          {/* Top Profile Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${candidates.length}, minmax(210px, 1fr))`,
              gap: '16px',
              minWidth: candidates.length >= 4 ? '920px' : candidates.length === 3 ? '720px' : '520px'
            }}
          >
            {candidates.map((c) => {
              const scoreClass = c.similarity_score >= 70 ? 'badge-strong' : c.similarity_score >= 40 ? 'badge-moderate' : 'badge-lower';
              return (
                <div key={c.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 className="candidate-name" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-bright)', margin: 0 }}>
                        {c.name}
                      </h3>
                      <div className="job-title" style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={12} /> {c.job_title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          Stage: {c.stage || (c.shortlist_status ? 'Shortlisted' : 'New')}
                        </span>
                        {c.interview_notes?.status && (
                          <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                            {c.interview_notes.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`badge metric-val ${scoreClass}`}>
                      {c.similarity_score.toFixed(1)}% Match
                    </span>
                  </div>

                  {/* Coverage, Exp & Education */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '6px', fontSize: '0.75rem' }}>
                    <div style={{ backgroundColor: 'var(--bg-app)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>Req. Coverage</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{c.required_skill_coverage.toFixed(0)}%</strong>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-app)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>Experience</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }} title={c.estimated_experience}>
                        <Clock size={11} color="var(--primary)" /> {c.estimated_experience || 'Not detected'}
                      </strong>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-app)', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>Education</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.estimated_education}>
                        <GraduationCap size={11} color="var(--primary)" /> {c.estimated_education || 'Not detected'}
                      </strong>
                    </div>
                  </div>

                  {/* Shortlist Toggle */}
                  <button
                    onClick={() => onToggleShortlist(c.id, c.shortlist_status)}
                    className={`btn btn-sm ${c.shortlist_status ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {c.shortlist_status ? (
                      <>
                        <BookmarkCheck size={14} /> Shortlisted
                      </>
                    ) : (
                      <>
                        <BookmarkPlus size={14} /> Add to Shortlist
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Skill Alignment Matrix */}
          <div className="saas-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-bright)', margin: 0 }}>
                Technical Skill & Evidence Alignment Matrix
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {skill_matrix.length} skills evaluated
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: candidates.length >= 4 ? '920px' : candidates.length === 3 ? '720px' : '520px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-app)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', width: candidates.length >= 4 ? '20%' : '25%' }}>
                      Target Skill
                    </th>
                    {candidates.map((c) => (
                      <th key={c.id} style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skill_matrix.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                      }}
                    >
                      {/* Skill Name */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                            {row.skill}
                          </span>
                        </div>
                        <span
                          className={`badge ${row.is_required ? 'badge-primary' : 'badge-neutral'}`}
                          style={{ fontSize: '0.68rem', padding: '1px 6px', marginTop: '4px' }}
                        >
                          {row.is_required ? 'Required' : 'Preferred'}
                        </span>
                      </td>

                      {/* Candidate Values */}
                      {candidates.map((c) => {
                        const entry = row.candidates[c.id];
                        const isMatched = entry?.matched;
                        const evidence = entry?.evidence;

                        return (
                          <td key={c.id} style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              {isMatched ? (
                                <>
                                  <CheckCircle size={15} color="var(--primary)" />
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                                    Matched
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle size={15} color="var(--text-dim)" />
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    Not detected
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Evidence Snippet */}
                            {isMatched && evidence && (
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                  fontStyle: 'italic',
                                  backgroundColor: 'var(--badge-strong-bg)',
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  borderLeft: '2px solid var(--primary)',
                                  marginTop: '4px'
                                }}
                              >
                                "{evidence}"
                              </div>
                            )}

                            {!isMatched && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '2px' }}>
                                Term not identified in extracted text.
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Decision Support Note */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Recruiter Guidance:</strong> Candidate comparison relies on verifiable resume terminology. Differences in phrasing may affect score parity. Always conduct structured interviews for finalist selection.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
