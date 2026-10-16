import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Job, JobCreatePayload } from '../types';
import { api } from '../services/api';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: Job | null;
  onJobSaved: (job: Job) => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  jobToEdit,
  onJobSaved,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [location, setLocation] = useState('Remote');
  const [minExp, setMinExp] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState('');
  const [prefInput, setPrefInput] = useState('');
  const [templates, setTemplates] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load job templates
    api.getJobTemplates().then((tpls) => setTemplates(tpls)).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title);
      setDepartment(jobToEdit.department);
      setEmploymentType(jobToEdit.employment_type);
      setLocation(jobToEdit.location || 'Remote');
      setMinExp(jobToEdit.min_experience_years || 0);
      setDescription(jobToEdit.description);
      setRequiredSkills(jobToEdit.required_skills || []);
      setPreferredSkills(jobToEdit.preferred_skills || []);
    } else {
      // Defaults
      setTitle('');
      setDepartment('Engineering');
      setEmploymentType('Full-time');
      setLocation('Remote');
      setMinExp(0);
      setDescription('');
      setRequiredSkills([]);
      setPreferredSkills([]);
    }
    setError(null);
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: any) => {
    setTitle(tpl.title);
    setDepartment(tpl.department);
    setEmploymentType(tpl.employment_type);
    setLocation(tpl.location || 'Remote');
    setMinExp(tpl.min_experience_years || 0);
    setDescription(tpl.description);
    setRequiredSkills([...tpl.required_skills]);
    setPreferredSkills([...(tpl.preferred_skills || [])]);
  };

  const handleAddReqSkill = () => {
    const s = reqInput.trim();
    if (s && !requiredSkills.includes(s)) {
      setRequiredSkills([...requiredSkills, s]);
      setReqInput('');
    }
  };

  const handleAddPrefSkill = () => {
    const s = prefInput.trim();
    if (s && !preferredSkills.includes(s)) {
      setPreferredSkills([...preferredSkills, s]);
      setPrefInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Job title is required.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }
    if (requiredSkills.length === 0) {
      setError('Please specify at least one required skill for matching.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: JobCreatePayload = {
      title: title.trim(),
      department: department.trim(),
      employment_type: employmentType,
      location: location.trim(),
      min_experience_years: Number(minExp),
      description: description.trim(),
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
    };

    try {
      let saved: Job;
      if (jobToEdit) {
        saved = await api.updateJob(jobToEdit.id, payload);
      } else {
        saved = await api.createJob(payload);
      }
      onJobSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save job description.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-bright)', margin: 0 }}>
            {jobToEdit ? 'Edit Job Description' : 'Create New Job Description'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Template Picker */}
          {!jobToEdit && templates.length > 0 && (
            <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Sparkles size={14} /> Quick-Fill from Pre-built Roles:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-bg)', border: '1px solid rgba(186, 60, 60, 0.25)', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI/ML Engineer Intern"
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering, Research"
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="input-field"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / Bengaluru"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Min Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={minExp}
                onChange={(e) => setMinExp(parseFloat(e.target.value) || 0)}
                className="input-field"
              />
            </div>
          </div>

          {/* Job Description Text */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Full Job Description * (Used for AI Match Analysis & Text Similarity)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste detailed job responsibilities, role expectations, and technical criteria..."
              className="input-field"
              style={{ minHeight: '120px' }}
              required
            />
          </div>

          {/* Required Skills */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Required Skills * (Candidates will be evaluated against each)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddReqSkill(); } }}
                placeholder="Type a skill and press Enter or click Add (e.g. Strategic Planning, Leadership)"
                className="input-field"
              />
              <button type="button" onClick={handleAddReqSkill} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {requiredSkills.map((s, idx) => (
                <span key={idx} className="skill-tag skill-tag-matched" style={{ paddingRight: '4px' }}>
                  {s}
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '4px' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Preferred Skills (Optional bonuses)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={prefInput}
                onChange={(e) => setPrefInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPrefSkill(); } }}
                placeholder="e.g. Project Delivery, Budget Management"
                className="input-field"
              />
              <button type="button" onClick={handleAddPrefSkill} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {preferredSkills.map((s, idx) => (
                <span key={idx} className="skill-tag skill-tag-pref" style={{ paddingRight: '4px' }}>
                  {s}
                  <button
                    type="button"
                    onClick={() => setPreferredSkills(preferredSkills.filter((_, i) => i !== idx))}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '4px' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
              {isSubmitting ? 'Saving...' : jobToEdit ? 'Save Changes' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
