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
  const distributionColors = ['#64748B', '#6366F1', '#818CF8', '#0EA5E9', '#10B981'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Disclaimer */}
      <div className="disclaimer-banner">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#818CF8' }} />
        <div>
          <strong>Analytics Telemetry:</strong> All metrics, distributions, and skill statistics are dynamically calculated from real local JSON records. No mocked or random analytical data.
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="saas-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Analyzed Cohort</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>{stats?.total_resumes ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total applicants evaluated</div>
        </div>

        <div className="saas-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Cohort Mean Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818CF8' }}>
            {(stats?.avg_match_score ?? 0).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Average cosine similarity</div>
        </div>

        <div className="saas-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Cohort Peak Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34D399' }}>
            {(stats?.highest_match_score ?? 0).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Highest textual alignment</div>
        </div>

        <div className="saas-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Conversion Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                Text Similarity Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Candidate count grouped by 20% similarity brackets
              </p>
            </div>
            <BarChart2 size={20} color="var(--primary)" />
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            {stats && stats.score_distribution.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.score_distribution} margin={{ top: 20, right: 20, left: -20, bottom: 10 }}>
                  <XAxis dataKey="range" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                    labelStyle={{ color: '#94A3B8' }}
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
        </div>

        {/* Pipeline Breakdown */}
        <div className="saas-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                Screening Pipeline Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Proportion of shortlisted applicants vs pending review
              </p>
            </div>
            <PieChartIcon size={20} color="var(--accent-cyan)" />
          </div>

          <div style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stats && stats.total_resumes > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.status_breakdown}
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.status_breakdown.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
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

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#34D399' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              Shortlisted: {stats?.shortlisted_candidates ?? 0}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#818CF8' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6366F1' }} />
              Under Review: {(stats?.total_resumes ?? 0) - (stats?.shortlisted_candidates ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Intelligence Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Most Frequently Matched */}
        <div className="saas-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} color="#10B981" /> Top Matched Competencies
          </h3>
          {stats && stats.top_matched_skills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.top_matched_skills.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{item.skill}</span>
                    <span style={{ color: '#34D399', fontWeight: 700 }}>
                      {item.count} resumes ({((item.count / Math.max(1, stats.total_resumes)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (item.count / Math.max(1, stats.total_resumes)) * 100)}%`,
                        background: 'linear-gradient(90deg, #059669, #10B981)',
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
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#EF4444" /> Most Prevalent Skill Gaps
          </h3>
          {stats && stats.top_missing_skills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.top_missing_skills.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{item.skill}</span>
                    <span style={{ color: '#F87171', fontWeight: 700 }}>
                      {item.count} missing ({((item.count / Math.max(1, stats.total_resumes)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (item.count / Math.max(1, stats.total_resumes)) * 100)}%`,
                        background: 'linear-gradient(90deg, #DC2626, #EF4444)',
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
