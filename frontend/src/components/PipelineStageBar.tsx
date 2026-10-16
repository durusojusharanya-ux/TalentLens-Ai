import React from 'react';
import {
  UserPlus,
  Eye,
  BookmarkCheck,
  Calendar,
  Award,
  XCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Candidate, CandidateStage } from '../types';

interface PipelineStageBarProps {
  candidates: Candidate[];
  activeStage: CandidateStage | 'all';
  onSelectStage: (stage: CandidateStage | 'all') => void;
}

interface StageConfig {
  key: CandidateStage;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const STAGES: StageConfig[] = [
  {
    key: 'New',
    label: 'New',
    icon: UserPlus,
    color: '#647789',
    bgColor: '#F0F8FC',
    borderColor: '#DCE8EF',
    description: 'Fresh applicant intake',
  },
  {
    key: 'Reviewed',
    label: 'Reviewed',
    icon: Eye,
    color: '#087EA4',
    bgColor: '#DDFBFA',
    borderColor: '#A5F3FC',
    description: 'Screened & analyzed',
  },
  {
    key: 'Shortlisted',
    label: 'Shortlisted',
    icon: BookmarkCheck,
    color: '#059669',
    bgColor: '#DDF7EA',
    borderColor: '#A7F3D0',
    description: 'Meets benchmarks',
  },
  {
    key: 'Interview',
    label: 'Interview',
    icon: Calendar,
    color: '#8B5CF6',
    bgColor: '#EEE7FF',
    borderColor: '#DDD6FE',
    description: 'Scheduled / evaluated',
  },
  {
    key: 'Selected',
    label: 'Selected',
    icon: Award,
    color: '#075985',
    bgColor: '#DDF2FF',
    borderColor: '#BFDBFE',
    description: 'Offer / final hire',
  },
  {
    key: 'Rejected',
    label: 'Rejected',
    icon: XCircle,
    color: '#DC2626',
    bgColor: '#FFF1F2',
    borderColor: '#FECDD3',
    description: 'Archived / not fit',
  },
];

export const PipelineStageBar: React.FC<PipelineStageBarProps> = ({
  candidates,
  activeStage,
  onSelectStage,
}) => {
  // Count candidates per stage
  const stageCounts = React.useMemo(() => {
    const counts: Record<CandidateStage, number> = {
      New: 0,
      Reviewed: 0,
      Shortlisted: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
    };

    candidates.forEach((c) => {
      const stage = (c.stage || (c.shortlist_status ? 'Shortlisted' : 'New')) as CandidateStage;
      if (counts[stage] !== undefined) {
        counts[stage]++;
      } else {
        counts.New++;
      }
    });

    return counts;
  }, [candidates]);

  const total = candidates.length;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-bright)' }}>
            Recruitment Funnel & Pipeline
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            {total} Active Profiles
          </span>
        </div>

        {activeStage !== 'all' && (
          <button
            onClick={() => onSelectStage('all')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Filter size={12} /> Clear Filter (Showing {activeStage})
          </button>
        )}
      </div>

      {/* Visual Pipeline Stage Chevrons / Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '10px',
        }}
      >
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const count = stageCounts[st.key] || 0;
          const isActive = activeStage === st.key;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div
              key={st.key}
              onClick={() => onSelectStage(isActive ? 'all' : st.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectStage(isActive ? 'all' : st.key);
                }
              }}
              style={{
                backgroundColor: isActive ? st.bgColor : 'var(--bg-app)',
                border: `1.5px solid ${isActive ? st.color : 'var(--border-subtle)'}`,
                borderRadius: '9px',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isActive ? 'scale(1.02)' : 'none',
                boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                position: 'relative',
              }}
              title={`${st.label}: ${count} candidate(s) (${percent}% of total) - Click to filter`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: st.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: st.color,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: isActive ? st.color : 'var(--text-bright)',
                    }}
                  >
                    {st.label}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: count > 0 ? st.color : 'var(--text-dim)',
                    backgroundColor: isActive ? 'var(--bg-card)' : 'var(--border-subtle)',
                    padding: '2px 7px',
                    borderRadius: '12px',
                  }}
                >
                  {count}
                </span>
              </div>

              {/* Progress Mini Bar */}
              <div
                style={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: 'var(--border-subtle)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginTop: '6px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percent}%`,
                    backgroundColor: st.color,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '5px',
                  fontSize: '0.68rem',
                  color: 'var(--text-dim)',
                }}
              >
                <span>{percent}% share</span>
                {idx < STAGES.length - 1 && (
                  <ChevronRight size={10} style={{ opacity: 0.4 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
