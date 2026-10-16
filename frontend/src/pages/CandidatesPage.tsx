import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  BookmarkCheck,
  BookmarkPlus,
  Trash2,
  Eye,
  Info,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Briefcase
} from 'lucide-react';
import { Candidate, Job } from '../types';

interface CandidatesPageProps {
  candidates: Candidate[];
  jobs: Job[];
  selectedJobId: string;
  onSelectCandidate: (candidateId: string) => void;
  onToggleShortlist: (id: string, currentStatus: boolean) => void;
  onDeleteCandidate: (id: string) => void;
  onExportCsv: (shortlistOnly: boolean) => void;
}

export const CandidatesPage: React.FC<CandidatesPageProps> = ({
  candidates,
  jobs,
  selectedJobId,
  onSelectCandidate,
  onToggleShortlist,
  onDeleteCandidate,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState(selectedJobId || 'all');
  const [scoreTierFilter, setScoreTierFilter] = useState<'all' | 'strong' | 'moderate' | 'lower'>('all');
  const [shortlistFilter, setShortlistFilter] = useState<'all' | 'shortlisted' | 'under_review'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date' | 'coverage'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered & Ranked list
  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    // 1. Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.job_title.toLowerCase().includes(q)
      );
    }

    // 2. Job filter
    if (jobFilter !== 'all') {
      result = result.filter((c) => c.job_id === jobFilter);
    }

    // 3. Shortlist filter
    if (shortlistFilter === 'shortlisted') {
      result = result.filter((c) => c.shortlist_status === true);
    } else if (shortlistFilter === 'under_review') {
      result = result.filter((c) => c.shortlist_status === false);
    }

    // 4. Score tier filter
    if (scoreTierFilter === 'strong') {
      result = result.filter((c) => c.similarity_score >= 70.0);
    } else if (scoreTierFilter === 'moderate') {
      result = result.filter((c) => c.similarity_score >= 40.0 && c.similarity_score < 70.0);
    } else if (scoreTierFilter === 'lower') {
      result = result.filter((c) => c.similarity_score < 40.0);
    }

    // 5. Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'score') {
        comparison = a.similarity_score - b.similarity_score;
        if (comparison === 0) {
          comparison = a.required_skill_coverage - b.required_skill_coverage;
        }
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'coverage') {
        comparison = a.required_skill_coverage - b.required_skill_coverage;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 6. Dynamic Rank assignment
    return result.map((c, index) => ({
      ...c,
      dynamicRank: index + 1,
    }));
  }, [candidates, searchTerm, jobFilter, scoreTierFilter, shortlistFilter, sortBy, sortOrder]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Disclaimer Banner */}
      <div className="disclaimer-banner">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#818CF8' }} />
        <div>
          <strong>Resume–job text similarity estimate:</strong> Candidate rankings and scores represent decision-support signals based on TF-IDF cosine text alignment and skill phrase matching. They are not hiring probabilities and should not be used as the sole basis for employment decisions.
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="saas-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, email, or role..."
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Job Filter */}
          <div>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Jobs & Benchmarks</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Score Tier Filter */}
          <div>
            <select
              value={scoreTierFilter}
              onChange={(e) => setScoreTierFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Match Levels</option>
              <option value="strong">Strong Match (≥ 70%)</option>
              <option value="moderate">Moderate Match (40% - 69%)</option>
              <option value="lower">Lower Match (&lt; 40%)</option>
            </select>
          </div>

          {/* Shortlist Filter */}
          <div>
            <select
              value={shortlistFilter}
              onChange={(e) => setShortlistFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              <option value="shortlisted">Shortlisted Only</option>
              <option value="under_review">Under Review Only</option>
            </select>
          </div>

          {/* Sort By & Order */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-field"
              style={{ flex: 1 }}
            >
              <option value="score">Sort by Match Score</option>
              <option value="coverage">Sort by Skill Coverage</option>
              <option value="name">Sort by Candidate Name</option>
              <option value="date">Sort by Screening Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
              title={`Toggle sort order (Currently ${sortOrder.toUpperCase()})`}
            >
              <ArrowUpDown size={15} />
            </button>
          </div>

          {/* Export CSV Button */}
          <div>
            <button
              onClick={() => onExportCsv(false)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Table */}
      <div className="table-container">
        <table className="saas-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Rank</th>
              <th>Candidate</th>
              <th>Job Benchmark</th>
              <th>Match Score</th>
              <th>Skill Coverage</th>
              <th>Matched Skills</th>
              <th>Missing Skills</th>
              <th>Shortlist</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((c) => {
                const score = c.similarity_score;
                const scoreBadgeClass = score >= 70 ? 'badge-strong' : score >= 40 ? 'badge-moderate' : 'badge-lower';
                const scoreTierText = score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Lower';

                return (
                  <tr key={c.id}>
                    {/* Rank */}
                    <td style={{ fontWeight: 700, color: c.dynamicRank <= 3 ? '#FBBF24' : 'var(--text-muted)' }}>
                      #{c.dynamicRank}
                    </td>

                    {/* Candidate Identity */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c.name}
                          {c.is_demo && <span className="badge badge-demo">Demo</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {c.email}
                        </div>
                      </div>
                    </td>

                    {/* Job Role */}
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {c.job_title}
                    </td>

                    {/* Similarity Score */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${scoreBadgeClass}`}>
                          {score.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {scoreTierText}
                        </span>
                      </div>
                    </td>

                    {/* Skill Coverage % */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#38BDF8' }}>
                          {c.required_skill_coverage.toFixed(0)}%
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          ({c.required_skills_matched.length}/{c.required_skills_matched.length + c.required_skills_missing.length})
                        </span>
                      </div>
                    </td>

                    {/* Matched Skills */}
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {c.required_skills_matched.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="skill-tag skill-tag-matched">
                            {s}
                          </span>
                        ))}
                        {c.required_skills_matched.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            +{c.required_skills_matched.length - 3}
                          </span>
                        )}
                        {c.required_skills_matched.length === 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>None</span>
                        )}
                      </div>
                    </td>

                    {/* Missing Skills */}
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {c.required_skills_missing.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="skill-tag skill-tag-missing">
                            {s}
                          </span>
                        ))}
                        {c.required_skills_missing.length > 2 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            +{c.required_skills_missing.length - 2}
                          </span>
                        )}
                        {c.required_skills_missing.length === 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#34D399' }}>Complete</span>
                        )}
                      </div>
                    </td>

                    {/* Shortlist Toggle */}
                    <td>
                      <button
                        onClick={() => onToggleShortlist(c.id, c.shortlist_status)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: c.shortlist_status ? '#10B981' : 'var(--text-dim)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                        title={c.shortlist_status ? 'Remove from shortlist' : 'Add to shortlist'}
                      >
                        {c.shortlist_status ? (
                          <>
                            <BookmarkCheck size={17} color="#10B981" /> Shortlisted
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={17} /> Review
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onSelectCandidate(c.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="View complete analysis and extracted text"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete candidate "${c.name}" and remove their uploaded file?`)) {
                              onDeleteCandidate(c.id);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Delete candidate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)' }}>
                  No candidates match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
