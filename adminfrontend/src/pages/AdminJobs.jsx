import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import './AdminJobs.css';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    externalCompanyName: '',
    externalCompanyLogo: '',
    applyLink: '',
    description: '',
    skills: '',
    employmentType: 'full_time',
    workMode: 'remote',
    location: '',
    experienceMin: '',
    experienceMax: '',
    salaryMin: '',
    salaryMax: '',
  });

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching admin jobs", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert comma-separated skills to array
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const payload = { ...formData, skills: skillsArray };

      await api.post('/jobs', payload);
      setIsModalOpen(false);
      setFormData({
        title: '',
        externalCompanyName: '',
        externalCompanyLogo: '',
        applyLink: '',
        description: '',
        skills: '',
        employmentType: 'full_time',
        location: '',
      });
      fetchJobs();
    } catch (error) {
      console.error("Error creating job", error);
      alert("Failed to create job.");
    }
  };

  const [fetchKeyword, setFetchKeyword] = useState('');

  const handleFetchAIJobs = async () => {
    if (!fetchKeyword.trim()) {
      alert("Please enter a keyword first (e.g. Full Stack)");
      return;
    }
    try {
      setIsFetchingAI(true);
      const response = await api.post('/jobs/fetch-ai', { keyword: fetchKeyword });
      await fetchJobs();
      alert(`Successfully fetched ${response.data.count} real jobs for "${fetchKeyword}"!`);
      setFetchKeyword('');
    } catch (error) {
      console.error("Error fetching jobs", error);
      alert("Failed to fetch jobs.");
    } finally {
      setIsFetchingAI(false);
    }
  };

  return (
    <div className="admin-jobs-container">
      <div className="admin-jobs-header">
        <h2 className="gradient-text" style={{ fontSize: '1.8rem', margin: 0 }}>Third-Party Jobs</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            className="input-field"
            placeholder="e.g. React Developer"
            value={fetchKeyword}
            onChange={(e) => setFetchKeyword(e.target.value)}
            style={{ width: '200px', margin: 0 }}
          />
          <button
            className="btn-secondary"
            onClick={handleFetchAIJobs}
            disabled={isFetchingAI || !fetchKeyword.trim()}
          >
            {isFetchingAI ? 'Fetching...' : '✨ Fetch Jobs'}
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Job
          </button>
        </div>
      </div>

      <div className="admin-jobs-grid">
        {jobs.map(job => (
          <div key={job._id} className="glass-panel admin-job-card">
            <div className="job-card-header">
              <img
                src={job.externalCompanyLogo || 'https://via.placeholder.com/48'}
                alt={job.externalCompanyName}
                className="job-company-logo"
              />
              <div>
                <h3 style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{job.externalCompanyName}</p>
              </div>
            </div>
            <div className="job-actions">
              <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>Visit Link</a>
              <button onClick={() => handleDelete(job._id)} className="btn-danger" style={{ flex: 1, justifyContent: 'center' }}>Delete</button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>
            No third-party jobs posted yet.
          </div>
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target.className.includes('modal-overlay')) setIsModalOpen(false); }}>
          <div className="modal-content" style={{ maxWidth: '600px', position: 'relative' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="gradient-text" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add Third-Party Job</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Job Title</label>
                  <input
                    className="input-field"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Company Name</label>
                  <input
                    className="input-field"
                    value={formData.externalCompanyName}
                    onChange={e => setFormData({ ...formData, externalCompanyName: e.target.value })}
                    placeholder="e.g. Google"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Company Logo URL</label>
                  <input
                    className="input-field"
                    value={formData.externalCompanyLogo}
                    onChange={e => setFormData({ ...formData, externalCompanyLogo: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Location</label>
                  <input
                    className="input-field"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Remote, Bangalore"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Min Exp (Years)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.experienceMin}
                    onChange={e => setFormData({ ...formData, experienceMin: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Max Exp (Years)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.experienceMax}
                    onChange={e => setFormData({ ...formData, experienceMax: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Min Salary (LPA)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.salaryMin}
                    onChange={e => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Max Salary (LPA)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.salaryMax}
                    onChange={e => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="e.g. 8"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Employment Type</label>
                  <select
                    className="input-field"
                    value={formData.employmentType}
                    onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Work Mode</label>
                  <select
                    className="input-field"
                    value={formData.workMode}
                    onChange={e => setFormData({ ...formData, workMode: e.target.value })}
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on_site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Apply Link</label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.applyLink}
                  onChange={e => setFormData({ ...formData, applyLink: e.target.value })}
                  placeholder="https://careers.google.com/..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Skills (comma separated)</label>
                <input
                  className="input-field"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Description</label>
                <textarea
                  rows="3"
                  className="input-field"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Job description..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Job</button>
              </div>
            </form>
          </div>
        </div>
        , document.body)}
    </div>
  );
}
