import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Users,
  BookmarkCheck,
  BarChart3,
  Briefcase,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  demoModeActive: boolean;
  onOpenLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  demoModeActive,
  onOpenLanding,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Resumes', icon: FileSearch },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'shortlist', label: 'Shortlist', icon: BookmarkCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'jobs', label: 'Job Descriptions', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        width: isCollapsed ? '76px' : '260px',
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0' : '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => handleNavClick('overview')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px var(--primary-glow)',
              flexShrink: 0,
              color: '#FFFFFF',
            }}
          >
            <Sparkles size={20} />
          </div>
          {!isCollapsed && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>
                TalentLens
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.02em' }}>Recruitment Intelligence</div>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Demo Mode Indicator Pill */}
      {demoModeActive && !isCollapsed && (
        <div style={{ padding: '12px 18px 4px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--badge-mod-bg)',
              border: '1px solid var(--badge-mod-border)',
              color: 'var(--badge-mod-text)',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--badge-mod-text)',
              }}
            />
            Synthetic Demo Dataset
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isCollapsed ? '12px 0' : '10px 14px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                border: '1px solid',
                backgroundColor: isActive ? 'var(--badge-strong-bg)' : 'transparent',
                borderColor: isActive ? 'var(--badge-strong-border)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <Icon size={18} color="currentColor" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Public Showcase button inside sidebar */}
      {!isCollapsed && (
        <div style={{ padding: '0 12px 8px' }}>
          <button
            onClick={onOpenLanding}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'flex-start' }}
          >
            <ExternalLink size={14} /> Public Showcase
          </button>
        </div>
      )}

      {/* Privacy and Local Execution Footer */}
      {!isCollapsed ? (
        <div
          style={{
            padding: '14px',
            margin: '10px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '2px' }}>
            <ShieldCheck size={14} />
            Local ML Engine
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
            100% On-Device Processing. No external AI APIs or cloud databases.
          </div>
        </div>
      ) : null}

      {/* Collapse Toggle for Desktop */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          display: 'block',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 30,
        }}
        className="desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{ width: '280px', height: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
