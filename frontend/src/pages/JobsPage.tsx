import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Building
} from 'lucide-react';
import { Job } from '../types';

interface JobsPageProps {
  jobs: Job[];
  onOpenCreateModal: () => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onSelectForScreening: (jobId: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  jobs,
  onOpenCreateModal,
  onEditJob,
  onDeleteJob,
  onSelectForScreening,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="saas-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Job Benchmarks & Role Profiles ({jobs.length})
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '4px 0 0' }}>
              Define target criteria, responsibilities, and required skill dictionaries for TF-IDF screening
            </p>
          </div>

          <button onClick={onOpenCreateModal} className="btn btn-primary">
            <Plus size={16} /> Create New Role
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {jobs.map((job) => (
          <div key={job.id} className="saas-card saas-card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Title & Department */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    {job.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px' }}>
                    <Building size={13} /> {job.department}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onEditJob(job)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 8px' }}
                    title="Edit role benchmark"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the job benchmark "${job.title}"?`)) {
                        onDeleteJob(job.id);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '6px 8px' }}
                    title="Delete role benchmark"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={13} /> {job.employment_type}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {job.location || 'Remote'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {job.min_experience_years ? `${job.min_experience_years}+ yrs exp` : 'Any exp'}
                </span>
              </div>

              {/* Description Snippet */}
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px', maxHeight: '72px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.description}
              </p>

              {/* Required Skills */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '6px' }}>
                  Required Skills ({job.required_skills.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {job.required_skills.map((s, idx) => (
                    <span key={idx} className="skill-tag skill-tag-matched">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {job.preferred_skills && job.preferred_skills.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Preferred Skills ({job.preferred_skills.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {job.preferred_skills.map((s, idx) => (
                      <span key={idx} className="skill-tag skill-tag-pref">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Screen Resumes CTA */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '12px' }}>
              <button
                onClick={() => onSelectForScreening(job.id)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Sparkles size={15} /> Screen Resumes for This Role <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
