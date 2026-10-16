import React from 'react';
import {
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info
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
import { DashboardStats } from '../types';

interface AnalyticsPageProps {
  stats: DashboardStats | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats }) => {
  const distributionColors = ['#94A3B8', '#D97706', '#087EA4', '#8B5CF6', '#059669'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Disclaimer */}
      <div className="disclaimer-banner">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
        <div>
          <strong>Analytics Telemetry:</strong> All metrics, distributions, and skill statistics are dynamically calculated from candidate evaluation records. Real-time screening telemetry.
        </div>
      </div>

      {/* Summary KPI Strip with Coordinated Multi-Shade Pastel Gradients */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="saas-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #EAF6FF 0%, #DDF2FF 100%)', borderColor: '#BFDBFE' }}>
          <div style={{ fontSize: '0.8rem', color: '#075985', fontWeight: 600, marginBottom: '6px' }}>Analyzed Cohort</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-bright)' }}>{stats?.total_resumes ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total applicants evaluated</div>
        </div>

        <div className="saas-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #F2E8FF 0%, #EEE7FF 100%)', borderColor: '#DDD6FE' }}>
          <div style={{ fontSize: '0.8rem', color: '#6D28D9', fontWeight: 600, marginBottom: '6px' }}>Cohort Mean Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ai-purple)' }}>
            {(stats?.avg_match_score ?? 0).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Average cosine similarity</div>
        </div>

        <div className="saas-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #DDFBFA 0%, #E0F2FE 100%)', borderColor: '#A5F3FC' }}>
          <div style={{ fontSize: '0.8rem', color: '#087EA4', fontWeight: 600, marginBottom: '6px' }}>Cohort Peak Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#087EA4' }}>
            {(stats?.highest_match_score ?? 0).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Highest textual alignment</div>
        </div>

        <div className="saas-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #FFF0F6 0%, #FCE7F3 100%)', borderColor: '#FBCFE8' }}>
          <div style={{ fontSize: '0.8rem', color: '#BE185D', fontWeight: 600, marginBottom: '6px' }}>Conversion Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-pink)' }}>
            {stats && stats.total_resumes > 0
              ? `${((stats.shortlisted_candidates / stats.total_resumes) * 100).toFixed(0)}%`
              : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Shortlist to applicant ratio</div>
        </div>
      </div>

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Match Score Distribution */}
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Text Similarity Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Candidate count grouped by 20% similarity brackets
              </p>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={18} color="var(--primary)" />
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            {stats && stats.score_distribution.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.score_distribution} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                  <XAxis dataKey="range" stroke="var(--text-dim)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '8px', color: 'var(--text-main)' }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.score_distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={distributionColors[index % distributionColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                <BarChart2 size={36} style={{ marginBottom: '8px', opacity: 0.4 }} />
                No candidate score data available yet.
              </div>
            )}
          </div>

          {/* Color Legend for Similarity Distribution */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            {[
              { label: '0–20%', color: '#94A3B8' },
              { label: '21–40%', color: '#F59E0B' },
              { label: '41–60%', color: '#2563EB' },
              { label: '61–80%', color: '#7C3AED' },
              { label: '81–100%', color: '#059669' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: b.color }} />
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Screening Pipeline Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Proportion of shortlisted applicants vs pending review
              </p>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChartIcon size={18} color="var(--success)" />
            </div>
          </div>

          <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stats && stats.total_resumes > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.status_breakdown}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="var(--success)" />
                    <Cell fill="var(--primary)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', borderRadius: '8px', color: 'var(--text-main)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                <PieChartIcon size={36} style={{ marginBottom: '8px', opacity: 0.4 }} />
                No candidate status data available.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
              Shortlisted: {stats?.shortlisted_candidates ?? 0}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
              Under Review: {(stats?.total_resumes ?? 0) - (stats?.shortlisted_candidates ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Intelligence Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Most Frequently Matched */}
        <div className="saas-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="var(--success)" /> Top Matched Competencies
          </h3>
          {stats && stats.top_matched_skills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.top_matched_skills.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.skill}</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                      {item.count} resumes ({((item.count / Math.max(1, stats.total_resumes)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-subtle)', borderRadius: '4px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (item.count / Math.max(1, stats.total_resumes)) * 100)}%`,
                        background: 'linear-gradient(90deg, var(--chart-primary), var(--success))',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
              No matched skill data recorded yet.
            </div>
          )}
        </div>

        {/* Most Frequently Missing */}
        <div className="saas-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="var(--danger)" /> Most Prevalent Skill Gaps
          </h3>
          {stats && stats.top_missing_skills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.top_missing_skills.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.skill}</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                      {item.count} missing ({((item.count / Math.max(1, stats.total_resumes)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-subtle)', borderRadius: '4px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (item.count / Math.max(1, stats.total_resumes)) * 100)}%`,
                        background: 'var(--danger)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
              No skill gaps recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
