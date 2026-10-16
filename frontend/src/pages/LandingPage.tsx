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
  currentTheme: string;
  setTheme: (theme: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkspace,
  onExploreDemo,
  currentTheme,
  setTheme,
}) => {
  const workflowSteps = [
    {
      num: '01',
      title: 'Benchmark Role Criteria',
      desc: 'Define required skills, optional bonuses, and domain expectations using customizable role profiles.',
      icon: Layers,
    },
    {
      num: '02',
      title: 'Stream Multi-PDF Resumes',
      desc: 'Drag and drop applicant batches with header integrity validation and local file size checks.',
      icon: FileText,
    },
    {
      num: '03',
      title: 'PyMuPDF Text Extraction',
      desc: 'Inspect selectable text locally, capturing candidate contact points and detecting unreadable scans.',
      icon: FileCheck,
    },
    {
      num: '04',
      title: 'TF-IDF Numerical Vectorization',
      desc: 'scikit-learn vectorizer calculates unigrams & bigrams while preserving C++, C#, and .NET tokens.',
      icon: Cpu,
    },
    {
      num: '05',
      title: 'Empirical Cosine Alignment',
      desc: 'Derives transparent 0–100% similarity estimates without arbitrary black-box hallucinations.',
      icon: BarChart3,
    },
    {
      num: '06',
      title: 'Explainable Skill Gap Telemetry',
      desc: 'Reveals exactly which core capabilities are present, missing, or preferred for each candidate.',
      icon: Sparkles,
    },
    {
      num: '07',
      title: 'Shortlist & CSV Export',
      desc: 'Curate your candidate pool and export Excel-ready CSV files with UTF-8 BOM encoding.',
      icon: BookmarkCheck,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* Landing Navigation */}
      <nav
        style={{
          height: '76px',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-sidebar)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 10px var(--primary-glow)',
            }}
          >
            <Sparkles size={22} />
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
          {/* Quick Theme Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Theme:</span>
            <select
              value={currentTheme}
              onChange={(e) => setTheme(e.target.value)}
              className="input-field"
              style={{ height: '34px', padding: '4px 28px 4px 10px', fontSize: '0.78rem', width: '160px' }}
            >
              <option value="ivory">Editorial Ivory</option>
              <option value="cobalt">Cobalt Studio</option>
              <option value="graphite">Graphite Dimension</option>
            </select>
          </div>

          <button onClick={onOpenWorkspace} className="btn btn-primary btn-sm">
            Open recruitment workspace <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '72px 36px 64px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'var(--badge-strong-bg)',
                border: '1px solid var(--badge-strong-border)',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              <ShieldCheck size={16} /> On-Device Machine Learning Architecture
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.035em',
                color: 'var(--text-bright)',
                marginBottom: '20px',
              }}
            >
              See the signal in every resume.
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
                <CheckCircle2 size={16} color="var(--primary)" /> Zero cloud AI charges
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" /> Local PyMuPDF parsing
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--primary)" /> scikit-learn TF-IDF
              </span>
            </div>
          </div>

          {/* Signature 3D Interactive Hero Aperture */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Interactive3DLens onExploreDemo={onExploreDemo} />
          </div>
        </div>
      </section>

      {/* Guided 7-Step Workflow Showcase */}
      <section style={{ padding: '64px 36px', backgroundColor: 'var(--bg-card-subtle)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>
              The 7-Step Recruitment Workflow
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              From PDF document ingestion to explainable candidate ranking, every computation executes on your local CPU.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="saas-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      {step.num}
                    </span>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--badge-strong-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
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
                  <strong style={{ color: 'var(--text-bright)' }}>Boundary-Safe Phrase Matching:</strong> Regular expressions with strict word boundaries ensure programming languages like <code>C</code> do not falsely match <code>CSS</code>, and <code>Java</code> does not match <code>JavaScript</code>.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: 'var(--text-bright)' }}>Canonical Alias Resolution:</strong> Matches common technology variants (e.g. <code>sklearn</code> $\leftrightarrow$ <code>scikit-learn</code>, <code>k8s</code> $\leftrightarrow$ <code>Kubernetes</code>).
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: 'var(--text-bright)' }}>Decision-Support Integrity:</strong> Raw cosine similarity is kept separate from required skill coverage %, ensuring honest recruiter insights without fabricated probabilities.
                </div>
              </div>
            </div>

            <button onClick={onOpenWorkspace} className="btn btn-outline">
              Inspect Live Scoring Engine <ChevronRight size={16} />
            </button>
          </div>

          {/* Interactive ML Pipeline Preview Box */}
          <div className="saas-card" style={{ padding: '28px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Candidate Evaluation Telemetry
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-bright)' }}>Aria Vance</span>
                <span className="badge badge-strong">8/8 Skills Matched</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Evaluated against: AI/ML Engineer Intern benchmark
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
                {['Python', 'Machine Learning', 'scikit-learn', 'PyTorch', 'Pandas', 'NumPy', 'Git', 'REST APIs'].map((s, i) => (
                  <span key={i} className="skill-tag skill-tag-matched">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong>Rule-Based Analysis Summary:</strong> Relevant text was found for all 8 required competencies. The resume exhibits high vocabulary overlap with the target job description.
            </div>
          </div>
        </div>
      </section>

      {/* Local Storage & Privacy Section */}
      <section style={{ padding: '64px 36px', backgroundColor: 'var(--bg-card-subtle)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--badge-strong-bg)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={22} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>
            Privacy by Design: 100% On-Device Storage
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px', maxWidth: '720px', margin: '0 auto 28px' }}>
            Resume PDFs are processed locally on your computer. Original files remain inside <code>backend/uploads/</code> and analysis results persist in <code>backend/data/</code> JSON records. No candidate personally identifiable information (PII) is ever transmitted to cloud servers.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={onOpenWorkspace} className="btn btn-primary btn-lg">
              Launch TalentLens Workspace <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 36px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        <div>TalentLens AI — Recruitment intelligence, made clearer.</div>
        <div style={{ marginTop: '6px' }}>Decision-support signals based on empirical text similarity and skill matching.</div>
      </footer>
    </div>
  );
};
