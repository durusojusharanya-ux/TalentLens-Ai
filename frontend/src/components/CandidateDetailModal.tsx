import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  GraduationCap,
  Save,
  CheckCircle2,
  UserCheck,
  Star,
  Sparkles,
  Download,
  Activity,
  Award,
} from 'lucide-react';
import { Candidate, CandidateStage, InterviewNotes } from '../types';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onToggleShortlist: (id: string, currentStatus: boolean) => void;
  onUpdateStage?: (id: string, stage: CandidateStage) => void;
  onUpdateInterview?: (id: string, interviewData: Partial<InterviewNotes>) => Promise<void>;
  onDelete: (id: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onToggleShortlist,
  onUpdateStage,
  onUpdateInterview,
  onDelete,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Interview Workspace state
  const [scheduledDate, setScheduledDate] = useState('');
  const [interviewStatus, setInterviewStatus] = useState('Pending');
  const [interviewer, setInterviewer] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [isSavingInterview, setIsSavingInterview] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (candidate) {
      const inv = candidate.interview_notes || {};
      setScheduledDate(inv.scheduled_date || '');
      setInterviewStatus(inv.status || 'Pending');
      setInterviewer(inv.interviewer || '');
      setRating(inv.rating || 0);
      setNotes(inv.notes || '');
      setFeedback(inv.feedback || '');
      setNextSteps(inv.next_steps || '');
      setSaveSuccessMessage(null);
    }
  }, [candidate]);

  if (!candidate) return null;

  const downloadMatchReport = () => {
    const totalRequired = candidate.required_skills_matched.length + candidate.required_skills_missing.length;
    const tier = candidate.similarity_score >= 70 ? 'Grade A — Strong Alignment' : candidate.similarity_score >= 40 ? 'Grade B — Moderate Alignment' : 'Grade C — Needs Review';

    const reportContent = `# TalentLens AI — Candidate Match Report
Generated: ${new Date().toLocaleString()}
Candidate ID: ${candidate.id}
Job Benchmark: ${candidate.job_title}

---

## 1. Candidate Overview
- **Name:** ${candidate.name}
- **Email:** ${candidate.email}
- **Phone:** ${candidate.phone || 'Not detected'}
- **Current Pipeline Stage:** ${candidate.stage || 'New'}
- **Shortlist Status:** ${candidate.shortlist_status ? 'Shortlisted' : 'Under Review'}
- **Original Document:** ${candidate.original_filename}
- **Estimated Education:** ${candidate.estimated_education || 'Not detected in extracted text'}
- **Estimated Experience:** ${candidate.estimated_experience || 'Not detected'}

---

## 2. Explainable Scoring Breakdown
- **Empirical Match Similarity:** ${candidate.similarity_score.toFixed(1)}%
  *Calculated via n-gram TF-IDF cosine vector alignment between the job description and candidate resume text.*
- **Mandatory Role Competencies Matched:** ${candidate.required_skills_matched.length} of ${totalRequired} (${candidate.required_skill_coverage.toFixed(0)}%)
- **Alignment Grade & Tier:** ${tier}

---

## 3. Matched Skills & Verbatim Resume Evidence
${candidate.required_skills_matched.length > 0 ? candidate.required_skills_matched.map(s => `- **${s}** [Verified Text Match]\n  > "${candidate.evidence_snippets?.[s] || 'Referenced in candidate resume profile.'}"`).join('\n\n') : '*No required skills detected in extracted resume text.*'}

${candidate.preferred_skills_matched && candidate.preferred_skills_matched.length > 0 ? `\n### Preferred / Bonus Competencies Matched\n` + candidate.preferred_skills_matched.map(s => `- **${s}**`).join('\n') : ''}

---

## 4. Missing Required Skills
${candidate.required_skills_missing.length > 0 ? candidate.required_skills_missing.map(s => `- **${s}** (Not detected in extracted text; candidate may have alternative project context or terminology)`).join('\n') : '*All required skills detected in resume.*'}

---

## 5. Recruiter Interview Assessment
- **Interview Status:** ${interviewStatus}
- **Scheduled Date:** ${scheduledDate ? new Date(scheduledDate).toLocaleString() : 'Not scheduled'}
- **Lead Evaluator:** ${interviewer || 'Unassigned'}
- **Rating:** ${rating > 0 ? `${rating}/5 stars` : 'Not yet rated'}
- **Technical Discussion Points:** ${notes || 'None recorded'}
- **Evaluator Feedback:** ${feedback || 'None recorded'}
- **Recommended Next Steps:** ${nextSteps || 'None recorded'}

---

## 6. AI Match Analysis Summary
${candidate.explanation || 'No detailed analysis summary available.'}

---

## 7. Decision-Support & Compliance Notice
TalentLens AI candidate scores and rankings represent decision-support signals based on empirical text similarity and boundary-safe skill matching. They are NOT autonomous hiring verdicts, nor probabilities of job success. Protected demographic characteristics (gender, race, age, religion) are never parsed or scored.
`;

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TalentLens_Match_Report_${candidate.name.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const score = candidate.similarity_score;
  const scoreClass = score >= 70 ? 'badge-strong' : score >= 40 ? 'badge-moderate' : 'badge-lower';
  const scoreLabel = score >= 70 ? 'Strong Text Match' : score >= 40 ? 'Moderate Text Match' : 'Lower Text Match';

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate || !onUpdateInterview) return;
    setIsSavingInterview(true);
    setSaveSuccessMessage(null);
    try {
      await onUpdateInterview(candidate.id, {
        scheduled_date: scheduledDate,
        status: interviewStatus,
        interviewer: interviewer,
        rating: rating,
        notes: notes,
        feedback: feedback,
        next_steps: nextSteps,
      });
      setSaveSuccessMessage('Evaluation notes saved to candidate record.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Failed to save interview notes: ${err.message}`);
    } finally {
      setIsSavingInterview(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '880px' }}
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
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
              }}
            >
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0 }}>
                  {candidate.name}
                </h2>
                {candidate.is_demo && <span className="badge badge-demo">Demo Data</span>}
                <span className={`badge ${scoreClass}`}>{scoreLabel}</span>

                {/* Stage Selector */}
                {onUpdateStage && (
                  <select
                    value={candidate.stage || (candidate.shortlist_status ? 'Shortlisted' : 'New')}
                    onChange={(e) => onUpdateStage(candidate.id, e.target.value as CandidateStage)}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-bright)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Promote or reclassify pipeline stage"
                  >
                    <option value="New" style={{ background: 'var(--bg-card)' }}>Stage: New</option>
                    <option value="Reviewed" style={{ background: 'var(--bg-card)' }}>Stage: Reviewed</option>
                    <option value="Shortlisted" style={{ background: 'var(--bg-card)' }}>Stage: Shortlisted</option>
                    <option value="Interview" style={{ background: 'var(--bg-card)' }}>Stage: Interview</option>
                    <option value="Selected" style={{ background: 'var(--bg-card)' }}>Stage: Selected</option>
                    <option value="Rejected" style={{ background: 'var(--bg-card)' }}>Stage: Rejected</option>
                  </select>
                )}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={downloadMatchReport}
              className="btn btn-secondary btn-sm"
              title="Download Complete Explainable Match Report (.md)"
            >
              <Download size={14} /> Download Match Report
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

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Statutory ML Disclaimer */}
          <div className="disclaimer-banner">
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
            <div>
              <strong>Resume–job text similarity estimate notice:</strong> Scores are decision-support signals based on TF-IDF text similarity and skill matching. They are not hiring probabilities and should not be used as the sole basis for employment decisions.
            </div>
          </div>

          {/* Warnings Alert if any */}
          {candidate.warnings && candidate.warnings.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--badge-mod-bg)',
                border: '1px solid var(--badge-mod-border)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>
                  Extraction & Analysis Warnings
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--badge-mod-text)' }}>
                  {candidate.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Contact & Detection Details Card */}
          <div className="saas-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Estimated Education</div>
                <div style={{ fontSize: '0.875rem', color: !candidate.estimated_education || candidate.estimated_education === 'Not detected in extracted text' ? 'var(--text-dim)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }} title={candidate.estimated_education}>
                  <GraduationCap size={14} color="var(--primary)" /> {candidate.estimated_education || 'Not detected in extracted text'}
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
            {/* Match Similarity Score */}
            <div className="saas-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Cosine Match Similarity
                </span>
                <span
                  className="metric-val"
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--ai-purple)' : 'var(--warning)',
                  }}
                >
                  {score.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, score))}%`,
                    background: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--ai-purple)' : 'var(--warning)',
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
                <span className="metric-val" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {candidate.required_skill_coverage.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, candidate.required_skill_coverage))}%`,
                    background: 'var(--primary)',
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

          {/* Explainable Scoring Breakdown Matrix */}
          <div className="saas-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="var(--primary)" /> Explainable Scoring Breakdown & Metrics
              </h4>
              <span className={`badge ${score >= 70 ? 'badge-strong' : score >= 40 ? 'badge-moderate' : 'badge-lower'}`}>
                {score >= 70 ? 'Grade A — Strong Alignment' : score >= 40 ? 'Grade B — Moderate Alignment' : 'Grade C — Needs Review'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Vector Overlap</div>
                <div className="metric-val" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0 2px' }}>
                  {score.toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cosine n-gram text overlap</div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Mandatory Coverage</div>
                <div className="metric-val" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', margin: '4px 0 2px' }}>
                  {candidate.required_skill_coverage.toFixed(0)}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{candidate.required_skills_matched.length} of {candidate.required_skills_matched.length + candidate.required_skills_missing.length} role requirements</div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Preferred Competencies</div>
                <div className="metric-val" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ai-purple)', margin: '4px 0 2px' }}>
                  {candidate.preferred_skills_matched?.length || 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bonus technical skills identified</div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, padding: '10px 12px', borderRadius: '6px', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)' }}>
              <strong>Explainability Note:</strong> Vector overlap reflects general vocabulary alignment with the job description. Mandatory coverage verifies specific role competencies. Scores represent decision-support signals and are never treated as automated hiring guarantees.
            </div>
          </div>

          {/* Explainable AI Summary */}
          <div className="ai-card" style={{ padding: '20px' }}>
            <h4 className="heading-display" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ai-purple)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--ai-purple)" /> <span className="gradient-text-ai">AI Match Analysis Summary</span>
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
              {candidate.explanation || 'No detailed analysis summary available.'}
            </p>
          </div>

          {/* Detailed Skill Alignment & Evidence Snippets */}
          <div className="saas-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-bright)', margin: 0 }}>
                  Skill Alignment & Text Evidence
                </h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Citations extracted verbatim from candidate resume text. Never hallucinated or assumed.
                </div>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                Direct Text Verification
              </span>
            </div>

            {/* Matched Required Skills with Evidence Snippets */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle size={14} /> Matched Required Skills ({candidate.required_skills_matched.length})
              </div>
              {candidate.required_skills_matched.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {candidate.required_skills_matched.map((skill, idx) => {
                    const snippet = candidate.evidence_snippets?.[skill] || `Referenced in candidate resume profile.`;
                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'var(--badge-strong-bg)',
                          border: '1px solid var(--badge-strong-border)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="skill-tag skill-tag-matched" style={{ fontWeight: 600 }}>
                            {skill}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', opacity: 0.85, fontWeight: 600 }}>
                            Verified Text Match
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                          "{snippet}"
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  No required skills detected in extracted resume text.
                </div>
              )}
            </div>

            {/* Missing Required Skills with Explicit 'Not Detected' distinction */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <XCircle size={14} /> Missing Required Skills ({candidate.required_skills_missing.length})
              </div>
              {candidate.required_skills_missing.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {candidate.required_skills_missing.map((skill, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--danger-bg)',
                        border: '1px solid rgba(186, 60, 60, 0.25)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <span className="skill-tag skill-tag-missing">
                        {skill}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                        Not detected in extracted text (candidate may have unlisted projects or alternative phrasing)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>
                  ✓ All required skills detected in resume.
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            {candidate.preferred_skills_matched && candidate.preferred_skills_matched.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
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

          {/* Transparent Methodology & Limitations Notice */}
          <div
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} /> Methodology & Screening Limitations
            </div>
            TalentLens AI computes TF-IDF n-gram vectorization and cosine similarity between the job description and selectable resume text. Skills are identified via boundary-safe token matching with alias resolution. A missing skill indicates absence from the extracted text, not necessarily candidate inability. Protected characteristics (gender, race, age) are never parsed or scored.
          </div>

          {/* Human Recruiter Interview Workspace */}
          <div
            className="saas-card"
            style={{
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-app)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="var(--accent-secondary)" /> Human Recruiter Interview Workspace
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Evaluations and interview notes are maintained independently from algorithmic match scores.
                </p>
              </div>

              {saveSuccessMessage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> {saveSuccessMessage}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveInterview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Interview Status
                  </label>
                  <select
                    value={interviewStatus}
                    onChange={(e) => setInterviewStatus(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <option value="Pending">Pending Scheduling</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Lead Interviewer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior ML Engineer / Hiring Manager"
                    value={interviewer}
                    onChange={(e) => setInterviewer(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Overall Rating (1 - 5)
                  </label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: '38px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: star <= rating ? '#F59E0B' : 'var(--text-dim)',
                          transition: 'transform 0.15s ease',
                        }}
                        title={`Rate ${star} / 5`}
                      >
                        <Star size={20} fill={star <= rating ? '#F59E0B' : 'transparent'} />
                      </button>
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '6px' }}>
                      {rating > 0 ? `${rating}/5 stars` : 'Not rated'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Interview Discussion Points & Technical Assessment
                </label>
                <textarea
                  rows={3}
                  placeholder="Record candidate problem solving depth, technical coding questions, architectural reasoning..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.8rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Evaluator Feedback & Qualitative Verdict
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key strengths observed, domain experience gaps, culture alignment..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.8rem', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Recommended Next Steps
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule Panel / Offer Stage / Archive"
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={isSavingInterview}
                  className="btn btn-primary btn-sm"
                >
                  <Save size={14} /> {isSavingInterview ? 'Saving...' : 'Save Interview Evaluation'}
                </button>
              </div>
            </form>
          </div>

          {/* Candidate Activity Timeline */}
          <div className="saas-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--primary)" /> Candidate Activity & Screening Timeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '4px' }} />
                  <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
                </div>
                <div style={{ paddingBottom: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>Resume Ingested & Evaluated</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {new Date(candidate.created_at).toLocaleString()} • Extracted {candidate.extracted_text ? candidate.extracted_text.split(/\s+/).length : 0} words from {candidate.original_filename}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--ai-purple)', marginTop: '4px' }} />
                  <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
                </div>
                <div style={{ paddingBottom: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>AI Match Analysis Completed</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    Empirical similarity: <span className="metric-val" style={{ fontWeight: 600, color: 'var(--primary)' }}>{candidate.similarity_score.toFixed(1)}%</span> • {candidate.required_skills_matched.length} mandatory competencies verified
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: candidate.stage === 'Selected' ? 'var(--success)' : candidate.stage === 'Rejected' ? 'var(--danger)' : 'var(--accent-secondary)', marginTop: '4px' }} />
                  <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
                </div>
                <div style={{ paddingBottom: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>Pipeline Stage: {candidate.stage || 'New'}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    Current status in recruitment funnel ({candidate.shortlist_status ? 'Marked Shortlisted' : 'Under Review'})
                  </div>
                </div>
              </div>

              {candidate.interview_notes?.scheduled_date && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--warning)', marginTop: '4px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>Interview: {candidate.interview_notes.status}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      Scheduled for {new Date(candidate.interview_notes.scheduled_date).toLocaleString()} • Lead: {candidate.interview_notes.interviewer || 'Assigned evaluator'}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                  color: 'var(--text-muted)',
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
            className={`btn btn-sm ${candidate.shortlist_status ? 'btn-secondary' : 'btn-primary'}`}
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
