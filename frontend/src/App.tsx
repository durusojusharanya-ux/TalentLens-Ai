import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { JobModal } from './components/JobModal';
import { OverviewPage } from './pages/OverviewPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { CandidatesPage } from './pages/CandidatesPage';
import { ShortlistPage } from './pages/ShortlistPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { JobsPage } from './pages/JobsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { Job, Candidate, DashboardStats } from './types';
import { api } from './services/api';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // View mode: 'landing' (public marketing showcase) or 'app' (recruiter workspace)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    return (localStorage.getItem('talentlens_view') as any) || 'app';
  });

  // Theme: 'ivory' | 'cobalt' | 'graphite'
  const [theme, setThemeState] = useState<'ivory' | 'cobalt' | 'graphite'>(() => {
    return (localStorage.getItem('talentlens_theme') as any) || 'ivory';
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
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState<boolean>(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  // Health and Loading States
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Apply Theme & Layout to DOM and localStorage
  const setTheme = (newTheme: 'ivory' | 'cobalt' | 'graphite') => {
    setThemeState(newTheme);
    localStorage.setItem('talentlens_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setLayout = (newLayout: 'command' | 'editorial' | 'spatial') => {
    setLayoutState(newLayout);
    localStorage.setItem('talentlens_layout', newLayout);
    document.documentElement.setAttribute('data-layout', newLayout);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-layout', layout);
  }, [theme, layout]);

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
        setGlobalError('Backend server is offline. Please start FastAPI on http://127.0.0.1:8000.');
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

      // 4. Load Stats
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
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: theme === 'ivory' ? ['#1B4332', '#C87D55', '#2D6A4F'] : theme === 'cobalt' ? ['#1D4ED8', '#FF5A1F', '#3B82F6'] : ['#14B8A6', '#A3E635', '#2DD4BF'],
        });
      }

      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, shortlist_status: nextStatus } : c))
      );

      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(`Failed to update shortlist status: ${err.message}`);
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
        currentTheme={theme}
        setTheme={setTheme as any}
      />
    );
  }

  // Render Recruitment Workspace
  return (
    <div className="app-container" data-theme={theme} data-layout={layout}>
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
          currentTheme={theme}
          setTheme={setTheme}
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
              onNavigateCandidates={() => setActiveTab('candidates')}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesPage
              candidates={candidates}
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
              onToggleShortlist={handleToggleShortlist}
              onDeleteCandidate={handleDeleteCandidate}
              onExportCsv={handleExportCsv}
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
              currentTheme={theme}
              setTheme={setTheme}
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
          onDelete={handleDeleteCandidate}
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
