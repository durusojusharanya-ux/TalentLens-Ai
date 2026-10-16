import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  CheckCircle2,
  FileText,
  BarChart3,
  BookmarkCheck,
  Download,
  Lock,
  ChevronRight,
  Database
} from 'lucide-react';
import { Interactive3DLens } from '../components/Interactive3DLens';

interface LandingPageProps {
  onOpenWorkspace: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkspace,
  onExploreDemo,
}) => {
  const workflowSteps = [
    {
      num: '01',
      title: 'Benchmark Role Criteria',
      desc: 'Define required skills, optional bonuses, and domain expectations using customizable role profiles.',
      icon: Layers,
      color: '#2563EB',
      iconBg: '#EFF6FF',
    },
    {
      num: '02',
      title: 'Stream Multi-PDF Resumes',
      desc: 'Drag and drop applicant batches with header integrity validation and automated file size checks.',
      icon: FileText,
      color: '#0891B2',
      iconBg: '#ECFEFF',
    },
    {
      num: '03',
      title: 'High-Speed Text Extraction',
      desc: 'Inspect selectable text automatically, capturing candidate contact points and detecting unreadable scans.',
      icon: FileCheck,
      color: '#D97706',
      iconBg: '#FFFBEB',
    },
    {
      num: '04',
      title: 'TF-IDF Numerical Vectorization',
      desc: 'Mathematical vectorizer calculates multi-term phrase frequencies with exact token boundary preservation.',
      icon: Cpu,
      color: '#7C3AED',
      iconBg: '#F5F3FF',
    },
    {
      num: '05',
      title: 'Empirical Cosine Alignment',
      desc: 'Derives transparent 0–100% similarity estimates without arbitrary black-box hallucinations.',
      icon: BarChart3,
      color: '#2563EB',
      iconBg: '#EFF6FF',
    },
    {
      num: '06',
      title: 'Explainable Skill Gap Telemetry',
      desc: 'Reveals exactly which core capabilities are present, missing, or preferred for each candidate.',
      icon: Sparkles,
      color: '#DB2777',
      iconBg: '#FDF2F8',
    },
    {
      num: '07',
      title: 'Shortlist & CSV Export',
      desc: 'Curate your candidate pool and export Excel-ready CSV files with UTF-8 BOM encoding.',
      icon: BookmarkCheck,
      color: '#059669',
      iconBg: '#ECFDF5',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient-mesh)', backgroundAttachment: 'fixed', color: 'var(--text-main)', position: 'relative', overflowX: 'hidden' }}>
      {/* Landing Navigation */}
      <nav
        style={{
          height: '76px',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(191, 219, 254, 0.7)',
          background: 'var(--bg-header-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(124, 58, 237, 0.35)',
            }}
          >
            <Sparkles size={22} color="#A5F3FC" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>
              TalentLens
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
              Recruitment intelligence, made clearer.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onOpenWorkspace} className="btn btn-primary btn-sm">
            Open recruitment workspace <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section with Ambient Glow Orbs */}
      <section style={{ padding: '72px 36px 64px', maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
        <div className="ambient-glow-orb blue" style={{ width: '450px', height: '450px', top: '-40px', left: '-80px' }} />
        <div className="ambient-glow-orb purple" style={{ width: '480px', height: '480px', top: '40px', right: '-40px' }} />
        <div className="ambient-glow-orb cyan" style={{ width: '380px', height: '380px', bottom: '-20px', left: '35%' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(245, 243, 255, 0.9)',
                border: '1px solid rgba(196, 181, 253, 0.8)',
                color: '#7C3AED',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)',
              }}
            >
              <Sparkles size={16} color="#7C3AED" /> Intelligent Candidate Screening Architecture
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.035em',
                color: 'var(--text-bright)',
                marginBottom: '20px',
              }}
            >
              See <span className="gradient-text">the signal</span> in every resume.
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '560px',
              }}
            >
              Turn job descriptions and resumes into transparent, skill-focused insights. Compare candidates, understand skill alignment, and organize your shortlist in one workspace.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <button onClick={onOpenWorkspace} className="btn btn-primary btn-lg">
                Open recruitment workspace <ArrowRight size={18} />
              </button>
              <button onClick={onExploreDemo} className="btn btn-secondary btn-lg">
                Explore demo
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '36px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" /> High-speed resume screening
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" /> Automated skill gap telemetry
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" /> Explainable candidate scoring
              </span>
            </div>
          </div>

          {/* Signature 3D Interactive Hero Aperture */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div className="ambient-glow-orb purple" style={{ width: '320px', height: '320px', top: '10%', left: '15%', opacity: 0.7 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Interactive3DLens onExploreDemo={onExploreDemo} />
            </div>
          </div>
        </div>
      </section>

      {/* Guided 7-Step Workflow Showcase with Layered Pastel Section Gradient */}
      <section style={{ padding: '68px 36px', background: 'linear-gradient(180deg, rgba(234, 246, 255, 0.75) 0%, rgba(242, 232, 255, 0.6) 50%, rgba(221, 251, 250, 0.65) 100%)', borderTop: '1px solid rgba(191, 219, 254, 0.7)', borderBottom: '1px solid rgba(191, 219, 254, 0.7)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Transparent Intelligence Engine
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-bright)', margin: '8px 0 12px' }}>
              The 7-Step Recruitment Workflow
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              From PDF document ingestion to explainable candidate ranking, every computation provides clear, transparent match scoring.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              const cardClasses = [
                'card-kpi-blue',
                'card-kpi-cyan',
                'card-kpi-amber',
                'card-kpi-lavender',
                'card-kpi-blue',
                'card-kpi-blush',
                'card-kpi-mint',
              ];
              return (
                <div key={idx} className={`saas-card ${cardClasses[idx % cardClasses.length]}`} style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: step.color }}>
                      {step.num}
                    </span>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: step.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: step.color,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transparent Explainable Machine Learning Section */}
      <section style={{ padding: '72px 36px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px' }}>
              Transparent, Explainable Alignment
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Unlike black-box LLMs that produce hallucinated scores or ungrounded evaluations, TalentLens uses verifiable mathematical cosine similarity paired with canonical entity matching.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: 'var(--text-bright)' }}>Boundary-Safe Phrase Matching:</strong> Regular expressions with strict word boundaries ensure single terms like <code>Lead</code> do not falsely match <code>Leadership</code>, preserving precise contextual boundaries.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="var(--ai-purple)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: 'var(--text-bright)' }}>Canonical Alias Resolution:</strong> Matches common terminology variants and role acronyms (e.g. <code>PM</code> $\leftrightarrow$ <code>Project Management</code>, <code>Ops</code> $\leftrightarrow$ <code>Operations</code>).
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: 'var(--text-bright)' }}>Decision-Support Integrity:</strong> Raw cosine similarity is kept separate from required skill coverage %, ensuring honest recruiter insights without fabricated probabilities.
                </div>
              </div>
            </div>

            <button onClick={onOpenWorkspace} className="btn btn-outline">
              Inspect Live Scoring Engine <ChevronRight size={16} />
            </button>
          </div>

          {/* Interactive ML Pipeline Preview Box with .ai-card */}
          <div className="ai-card" style={{ padding: '28px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ai-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Candidate Evaluation Telemetry
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-bright)' }}>Aria Vance</span>
                <span className="badge badge-strong">8/8 Skills Matched</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Evaluated against: Strategic Operations & Leadership benchmark
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>TF-IDF Cosine Similarity</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>22.3% Empirical Vector Overlap</span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '22.3%', backgroundColor: 'var(--primary)', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Matched Required Skills:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Strategic Planning', 'Project Management', 'Data Analysis', 'Cross-Functional Leadership', 'Process Optimization', 'Risk Assessment', 'Stakeholder Management', 'Performance Metrics'].map((s, i) => (
                  <span key={i} className="skill-tag skill-tag-matched">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>AI Match Analysis Summary:</strong> Relevant text was found for all 8 required competencies. The resume exhibits high vocabulary overlap with the target job description.
            </div>
          </div>
        </div>
      </section>

      {/* Local Storage & Privacy Section (Rich Dark Navy with Purple Hue) */}
      <section style={{ padding: '72px 36px', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', color: 'var(--text-on-dark)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 182, 212, 0.18)',
              color: '#22D3EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
            }}
          >
            <Lock size={22} color="#22D3EE" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-on-dark)', marginBottom: '12px' }}>
            Privacy by Design: Dedicated Secure Architecture
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#E2E8F0', opacity: 0.95, lineHeight: 1.6, marginBottom: '28px', maxWidth: '720px', margin: '0 auto 28px' }}>
            Candidate resume documents and evaluation records remain strictly isolated within your recruitment workspace. No applicant personally identifiable information (PII) is transmitted to third-party public models or external data brokers.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={onOpenWorkspace}
              className="btn btn-lg"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--primary)',
                border: 'none',
                fontWeight: 700,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
              }}
            >
              Launch TalentLens Workspace <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '36px', background: 'linear-gradient(180deg, rgba(234, 246, 255, 0.75) 0%, rgba(242, 232, 255, 0.85) 100%)', borderTop: '1px solid rgba(191, 219, 254, 0.7)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>TalentLens AI — Recruitment intelligence, made clearer.</div>
        <div style={{ marginTop: '6px' }}>Decision-support signals based on empirical text similarity and skill matching.</div>
      </footer>
    </div>
  );
};
