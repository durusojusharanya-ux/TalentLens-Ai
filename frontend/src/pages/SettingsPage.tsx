import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  History,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  FolderCheck,
  Lock,
  Trash2,
  FileText,
  Layers,
  Check
} from 'lucide-react';
import { AppSettingsData, AuditLog } from '../types';
import { api } from '../services/api';
import { DataManagementCenter } from '../components/DataManagementCenter';

interface SettingsPageProps {
  onRefreshAll: () => void;
  currentLayout: 'command' | 'editorial' | 'spatial';
  setLayout: (layout: 'command' | 'editorial' | 'spatial') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onRefreshAll,
  currentLayout,
  setLayout,
}) => {
  const [data, setData] = useState<AppSettingsData | null>(null);
  const [strongThreshold, setStrongThreshold] = useState(70);
  const [moderateThreshold, setModerateThreshold] = useState(40);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState<string>('all');

  useEffect(() => {
    loadSettingsData();
    loadAuditTrail();
  }, []);

  const loadSettingsData = async () => {
    try {
      const res = await api.getSettings();
      setData(res);
      setStrongThreshold(res.settings.score_threshold_strong);
      setModerateThreshold(res.settings.score_threshold_moderate);
    } catch {}
  };

  const loadAuditTrail = async () => {
    try {
      const logs = await api.getAuditLogs(60);
      setAuditLogs(logs);
    } catch {}
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      await api.updateSettings({
        score_threshold_strong: Number(strongThreshold),
        score_threshold_moderate: Number(moderateThreshold),
      });
      setStatusMessage('Threshold configurations updated successfully.');
      onRefreshAll();
      loadAuditTrail();
    } catch (err: any) {
      setErrorMessage(`Error saving settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLogs = auditFilter === 'all'
    ? auditLogs
    : auditLogs.filter(l => l.event_type.toLowerCase().includes(auditFilter.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1080px' }}>
      {/* Status Alerts */}
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

      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid rgba(186, 60, 60, 0.25)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Workspace Layout Architecture */}
      <div className="saas-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--primary)" />
          Workspace Layout Architecture
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Toggle between 3 distinctive operational layouts tailored to different recruitment workflows.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {[
            { id: 'command', name: 'Command Center', desc: 'Dense, metric-driven strip with high data visibility for high-volume recruitment.' },
            { id: 'editorial', name: 'Editorial Workspace', desc: 'Spacious editorial typography and thoughtful reading flow for thorough candidate assessments.' },
            { id: 'spatial', name: 'Spatial Dashboard', desc: 'Multi-column modular arrangement with visual depth and tactile interactive cards.' },
          ].map((l) => (
            <div
              key={l.id}
              onClick={() => setLayout(l.id as any)}
              style={{
                padding: '16px',
                borderRadius: '10px',
                border: `1.5px solid ${currentLayout === l.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                backgroundColor: currentLayout === l.id ? 'var(--primary-subtle)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-bright)' }}>{l.name}</strong>
                {currentLayout === l.id && (
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                    <Check size={11} style={{ marginRight: '3px' }} /> Active
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {l.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Comprehensive Data Management Center */}
      <DataManagementCenter
        onRefreshAll={onRefreshAll}
        loadAuditTrail={loadAuditTrail}
      />

      {/* 3. Match Tier Thresholds */}
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
              Strong Match Minimum Score (%)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="1"
                max="100"
                value={strongThreshold}
                onChange={(e) => setStrongThreshold(Number(e.target.value))}
                className="input-field"
                style={{ width: '90px' }}
                required
              />
              <span className="badge badge-strong" style={{ fontSize: '0.75rem' }}>
                ≥ {strongThreshold}% = Strong
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Moderate Match Minimum Score (%)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                min="1"
                max={strongThreshold - 1}
                value={moderateThreshold}
                onChange={(e) => setModerateThreshold(Number(e.target.value))}
                className="input-field"
                style={{ width: '90px' }}
                required
              />
              <span className="badge badge-moderate" style={{ fontSize: '0.75rem' }}>
                {moderateThreshold}% - {strongThreshold - 1}% = Moderate
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ height: '42px', width: '100%' }}>
              {isSaving ? 'Saving...' : 'Update Thresholds'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Audit History & Activity Trail */}
      <div className="saas-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="var(--primary)" />
              Audit Trail & Activity Log
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '4px 0 0' }}>
              Chronological log tracking resume uploads, analyses, stage updates, shortlisting, removals, deletions, and sessions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="input-field"
              style={{ height: '32px', fontSize: '0.78rem', width: '180px' }}
            >
              <option value="all">All Event Types</option>
              <option value="upload">Upload Events</option>
              <option value="stage">Stage Changes</option>
              <option value="interview">Interview Notes</option>
              <option value="shortlist">Shortlist Events</option>
              <option value="delete">Delete Events</option>
              <option value="session">Session Events</option>
              <option value="backup">Backup Events</option>
            </select>

            <button
              onClick={loadAuditTrail}
              className="btn btn-secondary btn-sm"
              style={{ height: '32px', padding: '4px 10px' }}
              title="Refresh audit events"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {filteredLogs.length > 0 ? (
          <div style={{ overflowX: 'auto', maxHeight: '340px', overflowY: 'auto' }}>
            <table className="saas-table" style={{ fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Timestamp</th>
                  <th style={{ width: '140px' }}>Action</th>
                  <th>Description</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const eventClass =
                    log.event_type.includes('delete') ? 'badge-lower' :
                    log.event_type.includes('shortlist') ? 'badge-strong' :
                    log.event_type.includes('stage') ? 'badge-accent' :
                    log.event_type.includes('interview') ? 'badge-moderate' :
                    log.event_type.includes('session') ? 'badge-accent' :
                    'badge-neutral';

                  return (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${eventClass}`} style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                          {log.event_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-main)', maxWidth: '380px' }}>
                        {log.description}
                      </td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                        {log.candidate_name && <div>Candidate: <strong>{log.candidate_name}</strong></div>}
                        {log.job_title && <div>Job: {log.job_title}</div>}
                        {log.session_id && <div>Session: {log.session_id}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            No audit events found for selected filter.
          </div>
        )}
      </div>

      {/* 5. Resume Storage & Privacy Controls */}
      <div className="saas-card" style={{ border: '1px solid rgba(56, 189, 248, 0.4)', background: 'linear-gradient(135deg, rgba(234, 246, 255, 0.7) 0%, rgba(242, 232, 255, 0.6) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={18} color="var(--primary)" />
            Resume Storage & Data Locality
          </h3>
          <span className="badge badge-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem' }}>
            <CheckCircle2 size={12} /> Zero Cloud Calls Verified
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.5 }}>
          TalentLens operates entirely offline without third-party cloud AI vendors. All PDF extraction, TF-IDF vectorization, and ranking routines execute strictly on this server.
        </p>

        {data?.storage_info && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '18px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.75)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                <FolderCheck size={14} /> Resume Uploads Directory
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-bright)', wordBreak: 'break-all' }}>
                {data.storage_info.uploads_directory}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Stores raw uploaded resume PDF files.
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.75)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>
                <HardDrive size={14} /> Database Storage Path
              </div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-bright)', wordBreak: 'break-all' }}>
                {data.storage_info.data_directory}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {data.storage_info.storage_type}
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Trash2 size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-bright)' }}>Privacy & Candidate Deletion Controls:</strong> You maintain complete sovereignty over your candidate data. Deleting a candidate from the Candidate Directory or Candidate Dossier permanently removes their parsed vector profile, stage history, timeline, and interview notes from the local filesystem.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Shield size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-bright)' }}>Non-Discriminatory Decision Support:</strong> Candidate scores reflect algorithmic text overlap between resumes and job specifications. TalentLens does not process demographic attributes, age, gender, race, or protected characteristics, and must be utilized as decision support rather than an autonomous hiring decision.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
