import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import axios from 'axios';

export default function ManagerDashboard() {
  const [groups, setGroups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dbLatency, setDbLatency] = useState(0);
  const [deadline, setDeadline] = useState('');
  const [supervisorAssign, setSupervisorAssign] = useState({});
  const [bulkSupervisor, setBulkSupervisor] = useState('');
  const [selectedGroups, setSelectedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('manage'); // manage, analytics, audit
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const resGroups = await axios.get(`${API_URL}/api/groups/all`, config);
      setGroups(resGroups.data);

      const resAnalytics = await axios.get(`${API_URL}/api/groups/analytics`, config);
      setAnalytics(resAnalytics.data);

      const resAudit = await axios.get(`${API_URL}/api/groups/audit-logs`, config);
      setAuditLogs(resAudit.data);

      const resPerf = await axios.get(`${API_URL}/api/groups/performance`, config);
      setDbLatency(resPerf.data.db_latency_ms);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (groupId) => {
    const supervisor = supervisorAssign[groupId] || 'Unassigned';
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/${groupId}/approve`, { supervisor }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Group Approved Successfully');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (groupId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/${groupId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Group Rejected');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDeadline = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/deadline`, {
        deadline_date: new Date(deadline).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Submission Deadline updated');
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkApprove = async () => {
    const groupIds = Object.keys(selectedGroups).filter(id => selectedGroups[id]);
    if (groupIds.length === 0 || !bulkSupervisor) {
      alert("Please select groups and enter a supervisor name");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/api/groups/bulk-approve`, {
        group_ids: groupIds,
        supervisor: bulkSupervisor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Bulk approval process completed');
      setSelectedGroups({});
      setBulkSupervisor('');
      fetchData();
    } catch (err) {
      console.error(err);
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
          <div className="sidebar-sub">Coordinator Console</div>
          <span className="role-badge role-manager">Manager</span>
        </div>
        <nav className="nav">
          <div className={`nav-item ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}><i className="ti ti-adjustments"></i> Manage Groups</div>
          <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><i className="ti ti-chart-bar"></i> Analytics</div>
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><i className="ti ti-history"></i> Audit Logs</div>
        </nav>
        <div style={{ padding: '16px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: '11px', color: 'green', marginBottom: '10px' }}><i className="ti ti-server"></i> DB Latency: {dbLatency}ms</div>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">FYP Coordinator Panel</div>
          <div className="topbar-right">
            <div className="avatar">RN</div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Ramsha Naveed</span>
          </div>
        </div>

        <div className="content">
          {message && <div className="notif notif-success"><i className="ti ti-check"></i> {message}</div>}

          {activeTab === 'manage' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-label">Total Groups</div><div className="stat-value">{analytics?.counts?.total || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value" style={{ color: '#BA7517' }}>{analytics?.counts?.pending || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Approved</div><div className="stat-value" style={{ color: '#27500A' }}>{analytics?.counts?.approved || 0}</div></div>
                <div className="stat-card"><div className="stat-label">Rejected</div><div className="stat-value" style={{ color: '#791F1F' }}>{analytics?.counts?.rejected || 0}</div></div>
              </div>

              <div className="card">
                <div className="card-title">Set Submission Deadline Limit</div>
                <form onSubmit={handleSetDeadline} style={{ display: 'flex', gap: '10px' }}>
                  <input className="form-input" type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Save Deadline</button>
                </form>
              </div>

              <div className="card">
                <div className="card-title">Group Registrations & Pipeline Approval</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Group Name</th>
                      <th>Topic</th>
                      <th>Members</th>
                      <th>Status</th>
                      <th>Supervisor Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((grp) => (
                      <tr key={grp._id}>
                        <td>
                          {grp.status === 'pending' && (
                            <input type="checkbox" checked={!!selectedGroups[grp._id]} onChange={(e) => setSelectedGroups({ ...selectedGroups, [grp._id]: e.target.checked })} />
                          )}
                        </td>
                        <td style={{ fontWeight: '500' }}>{grp.name}</td>
                        <td>{grp.topic}</td>
                        <td>
                          {grp.members?.map((m, i) => (
                            <div key={i} style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{m}</div>
                          ))}
                        </td>
                        <td>
                          <span className={`status ${grp.status === 'approved' ? 's-approved' : grp.status === 'rejected' ? 's-rejected' : 's-pending'}`}>
                            {grp.status}
                          </span>
                        </td>
                        <td>
                          {grp.status === 'pending' ? (
                            <input className="form-input" type="text" placeholder="e.g. Dr. Aamir" value={supervisorAssign[grp._id] || ''} onChange={(e) => setSupervisorAssign({ ...supervisorAssign, [grp._id]: e.target.value })} />
                          ) : (
                            grp.supervisor || 'None'
                          )}
                        </td>
                        <td>
                          {grp.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button className="btn btn-approve" onClick={() => handleApprove(grp._id)}><i className="ti ti-check"></i></button>
                              <button className="btn btn-reject" onClick={() => handleReject(grp._id)}><i className="ti ti-x"></i></button>
                            </div>
                          ) : (
                            <span>Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div className="card-title">Bulk Approve Actions</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input className="form-input" type="text" placeholder="Bulk Supervisor Name" value={bulkSupervisor} onChange={(e) => setBulkSupervisor(e.target.value)} />
                  <button className="btn btn-approve" onClick={handleBulkApprove}>Bulk Approve Checked</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div>
              <div className="card">
                <div className="card-title">Status Breakdown</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#EAF3DE" strokeWidth="20" />
                    <text x="60" y="66" textAnchor="middle" fontSize="18" fontWeight="600">{analytics.counts.total}</text>
                  </svg>
                  <div>
                    <div>Approved: {analytics.counts.approved}</div>
                    <div>Pending: {analytics.counts.pending}</div>
                    <div>Rejected: {analytics.counts.rejected}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Supervisor Assignment Distribution Load</div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Supervisor Name</th>
                      <th>Assigned Groups Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.supervisors?.map((sup, idx) => (
                      <tr key={idx}>
                        <td>{sup.name}</td>
                        <td>{sup.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="card">
              <div className="card-title">Approval Pipeline Audit Trail Logs</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td><strong>{log.action}</strong></td>
                      <td>{log.actor}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
