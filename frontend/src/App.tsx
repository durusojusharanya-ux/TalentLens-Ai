import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CandidateCompareModal } from './components/CandidateCompareModal';
import { JobModal } from './components/JobModal';
import { OverviewPage } from './pages/OverviewPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { CandidatesPage } from './pages/CandidatesPage';
import { ShortlistPage } from './pages/ShortlistPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { JobsPage } from './pages/JobsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { Job, Candidate, DashboardStats, ScreeningSession, CandidateCompareResult, CandidateStage, InterviewNotes } from './types';
import { api } from './services/api';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // View mode: 'landing' (public marketing showcase) or 'app' (recruiter workspace)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    return (localStorage.getItem('talentlens_view') as any) || 'app';
  });

  // Layout: 'command' | 'editorial' | 'spatial'
  const [layout, setLayoutState] = useState<'command' | 'editorial' | 'spatial'>(() => {
    return (localStorage.getItem('talentlens_layout') as any) || 'command';
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Core Data States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [compareModalData, setCompareModalData] = useState<CandidateCompareResult | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState<boolean>(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  // Health and Loading States
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const setLayout = (newLayout: 'command' | 'editorial' | 'spatial') => {
    setLayoutState(newLayout);
    localStorage.setItem('talentlens_layout', newLayout);
    document.documentElement.setAttribute('data-layout', newLayout);
  };

  useEffect(() => {
    try {
      localStorage.removeItem('talentlens_theme');
      localStorage.removeItem('talentlens_custom_theme');
    } catch {}

    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.removeAttribute('data-theme-mode');

    // Remove any previous custom CSS variable overrides
    const overrideProps = [
      '--primary', '--primary-hover', '--primary-light', '--primary-glow',
      '--accent-secondary', '--accent-secondary-subtle', '--accent-sage',
      '--btn-primary-bg', '--btn-primary-text', '--btn-primary-hover',
      '--bg-app', '--bg-sidebar', '--bg-card', '--bg-card-subtle',
      '--bg-card-hover', '--bg-input', '--bg-overlay',
      '--text-main', '--text-bright', '--text-muted', '--text-dim',
      '--border-subtle', '--border-strong', '--border-focus',
      '--chart-primary', '--chart-secondary', '--chart-tertiary', '--chart-quaternary',
      '--chart-grid', '--badge-strong-bg', '--badge-strong-text', '--badge-strong-border',
      '--badge-mod-bg', '--badge-mod-text', '--badge-mod-border'
    ];
    overrideProps.forEach((p) => root.style.removeProperty(p));
    root.setAttribute('data-layout', layout);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem('talentlens_view', viewMode);
  }, [viewMode]);

  // Initial Data Fetch
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    setGlobalError(null);
    try {
      // 1. Health check
      try {
        await api.checkHealth();
        setIsBackendHealthy(true);
      } catch {
        setIsBackendHealthy(false);
        setGlobalError('Backend server is offline. Please ensure local backend is running on http://127.0.0.1:8000.');
        setIsRefreshing(false);
        return;
      }

      // 2. Load Jobs
      const jobsData = await api.getJobs();
      setJobs(jobsData);
      if (jobsData.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsData[0].id);
      }

      // 3. Load Candidates
      const candsData = await api.getCandidates();
      setCandidates(candsData);

      // 4. Load Screening Sessions
      try {
        const sessData = await api.getSessions();
        setSessions(sessData);
      } catch {
        // Non-blocking
      }

      // 5. Load Stats
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to sync with TalentLens backend.');
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Shortlist Toggle with Confetti Celebration
  const handleToggleShortlist = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      await api.toggleShortlist(id, nextStatus);

      if (nextStatus) {
        // Trigger subtle confetti burst
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.8 },
          colors: ['#2563EB', '#7C3AED', '#059669', '#F59E0B', '#DB2777', '#06B6D4'],
        });
      }

      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, shortlist_status: nextStatus } : c))
      );

      // Update in comparison modal if open
      if (compareModalData) {
        setCompareModalData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            candidates: prev.candidates.map(c => c.id === id ? { ...c, shortlist_status: nextStatus } : c)
          };
        });
      }

      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(`Failed to update shortlist status: ${err.message}`);
    }
  };

  // Bulk Shortlist
  const handleBulkShortlist = async (candidateIds: string[], status: boolean) => {
    try {
      await api.bulkShortlist(candidateIds, status);

      if (status) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#087EA4', '#075985', '#38BDF8', '#0284C7'],
        });
      }

      setCandidates((prev) =>
        prev.map((c) => (candidateIds.includes(c.id) ? { ...c, shortlist_status: status } : c))
      );

      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(`Bulk action failed: ${err.message}`);
    }
  };

  // Stage Management
  const handleUpdateStage = async (id: string, stage: CandidateStage) => {
    try {
      const res = await api.updateCandidateStage(id, stage);
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, stage: res.stage as CandidateStage, shortlist_status: res.shortlist_status }
            : c
        )
      );

      if (compareModalData) {
        setCompareModalData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            candidates: prev.candidates.map((c) =>
              c.id === id
                ? { ...c, stage: res.stage as CandidateStage, shortlist_status: res.shortlist_status }
                : c
            ),
          };
        });
      }

      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(`Failed to update candidate stage: ${err.message}`);
    }
  };

  // Bulk Stage Update
  const handleBulkUpdateStage = async (ids: string[], stage: CandidateStage) => {
    try {
      await Promise.all(ids.map((id) => api.updateCandidateStage(id, stage)));
      setCandidates((prev) =>
        prev.map((c) =>
          ids.includes(c.id)
            ? {
                ...c,
                stage: stage,
                shortlist_status:
                  stage === 'Shortlisted' ? true : stage === 'Rejected' ? false : c.shortlist_status,
              }
            : c
        )
      );
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(`Failed to bulk update candidate stages: ${err.message}`);
    }
  };

  // Interview Notes Update
  const handleUpdateInterview = async (id: string, interviewData: Partial<InterviewNotes>) => {
    try {
      const res = await api.updateCandidateInterview(id, interviewData);
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                stage: (res.stage as CandidateStage) || c.stage,
                interview_notes: res.interview_notes,
              }
            : c
        )
      );
    } catch (err: any) {
      alert(`Failed to save interview notes: ${err.message}`);
      throw err;
    }
  };

  // Candidate Comparison
  const handleCompareCandidates = async (candidateIds: string[]) => {
    try {
      const res = await api.compareCandidates(candidateIds);
      setCompareModalData(res);
    } catch (err: any) {
      alert(`Comparison error: ${err.message}`);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await api.deleteCandidate(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      if (selectedCandidateId === id) {
        setSelectedCandidateId(null);
      }
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(`Failed to delete candidate: ${err.message}`);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await api.deleteJob(jobId);
      const remainingJobs = jobs.filter((j) => j.id !== jobId);
      setJobs(remainingJobs);
      if (selectedJobId === jobId && remainingJobs.length > 0) {
        setSelectedJobId(remainingJobs[0].id);
      }
      loadAllData();
    } catch (err: any) {
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  const handleExportCsv = async (shortlistOnly = false) => {
    try {
      await api.downloadCsv(shortlistOnly, selectedJobId || undefined);
    } catch (err: any) {
      alert(`CSV Export Failed: ${err.message}`);
    }
  };

  const handleCandidateAnalyzed = (cand: Candidate) => {
    setCandidates((prev) => [cand, ...prev]);
    api.getStats().then((s) => setStats(s)).catch(() => {});
  };

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || null;

  // Render Public Landing Page
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onOpenWorkspace={() => setViewMode('app')}
        onExploreDemo={() => {
          setViewMode('app');
          setActiveTab('overview');
        }}
      />
    );
  }

  // Render Recruitment Workspace
  return (
    <div className="app-container" data-layout={layout}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        mobileOpen={mobileDrawerOpen}
        setMobileOpen={setMobileDrawerOpen}
        demoModeActive={stats?.is_demo_mode ?? false}
        onOpenLanding={() => setViewMode('landing')}
      />

      {/* Main Workspace Area */}
      <div className="main-content">
        <Header
          activeTab={activeTab}
          setMobileOpen={setMobileDrawerOpen}
          jobs={jobs}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          isBackendHealthy={isBackendHealthy}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
          onNavigateUpload={() => setActiveTab('analyze')}
          currentLayout={layout}
          setLayout={setLayout}
          onOpenLanding={() => setViewMode('landing')}
        />

        {/* Global Error Banner */}
        {globalError && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--danger-bg)',
              borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
              color: 'var(--danger)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            <span>{globalError}</span>
          </div>
        )}

        <main className="page-wrapper">
          {activeTab === 'overview' && (
            <OverviewPage
              stats={stats}
              candidates={candidates}
              layout={layout}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
              onToggleShortlist={handleToggleShortlist}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzePage
              jobs={jobs}
              selectedJobId={selectedJobId}
              setSelectedJobId={setSelectedJobId}
              onCandidateAnalyzed={handleCandidateAnalyzed}
              onNavigateCandidates={(sessId) => {
                if (sessId) setSelectedSessionId(sessId);
                setActiveTab('candidates');
              }}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesPage
              candidates={candidates}
              jobs={jobs}
              selectedJobId={selectedJobId}
              selectedSessionId={selectedSessionId}
              sessions={sessions}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
              onToggleShortlist={handleToggleShortlist}
              onBulkShortlist={handleBulkShortlist}
              onUpdateStage={handleUpdateStage}
              onBulkUpdateStage={handleBulkUpdateStage}
              onCompareCandidates={handleCompareCandidates}
              onDeleteCandidate={handleDeleteCandidate}
              onExportCsv={handleExportCsv}
              onNavigateUpload={() => setActiveTab('analyze')}
            />
          )}

          {activeTab === 'shortlist' && (
            <ShortlistPage
              candidates={candidates}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
              onToggleShortlist={handleToggleShortlist}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage stats={stats} />}

          {activeTab === 'jobs' && (
            <JobsPage
              jobs={jobs}
              onOpenCreateModal={() => {
                setJobToEdit(null);
                setJobModalOpen(true);
              }}
              onEditJob={(job) => {
                setJobToEdit(job);
                setJobModalOpen(true);
              }}
              onDeleteJob={handleDeleteJob}
              onSelectForScreening={(jobId) => {
                setSelectedJobId(jobId);
                setActiveTab('analyze');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              onRefreshAll={loadAllData}
              currentLayout={layout}
              setLayout={setLayout}
            />
          )}
        </main>
      </div>

      {/* Candidate Dossier Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidateId(null)}
          onToggleShortlist={handleToggleShortlist}
          onUpdateStage={handleUpdateStage}
          onUpdateInterview={handleUpdateInterview}
          onDelete={handleDeleteCandidate}
        />
      )}

      {/* Candidate Comparison Modal */}
      {compareModalData && (
        <CandidateCompareModal
          comparison={compareModalData}
          onClose={() => setCompareModalData(null)}
          onToggleShortlist={handleToggleShortlist}
        />
      )}

      {/* Job Create/Edit Modal */}
      <JobModal
        isOpen={jobModalOpen}
        onClose={() => {
          setJobModalOpen(false);
          setJobToEdit(null);
        }}
        jobToEdit={jobToEdit}
        onJobSaved={() => {
          loadAllData();
        }}
      />
    </div>
  );
};

export default App;
