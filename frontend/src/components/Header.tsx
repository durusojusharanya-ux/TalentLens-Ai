import React from 'react';
import {
  Menu,
  Sparkles,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  ExternalLink
} from 'lucide-react';
import { Job } from '../types';

interface HeaderProps {
  activeTab: string;
  setMobileOpen: (open: boolean) => void;
  jobs: Job[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  isBackendHealthy: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigateUpload: () => void;
  currentLayout: 'command' | 'editorial' | 'spatial';
  setLayout: (layout: 'command' | 'editorial' | 'spatial') => void;
  onOpenLanding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setMobileOpen,
  jobs,
  selectedJobId,
  setSelectedJobId,
  isBackendHealthy,
  onRefresh,
  isRefreshing,
  onNavigateUpload,
  currentLayout,
  setLayout,
  onOpenLanding,
}) => {
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Talent Screening Intelligence',
      subtitle: 'Real-time candidate ranking and skill alignment overview',
    },
    analyze: {
      title: 'Analyze Resumes',
      subtitle: 'Upload multi-PDF resumes for intelligent text screening and skill matching',
    },
    candidates: {
      title: 'Candidate Directory',
      subtitle: 'Ranked applicants with transparent skill matching breakdown',
    },
    shortlist: {
      title: 'Shortlisted Applicants',
      subtitle: 'Curated pool of top-matched talent ready for next rounds',
    },
    analytics: {
      title: 'Recruitment Analytics',
      subtitle: 'Score distributions and skill demand telemetry',
    },
    jobs: {
      title: 'Job Descriptions',
      subtitle: 'Define role requirements, skills, and target criteria',
    },
    settings: {
      title: 'Platform Settings & Privacy',
      subtitle: 'Platform data management details and matching thresholds',
    },
  };

  const current = pageTitles[activeTab] || { title: 'TalentLens', subtitle: 'Recruitment intelligence, made clearer.' };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '4px',
          }}
          className="mobile-menu-btn"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, lineHeight: 1.2 }}>
            {current.title}
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, marginTop: '2px' }}>
            {current.subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Layout Selector (visible on Overview) */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LayoutGrid size={14} color="var(--primary)" />
            <select
              value={currentLayout}
              onChange={(e) => setLayout(e.target.value as any)}
              className="input-field"
              style={{
                padding: '4px 28px 4px 8px',
                fontSize: '0.78rem',
                height: '32px',
                width: '145px',
                borderRadius: '8px',
              }}
              title="Change Dashboard Composition Layout"
            >
              <option value="command">Command Center</option>
              <option value="editorial">Editorial Space</option>
              <option value="spatial">Spatial Dashboard</option>
            </select>
          </div>
        )}

        {/* Public Landing Link */}
        <button
          onClick={onOpenLanding}
          className="btn btn-outline btn-sm"
          style={{ height: '32px', padding: '4px 10px', fontSize: '0.78rem' }}
          title="View public landing page"
        >
          <ExternalLink size={13} />
          <span style={{ display: 'none' }} className="landing-btn-text">Public Showcase</span>
        </button>

        {/* Target Job Selector dropdown if multiple jobs exist */}
        {jobs.length > 0 && activeTab !== 'settings' && (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input-field"
            style={{
              padding: '4px 28px 4px 8px',
              fontSize: '0.78rem',
              height: '32px',
              maxWidth: '180px',
              borderRadius: '8px',
            }}
            title="Select active job context"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        )}

        {/* Backend Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: isBackendHealthy ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${isBackendHealthy ? 'var(--success-border)' : 'var(--danger-border)'}`,
            fontSize: '0.72rem',
            fontWeight: 600,
            color: isBackendHealthy ? 'var(--success)' : 'var(--danger)',
          }}
          title={isBackendHealthy ? 'AI Screening Engine Online' : 'Engine Disconnected'}
        >
          {isBackendHealthy ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          <span style={{ display: 'none' }} className="backend-status-text">
            {isBackendHealthy ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 8px', height: '32px' }}
          title="Refresh data"
          disabled={isRefreshing}
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Screen Resumes Shortcut */}
        {activeTab !== 'analyze' && (
          <button
            onClick={onNavigateUpload}
            className="btn btn-primary btn-sm"
            style={{ height: '32px', padding: '4px 12px' }}
          >
            <Upload size={13} />
            <span style={{ display: 'none' }} className="upload-btn-text">Screen</span>
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 768px) {
          .backend-status-text { display: inline !important; }
          .landing-btn-text { display: inline !important; }
        }
        @media (min-width: 1024px) {
          .upload-btn-text { display: inline !important; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
