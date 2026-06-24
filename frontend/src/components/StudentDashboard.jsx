import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';

export default function StudentDashboard() {
  const [group, setGroup] = useState(null);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [members, setMembers] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchGroup = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/api/groups/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroup(res.data);
    } catch (err) {
      setGroup(null);
    }
  };

  const fetchDeadline = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/groups/deadline`);
      if (res.data.deadline) {
        setDeadline(new Date(res.data.deadline));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchDeadline();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = await auth.currentUser.getIdToken();
      const membersList = members.split(',').map(m => m.trim()).filter(m => m !== '');
      membersList.push(auth.currentUser.email); // Auto-include self

      await axios.post(`${API_URL}/api/groups/create`, {
        name,
        topic,
        members: membersList
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('FYP Group registered successfully!');
      fetchGroup();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo"><i className="ti ti-school"></i> FYP ERP</div>
          <div className="sidebar-sub">University Portal</div>
          <span className="role-badge role-student">Student</span>
        </div>
        <nav className="nav">
          <div className="nav-item active"><i className="ti ti-layout-dashboard"></i> Dashboard</div>
        </nav>
        <div style={{ padding: '16px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">Student Dashboard</div>
          <div className="topbar-right">
            <div className="avatar">ST</div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{auth.currentUser?.email}</span>
          </div>
        </div>

        <div className="content">
          {deadline && (
            <div className="notif notif-info">
              <i className="ti ti-info-circle"></i>
              Submission Deadline set to: {deadline.toLocaleString()}
            </div>
          )}

          {group ? (
            <div>
              <div className="pipe-steps">
                <div className="pipe-step done">Group Created</div>
                <div className="pipe-step done">Topic Submitted</div>
                <div className={`pipe-step ${group.status === 'pending' ? 'active-step' : 'done'}`}>Under Review</div>
                <div className={`pipe-step ${group.status === 'approved' ? 'active-step' : ''} ${group.status === 'rejected' ? 's-rejected' : ''}`}>Approved</div>
                <div className={`pipe-step ${group.supervisor ? 'done' : ''}`}>Supervisor Assigned</div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Group</div>
                  <div className="stat-value">{group.name}</div>
                  <div className="stat-sub">{group.members?.length} members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Status</div>
                  <div className="stat-value" style={{ fontSize: '16px', color: group.status === 'approved' ? '#27500A' : group.status === 'rejected' ? '#791F1F' : '#BA7517' }}>
                    {group.status.toUpperCase()}
                  </div>
                  <div className="stat-sub">{group.status === 'pending' ? 'Awaiting coordinator' : 'Decision final'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Topic</div>
                  <div className="stat-value" style={{ fontSize: '14px' }}>{group.topic}</div>
                  <div className="stat-sub">Submitted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Supervisor</div>
                  <div className="stat-value" style={{ fontSize: '14px', color: group.supervisor ? '#111827' : 'var(--color-text-secondary)' }}>
                    {group.supervisor || 'TBA'}
                  </div>
                  <div className="stat-sub">Assigned on approval</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Registered Group Members</div>
                <div>
                  {group.members?.map((mem, idx) => (
                    <span className="member-chip" key={idx}><i className="ti ti-user"></i> {mem}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-title">Register FYP Group</div>
              {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
              {success && <div style={{ color: 'green', fontSize: '12px', marginBottom: '10px' }}>{success}</div>}
              <form onSubmit={handleCreateGroup}>
                <div className="form-row">
                  <label className="form-label">Group Name</label>
                  <input className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Project Alpha" />
                </div>
                <div className="form-row">
                  <label className="form-label">Project Topic</label>
                  <input className="form-input" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. AI-Based grading engine" />
                </div>
                <div className="form-row">
                  <label className="form-label">Teammate Emails (comma-separated, excluding yourself)</label>
                  <input className="form-input" value={members} onChange={(e) => setMembers(e.target.value)} placeholder="sara@uni.edu, khadijah@uni.edu" />
                </div>
                <button type="submit" className="btn btn-primary">Submit Group Registration</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
