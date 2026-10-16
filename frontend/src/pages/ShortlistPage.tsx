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
      {/* Shortlist Metric Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="saas-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shortlisted Talent</span>
            <BookmarkCheck size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399' }}>
            {shortlistedCandidates.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Selected for subsequent interview rounds
          </div>
        </div>

        <div className="saas-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Shortlist Score</span>
            <TrendingUp size={18} color="#6366F1" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
            {avgShortlistScore.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Mean TF-IDF similarity across shortlisted pool
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
      <div className="saas-card" style={{ padding: '16px 20px' }}>
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
                      <div style={{ fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {c.name}
                        {c.is_demo && <span className="badge badge-demo">Demo</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.email}</div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.job_title}</td>
                  <td>
                    <span
                      className={`badge ${
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
                    <span style={{ fontWeight: 600, color: '#38BDF8', fontSize: '0.82rem' }}>
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
                        style={{ padding: '4px 8px', color: '#F87171' }}
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                  No candidates have been shortlisted yet. Review candidates in the directory to add them here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
