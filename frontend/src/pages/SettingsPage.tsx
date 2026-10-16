import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  HardDrive,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Palette,
  LayoutGrid,
  Cpu
} from 'lucide-react';
import { AppSettingsData } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  onRefreshAll: () => void;
  currentTheme: 'ivory' | 'cobalt' | 'graphite';
  setTheme: (theme: 'ivory' | 'cobalt' | 'graphite') => void;
  currentLayout: 'command' | 'editorial' | 'spatial';
  setLayout: (layout: 'command' | 'editorial' | 'spatial') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onRefreshAll,
  currentTheme,
  setTheme,
  currentLayout,
  setLayout,
}) => {
  const [data, setData] = useState<AppSettingsData | null>(null);
  const [strongThreshold, setStrongThreshold] = useState(70);
  const [moderateThreshold, setModerateThreshold] = useState(40);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [isClearingDemo, setIsClearingDemo] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      const res = await api.getSettings();
      setData(res);
      setStrongThreshold(res.settings.score_threshold_strong);
      setModerateThreshold(res.settings.score_threshold_moderate);
    } catch {}
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await api.updateSettings({
        score_threshold_strong: Number(strongThreshold),
        score_threshold_moderate: Number(moderateThreshold),
      });
      setStatusMessage('Threshold configurations updated successfully.');
      onRefreshAll();
    } catch (err: any) {
      setStatusMessage(`Error saving settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset the synthetic demo candidates? Real uploaded candidate records will be fully preserved.')) {
      setIsResettingDemo(true);
      try {
        const res = await api.resetDemoData();
        setStatusMessage(res.message);
        onRefreshAll();
      } catch (err: any) {
        setStatusMessage(`Error: ${err.message}`);
      } finally {
        setIsResettingDemo(false);
      }
    }
  };

  const handleClearDemoData = async () => {
    if (window.confirm('Remove demo candidates from the database? Real candidate uploads will be kept.')) {
      setIsClearingDemo(true);
      try {
        const res = await api.clearDemoData();
        setStatusMessage(res.message);
        onRefreshAll();
      } catch (err: any) {
        setStatusMessage(`Error: ${err.message}`);
      } finally {
        setIsClearingDemo(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      {/* Status Alert */}
      {statusMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--badge-strong-bg)',
            border: '1px solid var(--badge-strong-border)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Visual Design & Layout Systems */}
      <div className="saas-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={18} color="var(--primary)" />
          Theme & Workspace Layout Systems
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Customize your sensory recruitment environment. Every theme and layout adjusts typography, data cards, and contrast tokens.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Theme Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Color Theme
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'ivory', name: 'Editorial Ivory', desc: 'Warm ivory background, forest green, deep ink serif typography.' },
                { id: 'cobalt', name: 'Cobalt Studio', desc: 'Cool white surfaces, electric cobalt, tangerine geometric aesthetics.' },
                { id: 'graphite', name: 'Graphite Dimension', desc: 'Deep graphite background, muted teal, acid lime subtle highlights.' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: currentTheme === t.id ? 'var(--primary)' : 'var(--border-subtle)',
                    backgroundColor: currentTheme === t.id ? 'var(--badge-strong-bg)' : 'var(--bg-app)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: currentTheme === t.id ? 'var(--primary)' : 'var(--text-bright)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Dashboard Composition Layout
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'command', name: 'Command Center', desc: 'Compact sidebar, dense horizontal KPI strip, wide candidate ranking table.' },
                { id: 'editorial', name: 'Editorial Workspace', desc: 'Asymmetric grid, large display metrics, candidate visual activity timeline.' },
                { id: 'spatial', name: 'Spatial Dashboard', desc: 'Layered panels, circular match-score gauge, candidate stage columns.' },
              ].map((l) => (
                <div
                  key={l.id}
                  onClick={() => setLayout(l.id as any)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: currentLayout === l.id ? 'var(--accent-secondary)' : 'var(--border-subtle)',
                    backgroundColor: currentLayout === l.id ? 'var(--badge-mod-bg)' : 'var(--bg-app)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: currentLayout === l.id ? 'var(--badge-mod-text)' : 'var(--text-bright)' }}>
                    {l.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Configurations */}
      <div className="saas-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} color="var(--primary)" />
          Match Tier Thresholds
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Configure the TF-IDF percentage boundaries used for candidate match labels across tables and detail views.
        </p>

        <form onSubmit={handleSaveThresholds} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Strong Match Threshold (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={strongThreshold}
              onChange={(e) => setStrongThreshold(Number(e.target.value))}
              className="input-field"
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Scores ≥ {strongThreshold}% receive the "Strong Text Match" badge.
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Moderate Match Threshold (%)
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={moderateThreshold}
              onChange={(e) => setModerateThreshold(Number(e.target.value))}
              className="input-field"
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Scores between {moderateThreshold}% and {strongThreshold - 1}% receive "Moderate Match".
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ height: '42px', width: '100%' }}>
              {isSaving ? 'Saving...' : 'Update Thresholds'}
            </button>
          </div>
        </form>
      </div>

      {/* Demo Dataset Controls */}
      <div className="saas-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="var(--accent-secondary)" />
          Synthetic Demo Dataset
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          TalentLens provides synthetic candidate records (AI/ML, Full-Stack, and Data Analyst) scored through the real TF-IDF ML pipeline against the sample job description.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={handleResetDemoData}
            disabled={isResettingDemo}
            className="btn btn-secondary"
          >
            <RefreshCw size={15} className={isResettingDemo ? 'animate-spin' : ''} />
            Reset Demo Dataset
          </button>

          <button
            onClick={handleClearDemoData}
            disabled={isClearingDemo}
            className="btn btn-danger"
          >
            <Trash2 size={15} />
            Remove Demo Records
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '10px' }}>
          Note: Resetting or clearing demo data preserves real candidate uploads.
        </div>
      </div>

      {/* Local Storage Architecture */}
      <div className="saas-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HardDrive size={18} color="var(--primary)" />
          Local Data Architecture
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Data is persisted locally in JSON files and filesystem folders with zero cloud database dependencies.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '2px' }}>Candidate & Job Records:</div>
            <code style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>
              backend/data/jobs.json, backend/data/candidates.json, backend/data/settings.json
            </code>
          </div>

          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '2px' }}>Uploaded PDF Resumes:</div>
            <code style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem' }}>
              backend/uploads/ [Sanitized server-side filenames: cand_&lt;uuid&gt;.pdf]
            </code>
          </div>
        </div>
      </div>

      {/* Privacy Disclosures */}
      <div className="saas-card" style={{ border: '1px solid var(--border-strong)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--primary)" />
          Privacy & Security Disclosures
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <p>
            <strong>1. Strictly Local Execution:</strong> All PDF document parsing via PyMuPDF and TF-IDF numerical vectorization with scikit-learn execute 100% locally on this machine. No resume contents or candidate data are ever transmitted to external cloud AI APIs (e.g., OpenAI, Gemini, Anthropic).
          </p>
          <p>
            <strong>2. Local File Storage:</strong> Candidate metadata, extracted texts, and similarity scores are stored as plain JSON on the local filesystem. Original PDF documents are saved in the local uploads directory.
          </p>
          <p>
            <strong>3. Non-Discriminatory Decision Support:</strong> Candidate rankings are purely technical text similarity estimates. The engine never analyzes demographic attributes, age, gender, or protected characteristics.
          </p>
        </div>
      </div>
    </div>
  );
};
