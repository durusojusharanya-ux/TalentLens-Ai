import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  BookmarkCheck,
  BookmarkPlus,
  Trash2,
  Eye,
  Info,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Briefcase,
  Scale,
  Sparkles,
  FolderOpen,
  CheckSquare,
  Square,
  HelpCircle,
  Upload,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Candidate, Job, ScreeningSession, CandidateStage } from '../types';
import { PipelineStageBar } from '../components/PipelineStageBar';

interface CandidatesPageProps {
  candidates: Candidate[];
  jobs: Job[];
  selectedJobId: string;
  selectedSessionId?: string;
  sessions?: ScreeningSession[];
  onSelectCandidate: (candidateId: string) => void;
  onToggleShortlist: (id: string, currentStatus: boolean) => void;
  onBulkShortlist?: (ids: string[], currentStatus: boolean) => void;
  onUpdateStage?: (id: string, stage: CandidateStage) => void;
  onBulkUpdateStage?: (ids: string[], stage: CandidateStage) => void;
  onCompareCandidates?: (ids: string[]) => void;
  onDeleteCandidate: (id: string) => void;
  onExportCsv: (shortlistOnly: boolean) => void;
  onNavigateUpload?: () => void;
}

export const CandidatesPage: React.FC<CandidatesPageProps> = ({
  candidates,
  jobs,
  selectedJobId,
  selectedSessionId = 'all',
  sessions = [],
  onSelectCandidate,
  onToggleShortlist,
  onBulkShortlist,
  onUpdateStage,
  onBulkUpdateStage,
  onCompareCandidates,
  onDeleteCandidate,
  onExportCsv,
  onNavigateUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState(selectedJobId || 'all');
  const [sessionFilter, setSessionFilter] = useState<string>(selectedSessionId);
  const [stageFilter, setStageFilter] = useState<CandidateStage | 'all'>('all');
  const [quickView, setQuickView] = useState<'all' | 'top_matches' | 'missing_mandatory' | 'shortlisted' | 'under_review'>('all');
  const [scoreTierFilter, setScoreTierFilter] = useState<'all' | 'strong' | 'moderate' | 'lower'>('all');
  const [dataSourceFilter, setDataSourceFilter] = useState<'all' | 'real' | 'demo'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date' | 'coverage'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const resetFilters = () => {
    setSearchTerm('');
    setJobFilter('all');
    setSessionFilter('all');
    setStageFilter('all');
    setQuickView('all');
    setScoreTierFilter('all');
    setDataSourceFilter('all');
    setSortBy('score');
    setSortOrder('desc');
  };

  // Calculate counts for quick-view tabs
  const counts = useMemo(() => {
    return {
      all: candidates.length,
      top_matches: candidates.filter((c) => c.similarity_score >= 70.0).length,
      missing_mandatory: candidates.filter((c) => c.required_skills_missing.length > 0).length,
      shortlisted: candidates.filter((c) => c.shortlist_status === true).length,
      under_review: candidates.filter((c) => c.shortlist_status === false).length,
    };
  }, [candidates]);

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

    // 3. Session filter
    if (sessionFilter !== 'all') {
      result = result.filter((c) => c.session_id === sessionFilter);
    }

    // 4. Recruitment Pipeline Stage filter
    if (stageFilter !== 'all') {
      result = result.filter((c) => {
        const cStage = (c.stage || (c.shortlist_status ? 'Shortlisted' : 'New'));
        return cStage === stageFilter;
      });
    }

    // 5. Quick View Tab
    if (quickView === 'top_matches') {
      result = result.filter((c) => c.similarity_score >= 70.0);
    } else if (quickView === 'missing_mandatory') {
      result = result.filter((c) => c.required_skills_missing.length > 0);
    } else if (quickView === 'shortlisted') {
      result = result.filter((c) => c.shortlist_status === true);
    } else if (quickView === 'under_review') {
      result = result.filter((c) => c.shortlist_status === false);
    }

    // 6. Score Tier dropdown filter
    if (scoreTierFilter === 'strong') {
      result = result.filter((c) => c.similarity_score >= 70.0);
    } else if (scoreTierFilter === 'moderate') {
      result = result.filter((c) => c.similarity_score >= 40.0 && c.similarity_score < 70.0);
    } else if (scoreTierFilter === 'lower') {
      result = result.filter((c) => c.similarity_score < 40.0);
    }

    // 7. Data Source filter (Real vs Demo)
    if (dataSourceFilter === 'real') {
      result = result.filter((c) => !c.is_demo);
    } else if (dataSourceFilter === 'demo') {
      result = result.filter((c) => !!c.is_demo);
    }

    // 8. Sort
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

    // 9. Dynamic Rank assignment
    return result.map((c, index) => ({
      ...c,
      dynamicRank: index + 1,
    }));
  }, [candidates, searchTerm, jobFilter, sessionFilter, stageFilter, quickView, scoreTierFilter, dataSourceFilter, sortBy, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (status: boolean) => {
    if (onBulkShortlist && selectedIds.length > 0) {
      onBulkShortlist(selectedIds, status);
      setSelectedIds([]);
    }
  };

  const handleCompareClick = () => {
    if (onCompareCandidates && selectedIds.length >= 2 && selectedIds.length <= 4) {
      onCompareCandidates(selectedIds);
    }
  };

  const canCompare = selectedIds.length >= 2 && selectedIds.length <= 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ML Decision-Support Notice */}
      <div className="disclaimer-banner">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
        <div>
          <strong>Resume–job text similarity estimate notice:</strong> Candidate rankings and scores represent decision-support signals based on TF-IDF cosine vector similarity and skill terminology matching. Scores are not hiring probabilities and do not represent protected demographic characteristics.
        </div>
      </div>

      {/* Visual Recruitment Funnel & Pipeline */}
      <PipelineStageBar
        candidates={candidates}
        activeStage={stageFilter}
        onSelectStage={setStageFilter}
      />

      {/* Quick-View Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {[
          { key: 'all', label: 'All Candidates', count: counts.all },
          { key: 'top_matches', label: 'Top Matches (≥70%)', count: counts.top_matches },
          { key: 'missing_mandatory', label: 'Missing Mandatory', count: counts.missing_mandatory },
          { key: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
          { key: 'under_review', label: 'Under Review', count: counts.under_review },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setQuickView(tab.key as any)}
            className={`btn btn-sm ${quickView === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.78rem' }}
          >
            {tab.label}
            <span
              style={{
                marginLeft: '6px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: quickView === tab.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Control Bar with soft cyan and teal accents */}
      <div
        className="saas-card"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(221, 251, 250, 0.65) 0%, rgba(240, 249, 255, 0.85) 100%)',
          border: '1px solid rgba(165, 243, 252, 0.85)',
          boxShadow: '0 4px 18px rgba(6, 182, 212, 0.05)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' }}>
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
              <option value="all">All Job Benchmarks</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Screening Session Filter */}
          {sessions.length > 0 && (
            <div>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Screening Sessions</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session: {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {/* Data Source Filter (Real vs Demo) */}
          <div>
            <select
              value={dataSourceFilter}
              onChange={(e) => setDataSourceFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Data Sources</option>
              <option value="real">Real Uploads Only</option>
              <option value="demo">Demo Data Only</option>
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

          {/* Action Buttons: Export CSV and Upload Resumes */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onExportCsv(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              title="Export filtered candidate directory to CSV"
            >
              <Download size={15} /> Export CSV
            </button>
            {onNavigateUpload && (
              <button
                onClick={onNavigateUpload}
                className="btn btn-primary"
                style={{ flex: 1, whiteSpace: 'nowrap' }}
                title="Navigate to resume upload and screening workspace"
              >
                <Upload size={15} /> Upload Resumes
              </button>
            )}
          </div>
        </div>

        {/* Results Counter and Active Filter Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(165, 243, 252, 0.6)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          <div>
            Showing <strong style={{ color: 'var(--text-bright)' }}>{filteredCandidates.length}</strong> of {candidates.length} candidates
            {dataSourceFilter !== 'all' && (
              <span className="badge badge-accent" style={{ marginLeft: '8px' }}>
                {dataSourceFilter === 'real' ? 'Real Uploads' : 'Demo Data'}
              </span>
            )}
          </div>
          {(searchTerm || jobFilter !== 'all' || stageFilter !== 'all' || scoreTierFilter !== 'all' || dataSourceFilter !== 'all' || quickView !== 'all') && (
            <button
              onClick={resetFilters}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} /> Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar when items selected */}
      {selectedIds.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            borderRadius: '10px',
            padding: '12px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
              {selectedIds.length} Selected
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Bulk Actions:
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleBulkAction(true)}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--primary)' }}
            >
              <BookmarkCheck size={14} /> Shortlist Selected
            </button>

            <button
              onClick={() => handleBulkAction(false)}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              <BookmarkPlus size={14} /> Mark Under Review
            </button>

            {onBulkUpdateStage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Move Stage:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onBulkUpdateStage(selectedIds, e.target.value as CandidateStage);
                      setSelectedIds([]);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="input-field"
                  style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto', height: '30px' }}
                >
                  <option value="" disabled>Select stage...</option>
                  <option value="New">New</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            )}

            <button
              onClick={handleCompareClick}
              disabled={!canCompare}
              className={`btn btn-sm ${canCompare ? 'btn-primary' : 'btn-secondary'}`}
              style={{ opacity: canCompare ? 1 : 0.5, cursor: canCompare ? 'pointer' : 'not-allowed' }}
              title={canCompare ? 'Compare selected candidates side-by-side' : 'Select 2 to 4 candidates to compare'}
            >
              <Scale size={14} /> Compare ({selectedIds.length}/4)
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Guided First-Time Workflow if no candidates at all */}
      {candidates.length === 0 ? (
        <div className="saas-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--primary)'
            }}
          >
            <Sparkles size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', margin: '0 0 8px' }}>
            Guided First-Time Screening Workflow
          </h3>
          <p style={{ maxWidth: '520px', margin: '0 auto 24px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            No candidates have been evaluated yet. Complete these quick steps to generate your first explainable screening pipeline:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              maxWidth: '780px',
              margin: '0 auto 24px',
              textAlign: 'left'
            }}
          >
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>STEP 1</div>
              <strong style={{ color: 'var(--text-bright)', display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Define Role Benchmark</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Select or create a target job profile with required and preferred technical skills.</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid #A5F3FC' }}>
              <div style={{ color: '#0891B2', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>STEP 2</div>
              <strong style={{ color: 'var(--text-bright)', display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Upload PDF Resumes</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Screen 1 to 20 resumes in a batch using high-speed AI vectorization.</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
              <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>STEP 3</div>
              <strong style={{ color: 'var(--text-bright)', display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Inspect Text Evidence</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Review verbatim citation snippets and compare top candidate profiles side-by-side.</span>
            </div>
          </div>

          {onNavigateUpload && (
            <button onClick={onNavigateUpload} className="btn btn-primary">
              <Upload size={16} /> Start Screening Resumes Now
            </button>
          )}
        </div>
      ) : (
        /* Candidate Table */
        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title="Select all filtered candidates"
                  >
                    {selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0 ? (
                      <CheckSquare size={16} color="var(--primary)" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Candidate</th>
                <th>Job Benchmark</th>
                <th>Match Score</th>
                <th>Skill Coverage</th>
                <th>Matched Skills</th>
                <th>Missing Skills</th>
                <th style={{ width: '135px' }}>Stage</th>
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
                  const isSelected = selectedIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      style={{
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : undefined,
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => toggleSelectCandidate(c.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isSelected ? 'var(--primary)' : 'var(--text-dim)' }}
                        >
                          {isSelected ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} />}
                        </button>
                      </td>

                      {/* Rank */}
                      <td style={{ fontWeight: 700, color: c.dynamicRank === 1 ? '#D97706' : c.dynamicRank === 2 ? '#7C3AED' : c.dynamicRank === 3 ? '#2563EB' : 'var(--text-muted)' }}>
                        #{c.dynamicRank}
                      </td>

                      {/* Candidate Identity */}
                      <td>
                        <div
                          onClick={() => onSelectCandidate(c.id)}
                          style={{ cursor: 'pointer' }}
                          title="Click to open full candidate dossier"
                        >
                          <div style={{ fontWeight: 600, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--border-subtle)' }}>
                              {c.name}
                            </span>
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
                          <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--primary)' }}>
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
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Complete</span>
                          )}
                        </div>
                      </td>

                      {/* Recruitment Pipeline Stage */}
                      <td>
                        <select
                          value={c.stage || (c.shortlist_status ? 'Shortlisted' : 'New')}
                          onChange={(e) => onUpdateStage && onUpdateStage(c.id, e.target.value as CandidateStage)}
                          style={{
                            backgroundColor:
                              (c.stage === 'Selected' ? 'var(--badge-strong-bg)' :
                               c.stage === 'Interview' ? 'var(--badge-mod-bg)' :
                               c.stage === 'Shortlisted' ? 'var(--badge-strong-bg)' :
                               c.stage === 'Reviewed' ? 'var(--primary-subtle)' :
                               c.stage === 'Rejected' ? 'var(--danger-bg)' :
                               'var(--bg-card-subtle)'),
                            color:
                              (c.stage === 'Selected' ? 'var(--deep-forest)' :
                               c.stage === 'Interview' ? 'var(--warning)' :
                               c.stage === 'Shortlisted' ? 'var(--primary)' :
                               c.stage === 'Reviewed' ? 'var(--accent-secondary)' :
                               c.stage === 'Rejected' ? 'var(--danger)' :
                               'var(--text-muted)'),
                            border: `1px solid ${
                              c.stage === 'Selected' ? 'var(--badge-strong-border)' :
                              c.stage === 'Interview' ? 'var(--badge-mod-border)' :
                              c.stage === 'Shortlisted' ? 'var(--badge-strong-border)' :
                              c.stage === 'Reviewed' ? 'var(--border-subtle)' :
                              c.stage === 'Rejected' ? 'rgba(186, 60, 60, 0.25)' :
                              'var(--border-subtle)'
                            }`,
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                          title="Change recruitment pipeline stage"
                        >
                          <option value="New" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>New</option>
                          <option value="Reviewed" style={{ background: 'var(--bg-card)', color: 'var(--accent-secondary)' }}>Reviewed</option>
                          <option value="Shortlisted" style={{ background: 'var(--bg-card)', color: 'var(--primary)' }}>Shortlisted</option>
                          <option value="Interview" style={{ background: 'var(--bg-card)', color: 'var(--warning)' }}>Interview</option>
                          <option value="Selected" style={{ background: 'var(--bg-card)', color: 'var(--deep-forest)' }}>Selected</option>
                          <option value="Rejected" style={{ background: 'var(--bg-card)', color: 'var(--danger)' }}>Rejected</option>
                        </select>
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
                            color: c.shortlist_status ? 'var(--primary)' : 'var(--text-dim)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                          }}
                          title={c.shortlist_status ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                          {c.shortlist_status ? (
                            <>
                              <BookmarkCheck size={17} color="var(--primary)" /> Shortlisted
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
                            title="View complete analysis, evidence snippets, and extracted text"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete candidate "${c.name}" and remove their uploaded file? This action is permanent.`)) {
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
                  <td colSpan={10} style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Filter size={20} />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.95rem' }}>No candidates match current filters</div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                        Try adjusting your search query, benchmark selection, match score tier, or recruitment stage.
                      </p>
                      <button onClick={resetFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                        <RefreshCw size={14} /> Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
