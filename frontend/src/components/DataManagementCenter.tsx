import React, { useState, useRef } from 'react';
import {
  HardDrive,
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { api } from '../services/api';

interface DataManagementCenterProps {
  onRefreshAll: () => void;
  loadAuditTrail: () => void;
}

export const DataManagementCenter: React.FC<DataManagementCenterProps> = ({
  onRefreshAll,
  loadAuditTrail,
}) => {
  const [isExportingCandidates, setIsExportingCandidates] = useState(false);
  const [isExportingJobs, setIsExportingJobs] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [isClearingDemo, setIsClearingDemo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const restoreFileRef = useRef<HTMLInputElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setStatusMessage(null);
  };

  // 1. Export Candidates CSV
  const handleExportCandidates = async (shortlistOnly = false) => {
    setIsExportingCandidates(true);
    try {
      await api.downloadCsv(shortlistOnly);
      showStatus(
        shortlistOnly
          ? 'Shortlisted candidates CSV exported successfully.'
          : 'Complete candidates database exported to CSV (including Stage, Education, Experience, and Interview notes).'
      );
      loadAuditTrail();
    } catch (err: any) {
      showError(`CSV Export failed: ${err.message}`);
    } finally {
      setIsExportingCandidates(false);
    }
  };

  // 2. Export Jobs CSV
  const handleExportJobs = async () => {
    setIsExportingJobs(true);
    try {
      await api.downloadJobsCsv();
      showStatus('Job benchmarks exported to CSV with required & preferred skill profiles.');
      loadAuditTrail();
    } catch (err: any) {
      showError(`Jobs CSV Export failed: ${err.message}`);
    } finally {
      setIsExportingJobs(false);
    }
  };

  // 3. Export JSON System Snapshot
  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    try {
      const snapshot = await api.getBackup();
      const jsonStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentlens_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showStatus('Complete local system JSON backup exported.');
      loadAuditTrail();
    } catch (err: any) {
      showError(`JSON Backup failed: ${err.message}`);
    } finally {
      setIsExportingBackup(false);
    }
  };

  // 4. Restore from JSON Backup
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Restore system from this backup file? Existing candidate records, screening sessions, and jobs will be safely validated and synchronized.')) {
      if (restoreFileRef.current) restoreFileRef.current.value = '';
      return;
    }

    setIsRestoring(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await api.restoreBackup(parsed);
      showStatus(res.message || 'System backup restored successfully.');
      onRefreshAll();
      loadAuditTrail();
    } catch (err: any) {
      showError(`Restore failed: ${err.message}`);
    } finally {
      setIsRestoring(false);
      if (restoreFileRef.current) restoreFileRef.current.value = '';
    }
  };

  // 5. Reset Demo Data
  const handleResetDemoData = async () => {
    if (window.confirm('Reset the synthetic demo candidates? Real candidate uploads are isolated and will not be touched.')) {
      setIsResettingDemo(true);
      try {
        const res = await api.resetDemoData();
        showStatus(res.message);
        onRefreshAll();
        loadAuditTrail();
      } catch (err: any) {
        showError(`Reset demo error: ${err.message}`);
      } finally {
        setIsResettingDemo(false);
      }
    }
  };

  // 6. Clear Demo Data
  const handleClearDemoData = async () => {
    if (window.confirm('Remove synthetic demo records? Real uploaded candidate files will be kept.')) {
      setIsClearingDemo(true);
      try {
        const res = await api.clearDemoData();
        showStatus(res.message);
        onRefreshAll();
        loadAuditTrail();
      } catch (err: any) {
        showError(`Clear demo error: ${err.message}`);
      } finally {
        setIsClearingDemo(false);
      }
    }
  };

  return (
    <div className="saas-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={18} color="var(--primary)" />
            Data Management Center & Secure Storage
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0 0' }}>
            Direct CSV exports, complete JSON state snapshots, validated backups, and synthetic demonstration datasets.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
          <ShieldCheck size={14} /> Secure Dedicated Storage
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '6px',
            backgroundColor: 'var(--badge-strong-bg)',
            border: '1px solid var(--badge-strong-border)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={15} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '6px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid rgba(186, 60, 60, 0.25)',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of Data Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* CSV Export Suite */}
        <div
          style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <FileSpreadsheet size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-bright)' }}>Recruitment CSV Exports</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
              Download structured candidate datasets (including pipeline stages, education, experience, and interview notes) or job benchmark role requirements.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleExportCandidates(false)}
              disabled={isExportingCandidates}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Download size={14} /> Export All Candidates to CSV
            </button>
            <button
              onClick={() => handleExportCandidates(true)}
              disabled={isExportingCandidates}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', color: 'var(--primary)' }}
            >
              <Download size={14} /> Export Shortlisted Candidates CSV
            </button>
            <button
              onClick={handleExportJobs}
              disabled={isExportingJobs}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Briefcase size={14} /> Export Job Benchmarks to CSV
            </button>
          </div>
        </div>

        {/* JSON Backup & Validated Restore */}
        <div
          style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <FileCheck size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-bright)' }}>JSON Snapshot & Restore</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
              Safely backup the complete workspace repository state. Restoring performs structural validation under thread locks.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleExportBackup}
              disabled={isExportingBackup}
              className="btn btn-primary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Download size={14} /> Download System JSON Backup
            </button>

            <input
              ref={restoreFileRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              style={{ display: 'none' }}
            />

            <button
              onClick={() => restoreFileRef.current?.click()}
              disabled={isRestoring}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <UploadCloud size={14} /> {isRestoring ? 'Validating...' : 'Restore System from JSON'}
            </button>
          </div>
        </div>

        {/* Synthetic Demo Controls */}
        <div
          style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Cpu size={16} color="var(--accent-secondary)" />
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-bright)' }}>Synthetic Demo Controls</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
              Populate or clear sample candidates across Engineering, Product, and Data domains scored through the candidate screening engine.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleResetDemoData}
              disabled={isResettingDemo}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <RefreshCw size={14} className={isResettingDemo ? 'animate-spin' : ''} /> Reset Demo Dataset
            </button>
            <button
              onClick={handleClearDemoData}
              disabled={isClearingDemo}
              className="btn btn-danger btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <Trash2 size={14} /> Remove Demo Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
