import React, { useState, useMemo } from 'react';
import {
  BookmarkCheck,
  Download,
  Search,
  Users,
  Award,
  Eye,
  Trash2,
  XCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Candidate } from '../types';

interface ShortlistPageProps {
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
  onToggleShortlist: (id: string, currentStatus: boolean) => void;
  onExportCsv: (shortlistOnly: boolean) => void;
}

export const ShortlistPage: React.FC<ShortlistPageProps> = ({
  candidates,
  onSelectCandidate,
  onToggleShortlist,
  onExportCsv,
}) => {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter only shortlisted
  const shortlistedCandidates = useMemo(() => {
    let list = candidates.filter((c) => c.shortlist_status === true);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.job_title.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.similarity_score - a.similarity_score
        : a.similarity_score - b.similarity_score;
    });
    return list;
  }, [candidates, search, sortOrder]);

  const avgShortlistScore = useMemo(() => {
    if (shortlistedCandidates.length === 0) return 0;
    const sum = shortlistedCandidates.reduce((acc, c) => acc + c.similarity_score, 0);
    return sum / shortlistedCandidates.length;
  }, [shortlistedCandidates]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Shortlist Metric Header Cards with Tints */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="saas-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #DDF7EA 0%, #DDFBFA 100%)', borderColor: '#A7F3D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>Shortlisted Talent</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookmarkCheck size={16} color="#059669" />
            </div>
          </div>
          <div className="metric-val" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            {shortlistedCandidates.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Selected for subsequent interview rounds
          </div>
        </div>

        <div className="saas-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #EAF6FF 0%, #DDF2FF 100%)', borderColor: '#BFDBFE' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#075985', fontWeight: 600 }}>Avg Shortlist Score</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#087EA4" />
            </div>
          </div>
          <div className="metric-val" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {avgShortlistScore.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Mean match similarity across shortlisted pool
          </div>
        </div>

        <div className="saas-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={() => onExportCsv(true)}
            className="btn btn-primary"
            style={{ width: '100%', height: '42px' }}
            disabled={shortlistedCandidates.length === 0}
          >
            <Download size={16} /> Export Shortlist to CSV
          </button>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="saas-card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(221, 251, 250, 0.65) 0%, rgba(240, 249, 255, 0.85) 100%)', border: '1px solid rgba(165, 243, 252, 0.85)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shortlisted candidates..."
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="btn btn-secondary btn-sm"
            >
              Order: {sortOrder === 'desc' ? 'Highest Score First' : 'Lowest Score First'}
            </button>
          </div>
        </div>
      </div>

      {/* Shortlist Table */}
      <div className="table-container">
        <table className="saas-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Target Role</th>
              <th>Match Score</th>
              <th>Skill Coverage</th>
              <th>Matched Skills</th>
              <th>Screening Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shortlistedCandidates.length > 0 ? (
              shortlistedCandidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div>
                      <div className="candidate-name" style={{ fontWeight: 600, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {c.name}
                        {c.is_demo && <span className="badge badge-demo">Demo</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.email}</div>
                    </div>
                  </td>
                  <td className="job-title" style={{ color: 'var(--text-muted)' }}>{c.job_title}</td>
                  <td>
                    <span
                      className={`badge metric-val ${
                        c.similarity_score >= 70
                          ? 'badge-strong'
                          : c.similarity_score >= 40
                          ? 'badge-moderate'
                          : 'badge-lower'
                      }`}
                    >
                      {c.similarity_score.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className="metric-val" style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.82rem' }}>
                      {c.required_skill_coverage.toFixed(0)}%
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c.required_skills_matched.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="skill-tag skill-tag-matched">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => onSelectCandidate(c.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="View complete candidate dossier"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onToggleShortlist(c.id, true)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', color: 'var(--danger)' }}
                        title="Remove from shortlist"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookmarkCheck size={24} color="var(--primary)" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-bright)' }}>
                      {search ? 'No Matching Shortlisted Candidates' : 'Your Shortlist Is Empty'}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
                      {search
                        ? `No shortlisted candidates match "${search}". Try clearing your query or checking spelling.`
                        : 'Review evaluated profiles in the candidate directory and click the bookmark action to curate your interview roster.'}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '6px' }}
                      >
                        Clear Search Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
