import { Job, Candidate, DashboardStats, ScreeningSession, AuditLog } from '../types';

export const SHOWCASE_JOBS: Job[] = [
  {
    id: 'job-sample-aiml-001',
    title: 'Senior Operations & Strategy Lead',
    department: 'Business Operations',
    description: 'We are looking for an ambitious Operations & Strategy Lead to drive cross-functional initiatives, optimize business processes, and direct operational planning. Demonstrated expertise in Strategic Planning, Project Management, Operations Management, Data Analysis, Leadership, and Process Optimization.',
    required_skills: [
      'Strategic Planning',
      'Project Management',
      'Operations Management',
      'Data Analysis',
      'Leadership',
      'Process Optimization',
      'Risk Assessment',
      'Stakeholder Management'
    ],
    preferred_skills: [
      'Budget Management',
      'Change Management',
      'Market Research',
      'Performance Metrics'
    ],
    min_experience_years: 3.0,
    location: 'San Francisco / Hybrid',
    employment_type: 'Full-time',
    created_at: '2026-10-16T06:00:08Z',
    updated_at: '2026-10-16T16:10:00Z'
  },
  {
    id: 'job-sample-aiml-002',
    title: 'Machine Learning Engineer',
    department: 'AI & Data Platforms',
    description: 'Seeking a seasoned ML Engineer to design and train NLP embedding models, build vector search retrieval systems, and optimize low-latency Python inference pipelines. Strong proficiency with PyTorch, Scikit-Learn, Transformers, and MLOps required.',
    required_skills: [
      'Python',
      'PyTorch',
      'Scikit-Learn',
      'NLP',
      'Vector Embeddings',
      'FastAPI',
      'Docker'
    ],
    preferred_skills: [
      'Kubernetes',
      'MLflow',
      'CI/CD',
      'Cosine Similarity'
    ],
    min_experience_years: 4.0,
    location: 'Remote / United States',
    employment_type: 'Full-time',
    created_at: '2026-10-16T08:00:00Z',
    updated_at: '2026-10-16T16:10:00Z'
  }
];

export const SHOWCASE_CANDIDATES: Candidate[] = [
  {
    id: 'demo-6a8dcdce',
    rank: 1,
    name: 'Aria Vance',
    email: 'aria.vance@example.edu',
    phone: '+1 (555) 234-5678',
    estimated_experience: '4+ years',
    estimated_education: 'M.B.A. in Operations & Strategy',
    job_id: 'job-sample-aiml-001',
    job_title: 'Senior Operations & Strategy Lead',
    similarity_score: 92.4,
    required_skills_matched: [
      'Strategic Planning',
      'Project Management',
      'Operations Management',
      'Data Analysis',
      'Leadership',
      'Process Optimization',
      'Risk Assessment',
      'Stakeholder Management'
    ],
    required_skills_missing: [],
    preferred_skills_matched: [
      'Budget Management',
      'Change Management',
      'Market Research',
      'Performance Metrics'
    ],
    evidence_snippets: {
      'Strategic Planning': 'Proven expertise in Strategic Planning, Project Management, Operations Management, Data Analysis, Leadership, and Process Optimization.',
      'Project Management': 'Spearheaded enterprise-wide Strategic Planning and Project Management across multi-functional business units.',
      'Operations Management': 'Directed operational cadence and resource planning across 4 product groups.',
      'Data Analysis': 'Conducted quantitative Data Analysis to identify workflow bottlenecks, driving a 32% efficiency improvement.',
      'Leadership': 'Led and mentored a cross-functional squad of 14 analysts and project leads.',
      'Process Optimization': 'Managed Stakeholder Management communications and oversaw continuous Process Optimization initiatives.',
      'Risk Assessment': 'Directed Risk Assessment audits and established transparent KPI Performance Metrics for leadership.',
      'Stakeholder Management': 'Aligned executive leadership and department directors on quarterly OKRs.'
    },
    session_id: 'session-demo-001',
    required_skill_coverage: 100.0,
    explanation: 'Comprehensive coverage across all 8 required competencies with direct verified citations. Exceptional vector similarity score in operational planning, strategy delivery, and quantitative analysis.',
    warnings: [],
    extracted_text: 'Experienced Operations and Strategy Lead with 4+ years of experience directing organizational initiatives and operational excellence. Proven expertise in Strategic Planning, Project Management, Operations Management, Data Analysis, Leadership, and Process Optimization.',
    original_filename: 'aria_vance_strategy_lead.pdf',
    stored_filename: 'demo_aria_vance.pdf',
    shortlist_status: true,
    is_demo: true,
    created_at: '2026-10-16T15:45:30Z',
    updated_at: '2026-10-16T15:45:30Z',
    stage: 'Interview',
    interview_notes: {
      scheduled_date: '2026-10-24T14:30:00',
      status: 'Scheduled',
      interviewer: 'Elena Rostova (VP of People & Ops)',
      rating: 5,
      notes: 'Exceptional strategic depth and clear cross-functional leadership track record.',
      feedback: 'Very strong candidate. Recommend fast-tracking to final round.',
      next_steps: 'Offer preparation',
      updated_at: '2026-10-16T15:45:30Z'
    }
  },
  {
    id: 'demo-7ff7f3ad',
    rank: 2,
    name: 'Sophia Patel',
    email: 'sophia.patel@datahub.net',
    phone: '+1 (555) 345-6789',
    estimated_experience: '3+ years',
    estimated_education: 'B.S. in Economics & Analytics',
    job_id: 'job-sample-aiml-001',
    job_title: 'Senior Operations & Strategy Lead',
    similarity_score: 84.8,
    required_skills_matched: [
      'Strategic Planning',
      'Data Analysis',
      'Leadership',
      'Process Optimization',
      'Risk Assessment',
      'Stakeholder Management'
    ],
    required_skills_missing: [
      'Project Management',
      'Operations Management'
    ],
    preferred_skills_matched: [
      'Market Research',
      'Performance Metrics'
    ],
    evidence_snippets: {
      'Strategic Planning': 'Performed rigorous Data Analysis and financial modeling to support Strategic Planning.',
      'Data Analysis': 'Strong command of Data Analysis, Process Optimization, Risk Assessment, and Performance Metrics.',
      'Leadership': 'Synthesized weekly Risk Assessment reports and tracked Performance Metrics dashboards for leadership.',
      'Process Optimization': 'Identified operational bottlenecks and implemented automated Process Optimization workflows.',
      'Risk Assessment': 'Performed risk simulations and contingency modeling for supply chain partners.',
      'Stakeholder Management': 'Presented monthly performance telemetry to C-suite stakeholders.'
    },
    session_id: 'session-demo-001',
    required_skill_coverage: 75.0,
    explanation: 'Strong analytical background with verified evidence in 6 out of 8 required skills. High scores in data-driven process optimization and risk modeling. Formal project management certification not explicitly detected.',
    warnings: [],
    extracted_text: 'Analytical and detail-oriented Operations Analyst with 3+ years of experience transforming business processes through data-driven insights. Strong command of Data Analysis, Process Optimization, Risk Assessment, and Performance Metrics.',
    original_filename: 'sophia_patel_operations.pdf',
    stored_filename: 'demo_sophia_patel.pdf',
    shortlist_status: true,
    is_demo: true,
    created_at: '2026-10-16T15:45:30Z',
    updated_at: '2026-10-16T15:45:30Z',
    stage: 'Shortlisted',
    interview_notes: {
      status: 'Pending',
      notes: 'Strong quantitative background. Verify formal Agile or Scrum certification in technical screening.',
      rating: 4,
      updated_at: '2026-10-16T15:45:30Z'
    }
  },
  {
    id: 'demo-ada736d3',
    rank: 3,
    name: 'Liam Chen',
    email: 'liam.chen@devmail.org',
    phone: '+1 (555) 876-5432',
    estimated_experience: '3+ years',
    estimated_education: 'B.S. in Management & Business Operations',
    job_id: 'job-sample-aiml-001',
    job_title: 'Senior Operations & Strategy Lead',
    similarity_score: 68.2,
    required_skills_matched: [
      'Strategic Planning',
      'Project Management',
      'Operations Management',
      'Leadership',
      'Stakeholder Management'
    ],
    required_skills_missing: [
      'Data Analysis',
      'Process Optimization',
      'Risk Assessment'
    ],
    preferred_skills_matched: [
      'Budget Management',
      'Change Management'
    ],
    evidence_snippets: {
      'Strategic Planning': 'Demonstrated competence in Strategic Planning, Project Management, Operations Management, and Leadership.',
      'Project Management': 'Directed cross-functional teams in executing strategic Project Management and Operations Management initiatives.',
      'Operations Management': 'Overhauled operational workflows across international logistics centers.',
      'Leadership': 'Championed team Leadership and conducted regular Stakeholder Management reviews with executive sponsors.',
      'Stakeholder Management': 'Oversaw client communications and executive review meetings.'
    },
    session_id: 'session-demo-001',
    required_skill_coverage: 62.5,
    explanation: 'Solid operational management and leadership track record. Missing quantitative proof points for Data Analysis and formal Risk Assessment. Good candidate for operations-focused track.',
    warnings: [],
    extracted_text: 'Operations Director with 3+ years of experience managing business operations, project delivery, and team leadership. Demonstrated competence in Strategic Planning, Project Management, Operations Management, and Leadership.',
    original_filename: 'liam_chen_ops_lead.pdf',
    stored_filename: 'demo_liam_chen.pdf',
    shortlist_status: false,
    is_demo: true,
    created_at: '2026-10-16T15:45:30Z',
    updated_at: '2026-10-16T15:45:30Z',
    stage: 'Reviewed'
  }
];

export const SHOWCASE_STATS: DashboardStats = {
  total_resumes: 3,
  analyzed_candidates: 3,
  shortlisted_candidates: 2,
  avg_match_score: 81.8,
  highest_match_score: 92.4,
  saved_jobs_count: 2,
  score_distribution: [
    { range: '90-100%', count: 1, label: 'Exceptional Match' },
    { range: '75-89%', count: 1, label: 'Strong Fit' },
    { range: '60-74%', count: 1, label: 'Moderate Fit' },
    { range: '40-59%', count: 0, label: 'Partial Fit' },
    { range: '0-39%', count: 0, label: 'Low Overlap' }
  ],
  status_breakdown: [
    { name: 'Shortlisted', value: 2, color: '#059669' },
    { name: 'In Review', value: 1, color: '#087EA4' }
  ],
  top_matched_skills: [
    { skill: 'Strategic Planning', count: 3 },
    { skill: 'Leadership', count: 3 },
    { skill: 'Stakeholder Management', count: 3 },
    { skill: 'Data Analysis', count: 2 },
    { skill: 'Process Optimization', count: 2 }
  ],
  top_missing_skills: [
    { skill: 'Risk Assessment', count: 1 },
    { skill: 'Data Analysis', count: 1 },
    { skill: 'Operations Management', count: 1 }
  ],
  recent_activity: [
    {
      id: 'demo-6a8dcdce',
      name: 'Aria Vance',
      job_title: 'Senior Operations & Strategy Lead',
      similarity_score: 92.4,
      shortlist_status: true,
      created_at: '2026-10-16T15:45:30Z',
      is_demo: true
    },
    {
      id: 'demo-7ff7f3ad',
      name: 'Sophia Patel',
      job_title: 'Senior Operations & Strategy Lead',
      similarity_score: 84.8,
      shortlist_status: true,
      created_at: '2026-10-16T15:45:30Z',
      is_demo: true
    },
    {
      id: 'demo-ada736d3',
      name: 'Liam Chen',
      job_title: 'Senior Operations & Strategy Lead',
      similarity_score: 68.2,
      shortlist_status: false,
      created_at: '2026-10-16T15:45:30Z',
      is_demo: true
    }
  ],
  is_demo_mode: true,
  demo_count: 3
};

export const SHOWCASE_SESSIONS: ScreeningSession[] = [
  {
    id: 'session-demo-001',
    name: 'Leadership & Strategy Cohort (Fall 2026)',
    job_id: 'job-sample-aiml-001',
    job_title: 'Senior Operations & Strategy Lead',
    job_snapshot: {
      title: 'Senior Operations & Strategy Lead',
      department: 'Business Operations',
      required_skills: [
        'Strategic Planning',
        'Project Management',
        'Operations Management',
        'Data Analysis',
        'Leadership',
        'Process Optimization',
        'Risk Assessment',
        'Stakeholder Management'
      ],
      preferred_skills: ['Budget Management', 'Change Management']
    },
    candidate_ids: ['demo-6a8dcdce', 'demo-7ff7f3ad', 'demo-ada736d3'],
    candidate_count: 3,
    avg_score: 81.8,
    created_at: '2026-10-16T15:45:00Z',
    updated_at: '2026-10-16T15:45:00Z'
  }
];

export const SHOWCASE_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2026-10-16T15:45:30Z',
    event_type: 'batch_screen',
    job_title: 'Senior Operations & Strategy Lead',
    description: 'Screened 3 resumes against Senior Operations & Strategy Lead benchmark.'
  },
  {
    id: 'audit-002',
    timestamp: '2026-10-16T15:50:00Z',
    event_type: 'stage_update',
    job_title: 'Senior Operations & Strategy Lead',
    candidate_id: 'demo-6a8dcdce',
    candidate_name: 'Aria Vance',
    description: 'Updated pipeline stage to Interview and scheduled technical conversation.'
  }
];
