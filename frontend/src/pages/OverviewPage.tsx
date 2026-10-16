import React from 'react';
import {
  FileText,
  Users,
  BookmarkCheck,
  TrendingUp,
  Award,
  Briefcase,
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DashboardStats, Candidate, CandidateStage } from '../types';
import { PipelineStageBar } from '../components/PipelineStageBar';

interface OverviewPageProps {
  stats: DashboardStats | null;
  candidates: Candidate[];
  layout: 'command' | 'editorial' | 'spatial';
  onNavigate: (tab: string) => void;
  onSelectCandidate: (candidateId: string) => void;
  onToggleShortlist: (id: string, currentStatus: boolean) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  stats,
  candidates = [],
  layout,
  onNavigate,
  onSelectCandidate,
  onToggleShortlist,
}) => {
  const [activeStage, setActiveStage] = React.useState<CandidateStage | 'all'>('all');

  const kpis = [
    {
      title: 'Uploaded Resumes',
      value: stats?.total_resumes ?? 0,
      icon: FileText,
      sub: 'Resumes ingested',
      bg: 'linear-gradient(135deg, #EAF6FF 0%, #DDF2FF 100%)',
      borderColor: '#BFDBFE',
      iconColor: '#087EA4',
      iconBg: '#DBEAFE',
    },
    {
      title: 'Screened Candidates',
      value: stats?.analyzed_candidates ?? 0,
      icon: Users,
      sub: 'Vector alignment scored',
      bg: 'linear-gradient(135deg, #F2E8FF 0%, #EEE7FF 100%)',
      borderColor: '#DDD6FE',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
    },
    {
      title: 'Shortlisted Talent',
      value: stats?.shortlisted_candidates ?? 0,
      icon: BookmarkCheck,
      sub: 'Ready for review',
      bg: 'linear-gradient(135deg, #E6FBF7 0%, #DDFBFA 100%)',
      borderColor: '#A7F3D0',
      iconColor: '#059669',
      iconBg: '#D1FAE5',
    },
    {
      title: 'Average Match Score',
      value: `${(stats?.avg_match_score ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
      sub: 'Cosine similarity mean',
      bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      borderColor: '#FDE68A',
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
    },
    {
      title: 'Highest Match Score',
      value: `${(stats?.highest_match_score ?? 0).toFixed(1)}%`,
      icon: Award,
      sub: 'Top applicant score',
      bg: 'linear-gradient(135deg, #FFF0F6 0%, #FCE7F3 100%)',
      borderColor: '#FBCFE8',
      iconColor: '#DB2777',
      iconBg: '#FCE7F3',
    },
    {
      title: 'Saved Job Profiles',
      value: stats?.saved_jobs_count ?? 0,
      icon: Briefcase,
      sub: 'Role benchmarks',
      bg: 'linear-gradient(135deg, #DDFBFA 0%, #E0F2FE 100%)',
      borderColor: '#A5F3FC',
      iconColor: '#087EA4',
      iconBg: '#CFFAFE',
    },
  ];

  const distributionColors = ['#94A3B8', '#D97706', '#087EA4', '#8B5CF6', '#059669'];

  // =========================================================================
  // LAYOUT 1: COMMAND CENTER (Enterprise Dense Composition)
  // =========================================================================
  if (layout === 'command') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        {/* Layered Ambient Gradient Glow Orbs */}
        <div className="ambient-glow-orb cyan" style={{ width: '420px', height: '420px', top: '-60px', left: '-40px' }} />
        <div className="ambient-glow-orb purple" style={{ width: '440px', height: '440px', top: '100px', right: '-60px' }} />
        
        {/* Horizontal Dense KPI Strip with Subtle Individual Tints */}
        <div className="kpi-grid" style={{ position: 'relative', zIndex: 1 }}>
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="saas-card"
                style={{
                  padding: '16px',
                  background: kpi.bg,
                  borderColor: kpi.borderColor,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {kpi.title}
                  </span>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: kpi.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={14} color={kpi.iconColor} />
                  </div>
                </div>
                <div className="metric-val" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)', lineHeight: 1.1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Wide Candidate-Ranking Table in Command Center */}
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Command Center Candidate Ranking
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Live ranked queue derived from empirical vector similarity
              </p>
            </div>
            <button onClick={() => onNavigate('candidates')} className="btn btn-outline btn-sm">
              Full Directory <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-container">
            <table className="saas-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Rank</th>
                  <th>Candidate</th>
                  <th>Role Benchmark</th>
                  <th>Similarity Score</th>
                  <th>Skill Coverage</th>
                  <th>Matched Skills</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 5).map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: i === 0 ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                      #{i + 1}
                    </td>
                    <td>
                      <div className="candidate-name" style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.email}</div>
                    </td>
                    <td className="job-title" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.job_title}</td>
                    <td>
                      <span className={`badge metric-val ${c.similarity_score >= 70 ? 'badge-strong' : c.similarity_score >= 40 ? 'badge-moderate' : 'badge-lower'}`}>
                        {c.similarity_score.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className="metric-val" style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.82rem' }}>
                        {c.required_skill_coverage.toFixed(0)}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {c.required_skills_matched.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="skill-tag skill-tag-matched">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectCandidate(c.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                      >
                        <Eye size={13} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics and Recent Activity Beside Each Other */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          {/* Similarity Chart */}
          <div className="saas-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>
              Text Similarity Distribution
            </h3>
            <div style={{ height: '200px' }}>
              {stats && stats.score_distribution.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.score_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="range" stroke="var(--text-dim)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', color: 'var(--text-main)', borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stats.score_distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={distributionColors[index % distributionColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', paddingTop: '60px' }}>No distribution data yet.</div>
              )}
            </div>
          </div>

          {/* Pipeline Breakdown */}
          <div className="saas-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>
              Candidate Review Pipeline
            </h3>
            <div style={{ height: '200px' }}>
              {stats && stats.total_resumes > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={stats.status_breakdown} innerRadius={42} outerRadius={68} paddingAngle={4} dataKey="value">
                        <Cell fill="var(--success)" />
                        <Cell fill="var(--primary)" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', color: 'var(--text-main)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                      Shortlisted ({stats.shortlisted_candidates})
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      Under Review ({stats.total_resumes - stats.shortlisted_candidates})
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', paddingTop: '60px' }}>No candidate data yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LAYOUT 2: EDITORIAL WORKSPACE (Magazine-inspired, Asymmetric Grid, Timelines)
  // =========================================================================
  if (layout === 'editorial') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Editorial Masthead */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Executive Talent Intelligence
              </span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-bright)', lineHeight: 1.15, marginTop: '6px' }}>
                Candidate Cohort Evaluation
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onNavigate('analyze')} className="btn btn-primary">
                Screen Resumes
              </button>
              <button onClick={() => onNavigate('candidates')} className="btn btn-secondary">
                View All Candidates
              </button>
            </div>
          </div>
        </div>

        {/* Asymmetric Editorial KPI Arrangement */}
        <div className="kpi-grid">
          {/* Main Hero Metric */}
          <div className="saas-card" style={{ gridColumn: 'span 2' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Candidate Cohort Volume
            </span>
            <div className="kpi-metric-val" style={{ color: 'var(--text-bright)', margin: '12px 0 6px' }}>
              {stats?.total_resumes ?? 0} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', fontWeight: 400 }}>Applicants Ingested</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '520px' }}>
              Every resume is vectorized and scored with comprehensive phrase and competency frequency arrays.
            </p>
          </div>

          {/* Average Alignment */}
          <div className="saas-card">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mean Alignment
            </span>
            <div className="kpi-metric-val" style={{ color: 'var(--primary)', margin: '12px 0 6px' }}>
              {(stats?.avg_match_score ?? 0).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Cosine text similarity average across active benchmark</div>
          </div>
        </div>

        {/* Editorial Timeline & Skill Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
          {/* Activity Timeline */}
          <div className="saas-card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '20px' }}>
              Screening Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              {candidates.slice(0, 4).map((c, i) => (
                <div key={c.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid var(--bg-card)' }} />
                    {i < 3 && <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />}
                  </div>

                  <div style={{ paddingBottom: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="candidate-name" style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.95rem' }}>{c.name}</span>
                      <span className={`badge metric-val ${c.similarity_score >= 70 ? 'badge-strong' : c.similarity_score >= 40 ? 'badge-moderate' : 'badge-lower'}`}>
                        {c.similarity_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="job-title" style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {c.job_title} • {new Date(c.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {c.explanation ? c.explanation.slice(0, 110) + '...' : 'Analysis verified.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Skill Demands */}
          <div className="saas-card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '20px' }}>
              Dominant Competencies
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats?.top_matched_skills.map((item, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{item.skill}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.count} resumes</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Present in {((item.count / Math.max(1, stats.total_resumes)) * 100).toFixed(0)}% of candidate pool
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LAYOUT 3: SPATIAL DASHBOARD (3D Perspective, Staged Pipeline Kanban, Floating Panels)
  // =========================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Spatial Aperture Indicator */}
      <div
        className="saas-card"
        style={{
          padding: '32px',
          background: 'radial-gradient(ellipse at 85% 25%, rgba(6, 182, 212, 0.22) 0%, rgba(124, 58, 237, 0.16) 45%, transparent 75%), linear-gradient(135deg, rgba(234, 246, 255, 0.95) 0%, rgba(242, 232, 255, 0.9) 100%)',
          border: '1px solid rgba(147, 197, 253, 0.8)',
          boxShadow: '0 12px 36px rgba(37, 99, 235, 0.08), 0 0 24px rgba(6, 182, 212, 0.12)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ maxWidth: '600px' }}>
            <span className="badge badge-strong" style={{ marginBottom: '12px' }}>
              Spatial Telemetry Active
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '12px' }}>
              Candidate Intelligence Aperture
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Visualizing candidate cohorts across similarity brackets and shortlisted qualification stages.
            </p>
          </div>

          {/* Circular Score Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '4px solid var(--primary)',
                boxShadow: '0 0 20px var(--primary-glow)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                {(stats?.avg_match_score ?? 0).toFixed(0)}%
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Avg Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="saas-card"
              style={{
                padding: '16px',
                background: kpi.bg,
                borderColor: kpi.borderColor,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {kpi.title}
                </span>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: kpi.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={14} color={kpi.iconColor} />
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', lineHeight: 1.1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Staged Pipeline Columns (Spatial Pipeline View) */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px' }}>
          Recruitment Pipeline Stages & Funnel
        </h3>

        <PipelineStageBar
          candidates={candidates}
          activeStage={activeStage}
          onSelectStage={setActiveStage}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Stage 1: Evaluated Cohort */}
          <div className="saas-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bright)' }}>
                Evaluated Applicants ({candidates.length})
              </div>
              <span className="badge badge-low">Ingested</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {candidates.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="saas-card saas-card-interactive"
                  style={{ padding: '14px', cursor: 'pointer' }}
                  onClick={() => onSelectCandidate(c.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="candidate-name" style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.88rem' }}>{c.name}</div>
                    <span className="badge metric-val badge-lower">{c.similarity_score.toFixed(1)}%</span>
                  </div>
                  <div className="job-title" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{c.job_title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 2: Strong Text Alignment (>= 40%) */}
          <div className="saas-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bright)' }}>
                High Alignment Candidates
              </div>
              <span className="badge badge-moderate">Qualified</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {candidates
                .filter((c) => c.similarity_score >= 10.0)
                .slice(0, 3)
                .map((c) => (
                  <div
                    key={c.id}
                    className="saas-card saas-card-interactive"
                    style={{ padding: '14px', cursor: 'pointer' }}
                    onClick={() => onSelectCandidate(c.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="candidate-name" style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.88rem' }}>{c.name}</div>
                      <span className="badge metric-val badge-strong">{c.similarity_score.toFixed(1)}%</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                      {c.required_skills_matched.length} Skills Matched
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Stage 3: Shortlisted Pool */}
          <div className="saas-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bright)' }}>
                Shortlisted Talent ({candidates.filter((c) => c.shortlist_status).length})
              </div>
              <span className="badge badge-strong">Interview Ready</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {candidates.filter((c) => c.shortlist_status).length > 0 ? (
                candidates
                  .filter((c) => c.shortlist_status)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="saas-card saas-card-interactive"
                      style={{ padding: '14px', cursor: 'pointer', borderLeft: '3px solid var(--primary)' }}
                      onClick={() => onSelectCandidate(c.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.88rem' }}>{c.name}</div>
                        <span className="badge badge-strong">{c.similarity_score.toFixed(1)}%</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{c.job_title}</div>
                    </div>
                  ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', padding: '30px 0' }}>
                  No candidates shortlisted yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
