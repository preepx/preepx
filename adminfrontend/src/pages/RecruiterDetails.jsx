import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ArrowLeft, Building2, User, Mail, Briefcase, MapPin, 
  ClipboardCheck, Clock, CheckCircle, Shield, AlertTriangle, CreditCard
} from 'lucide-react';
import './Dashboard.css';

const RecruiterDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [assignSlug, setAssignSlug] = useState('growth');
  const [assignDays, setAssignDays] = useState(30);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/recruiters/${id}`);
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch recruiter details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const approveCompany = async () => {
    try {
      if (!data._id) return;
      await api.patch(`/recruiters/${data._id}/verification`, { status: "VERIFIED" });
      setData({ ...data, verificationStatus: "VERIFIED" });
      alert("Company successfully approved!");
    } catch (err) {
      alert("Failed to approve company");
    }
  };

  if (loading) return <div className="loading">Loading recruiter details...</div>;
  if (error) return <div className="error-alert">{error}</div>;
  if (!data) return <div className="error-alert">No data found</div>;

  const recruiter = data.primaryRecruiterId || {};
  const stats = data.stats || { totalJobs: 0, totalApplications: 0, totalAssessments: 0 };
  const jobs = data.jobs || [];
  const assessments = data.assessments || [];
  const subscription = data.subscription;
  const payments = data.payments || [];
  const usage = data.usage || {};

  const assignPlan = async () => {
    try {
      await api.patch(`/recruiters/${data._id}/plan`, { planSlug: assignSlug, days: Number(assignDays) });
      alert("Plan assigned");
      const res = await api.get(`/recruiters/${id}`);
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign plan");
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/recruiters" className="btn-icon" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </Link>
          <Building2 size={32} className="accent-icon" />
          <div>
            <h1>{data.name || 'Company Profile'}</h1>
            <p className="text-secondary">{data.industry || 'No industry specified'} · {data.companySize || 'Size not specified'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {data.verificationStatus === 'PENDING' && (
            <button onClick={approveCompany} className="filter-btn" style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', fontWeight: 'bold' }}>
              Approve Verification
            </button>
          )}
          <div className={`status-badge badge-${data.verificationStatus?.toLowerCase()}`} style={{ fontSize: 14, padding: '6px 14px' }}>
            {data.verificationStatus === 'VERIFIED' ? <CheckCircle size={16} /> : 
             data.verificationStatus === 'PENDING' ? <Clock size={16} /> : <AlertTriangle size={16} />}
            {data.verificationStatus}
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue"><Briefcase size={24} /></div>
          <div>
            <h3>{stats.totalJobs}</h3>
            <p className="text-secondary">Jobs Posted</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper amber"><User size={24} /></div>
          <div>
            <h3>{stats.totalApplications}</h3>
            <p className="text-secondary">Applications Received</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper green"><ClipboardCheck size={24} /></div>
          <div>
            <h3>{stats.totalAssessments}</h3>
            <p className="text-secondary">Assessments Created</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue"><CreditCard size={24} /></div>
          <div>
            <h3>{subscription?.planName || recruiter.planName || "None"}</h3>
            <p className="text-secondary">
              Jobs this month: {usage.jobPostsThisMonth ?? stats.jobPostsThisMonth ?? 0}
              {usage.jobPostsLimit < 0 ? " / Unlimited" : ` / ${usage.jobPostsLimit ?? "—"}`}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel content-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          {['overview', 'jobs', 'assessments', 'billing'].map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              style={{ textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: '1.5rem' }}>
          {tab === 'overview' && (
            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} className="text-primary" /> Recruiter Info
                </h3>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px' }}>
                  <p style={{ marginBottom: 8 }}><strong>Name:</strong> {recruiter.fullName || 'N/A'}</p>
                  <p style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong>Email:</strong> {recruiter.email} 
                    {recruiter.isVerified && <Shield size={14} className="text-success" />}
                  </p>
                  <p style={{ marginBottom: 8 }}><strong>Phone:</strong> {recruiter.phone || 'N/A'}</p>
                  <p><strong>Designation:</strong> {recruiter.designation || 'N/A'}</p>
                  <p style={{ marginTop: 8 }}><strong>Plan:</strong> {recruiter.planName || subscription?.planName || 'None'} ({recruiter.planStatus || subscription?.status || 'none'})</p>
                </div>
              </div>
              
              <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} className="text-primary" /> Company Info
                </h3>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px' }}>
                  <p style={{ marginBottom: 8 }}><strong>Website:</strong> {data.website || 'N/A'}</p>
                  <p style={{ marginBottom: 8 }}><strong>LinkedIn:</strong> {data.linkedin || 'N/A'}</p>
                  <p style={{ marginBottom: 8 }}><strong>Official Email:</strong> {data.officialEmail || 'N/A'}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12 }}>
                    {data.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title & Role</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No jobs posted yet</td></tr>
                  ) : jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <strong>{job.title}</strong>
                        <br /><span className="text-secondary" style={{ fontSize: 12 }}>{job.role}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} className="text-secondary" /> {job.location || 'Remote'}
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{job.employmentType?.replace('_', ' ')}</td>
                      <td>
                        <span className={`status-badge ${job.status === 'published' ? 'badge-verified' : 'badge-suspended'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'billing' && (
            <div>
              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 12 }}>
                  <h3 style={{ marginTop: 0 }}>Active plan</h3>
                  <p><strong>{subscription?.planName || 'None'}</strong> · {subscription?.status || 'none'}</p>
                  <p className="text-secondary">Expires: {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN') : '—'}</p>
                  <p>Job posts this month: {usage.jobPostsThisMonth ?? 0}{usage.jobPostsLimit < 0 ? ' / Unlimited' : ` / ${usage.jobPostsLimit ?? '—'}`}</p>
                  <p>Total jobs: {usage.totalJobs ?? jobs.length}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 12 }}>
                  <h3 style={{ marginTop: 0 }}>Assign / extend plan</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <select className="input-field" value={assignSlug} onChange={(e) => setAssignSlug(e.target.value)}>
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <input className="input-field" type="number" min={1} value={assignDays} onChange={(e) => setAssignDays(e.target.value)} style={{ width: 100 }} />
                    <button type="button" className="filter-btn active" onClick={assignPlan}>Assign</button>
                  </div>
                  <p className="text-secondary" style={{ fontSize: 12 }}>Used for Enterprise grants or complimentary extensions. Logged in payment history as admin grant.</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No payments yet</td></tr>
                    ) : payments.map((p) => (
                      <tr key={p._id}>
                        <td>{new Date(p.createdAt).toLocaleString('en-IN')}</td>
                        <td>{p.type}</td>
                        <td>{p.planName}</td>
                        <td>{p.amountInr ? `₹${p.amountInr}` : '—'}</td>
                        <td>{p.status}</td>
                        <td style={{ fontSize: 12 }}>{p.razorpayPaymentId || p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === 'assessments' && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Candidate / Application</th>
                    <th>Status</th>
                    <th>Scores</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No assessments created yet</td></tr>
                  ) : assessments.map((assessment) => (
                    <tr key={assessment._id}>
                      <td>
                        <strong>App ID: {assessment.applicationId?.toString().substring(0, 8)}...</strong>
                        <br /><span className="text-secondary" style={{ fontSize: 12 }}>User ID: {assessment.userId?.toString().substring(0, 8)}...</span>
                      </td>
                      <td>
                        <span className={`status-badge ${assessment.status === 'completed' ? 'badge-verified' : 'badge-pending'}`}>
                          {assessment.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          MCQ: {assessment.mcqScore}%<br/>
                          Coding: {assessment.codingScore}%<br/>
                          <strong>Overall: {assessment.overallScore}%</strong>
                        </div>
                      </td>
                      <td>{new Date(assessment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .filter-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .filter-btn:hover { background: rgba(255,255,255,0.05); }
        .filter-btn.active { background: rgba(99,102,241,0.2); color: #818cf8; border-color: rgba(99,102,241,0.4); }
        .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .badge-pending { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .badge-verified { background: rgba(16,185,129,0.15); color: #10b981; }
        .badge-rejected { background: rgba(239,68,68,0.15); color: #ef4444; }
        .badge-suspended { background: rgba(148,163,184,0.15); color: #94a3b8; }
        .stat-icon-wrapper.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .text-primary { color: #818cf8; }
        .text-success { color: #10b981; }
      `}</style>
    </div>
  );
};

export default RecruiterDetails;
