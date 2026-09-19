import React, { useState, useEffect, useCallback } from 'react';
import {
  SearchIcon,
  SendIcon,
  ShieldIcon,
  BanIcon,
  UserCheckIcon,
  TrashIcon,
  CloseIcon,
  CheckIcon
} from './AdminIcons';

const ROLES = ['Property Owner', 'Verified Broker', 'Direct Builder', 'Admin'];

export default function AdminUserManager({ token, authHeaders, API_BASE, onRefresh }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [bannedFilter, setBannedFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState(null);
  const [toast, setToast] = useState('');
  const [notifModal, setNotifModal] = useState(null); // user object
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'general' });
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 15, search,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(bannedFilter !== 'all' && { isBanned: bannedFilter }),
      });
      const r = await fetch(`${API_BASE}/api/admin/users?${params}`, { headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, search, roleFilter, bannedFilter, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async () => {
    if (!banModal) return;
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/${banModal._id}/ban`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ reason: banReason || 'Violation of terms.' }),
      });
      const data = await r.json();
      if (data.success) {
        showToast(`User ${banModal.name} has been suspended.`);
        setBanModal(null);
        setBanReason('');
        fetchUsers();
      } else {
        showToast(data.error || 'Failed to suspend user');
      }
    } catch {
      showToast('Network error while suspending user');
    }
  };

  const handleUnban = async (user) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/${user._id}/unban`, { method: 'PATCH', headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        showToast(`User ${user.name} access has been restored.`);
        fetchUsers();
      } else {
        showToast(data.error || 'Failed to restore user');
      }
    } catch {
      showToast('Network error while restoring user');
    }
  };

  const handleRoleChange = async () => {
    if (!roleModal || !newRole) return;
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/${roleModal._id}/role`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ role: newRole }),
      });
      const data = await r.json();
      if (data.success) {
        showToast(`User role updated to ${newRole}`);
        setRoleModal(null);
        fetchUsers();
        onRefresh();
      } else {
        showToast(data.error || 'Failed to update role');
      }
    } catch {
      showToast('Network error');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name} and all their listings?`)) return;
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/${user._id}`, { method: 'DELETE', headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        showToast('User deleted successfully');
        fetchUsers();
        onRefresh();
      } else {
        showToast(data.error || 'Failed to delete user');
      }
    } catch {
      showToast('Network error');
    }
  };

  const handleSendNotif = async () => {
    if (!notifModal || !notifForm.title || !notifForm.message) return showToast('Title and message are required');
    try {
      const r = await fetch(`${API_BASE}/api/admin/notifications/send`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({
          target: 'users',
          userIds: [notifModal._id],
          ...notifForm,
        }),
      });
      const data = await r.json();
      if (data.success) {
        showToast(`Notification sent to ${notifModal.name}`);
        setNotifModal(null);
        setNotifForm({ title: '', message: '', type: 'general' });
      } else {
        showToast(data.error || 'Failed to send notification');
      }
    } catch {
      showToast('Network error');
    }
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'Admin') return 'admin-role-admin';
    if (role === 'Direct Builder') return 'admin-role-builder';
    if (role === 'Verified Broker') return 'admin-role-broker';
    return 'admin-role-owner';
  };

  return (
    <div className="admin-section">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">User Directory</h2>
          <p className="admin-section-subtitle">{total} registered portal accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters-bar">
        <div className="admin-search-input-wrap">
          <SearchIcon className="admin-search-icon" size={16} />
          <input
            className="admin-input admin-search-field"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select className="admin-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select className="admin-select" value={bannedFilter} onChange={e => { setBannedFilter(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          <option value="false">Active Only</option>
          <option value="true">Suspended Only</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading user registry...</span>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>Listings</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <React.Fragment key={user._id}>
                    <tr className={user.isBanned ? 'banned-row' : ''}>
                      <td>
                        <div
                          className="admin-user-cell"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                        >
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="admin-user-thumb" />
                          ) : (
                            <div className="admin-user-avatar-sm">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                          )}
                          <div>
                            <div className="admin-user-cell-name">{user.name}</div>
                            <div className="admin-meta-sub">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-role-badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className="admin-stat-pill">{user.listingCount || 0}</span>
                      </td>
                      <td className="admin-meta-sub">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        {user.isBanned ? (
                          <span className="admin-status-pill status-rejected">Suspended</span>
                        ) : (
                          <span className="admin-status-pill status-approved">Active</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-action-btns">
                          <button
                            className="admin-icon-btn"
                            onClick={() => setNotifModal(user)}
                            title="Send Direct Message"
                          >
                            <SendIcon size={14} />
                          </button>
                          <button
                            className="admin-icon-btn"
                            onClick={() => { setRoleModal(user); setNewRole(user.role); }}
                            title="Change User Role"
                          >
                            <ShieldIcon size={14} />
                          </button>
                          {user.isBanned ? (
                            <button
                              className="admin-icon-btn success"
                              onClick={() => handleUnban(user)}
                              title="Restore Access"
                            >
                              <UserCheckIcon size={14} />
                            </button>
                          ) : (
                            <button
                              className="admin-icon-btn danger"
                              onClick={() => { setBanModal(user); setBanReason(''); }}
                              title="Suspend User"
                            >
                              <BanIcon size={14} />
                            </button>
                          )}
                          {user.role !== 'Admin' && (
                            <button
                              className="admin-icon-btn danger"
                              onClick={() => handleDelete(user)}
                              title="Delete Account"
                            >
                              <TrashIcon size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedUser === user._id && (
                      <tr className="admin-expanded-row">
                        <td colSpan={6}>
                          <div className="admin-expanded-panel">
                            <div className="admin-user-detail-grid">
                              <div><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
                              <div><strong>Google Login:</strong> {user.googleId ? 'Linked' : 'Standard Email'}</div>
                              <div><strong>Email Status:</strong> {user.isVerified ? 'Verified' : 'Unverified'}</div>
                              <div><strong>Active Listings:</strong> {user.listingCount || 0} property posts</div>
                              {user.isBanned && (
                                <div style={{ color: 'var(--admin-danger)', gridColumn: 'span 2' }}>
                                  <strong>Suspension Reason:</strong> {user.banReason || 'Administrative decision'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-empty-table-cell">No users found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span className="admin-page-info">Page {page} of {totalPages}</span>
              <button
                className="admin-btn admin-btn-ghost admin-btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="admin-modal-overlay" onClick={() => setBanModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Suspend Account: {banModal.name}</h3>
              <button className="admin-modal-close" onClick={() => setBanModal(null)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <p className="admin-modal-desc">
              The user will be immediately logged out and unable to access the portal. Provide the reason below:
            </p>
            <textarea
              className="admin-textarea"
              rows={3}
              placeholder="e.g. Repeated spam listings or fraudulent contact details."
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
            />
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setBanModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={handleBan}>Confirm Suspension</button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {roleModal && (
        <div className="admin-modal-overlay" onClick={() => setRoleModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Change Role: {roleModal.name}</h3>
              <button className="admin-modal-close" onClick={() => setRoleModal(null)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="admin-radio-group">
              {ROLES.map(r => (
                <label key={r} className={`admin-radio-card ${newRole === r ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value={r}
                    checked={newRole === r}
                    onChange={() => setNewRole(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setRoleModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleRoleChange}>Update Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Notify Modal */}
      {notifModal && (
        <div className="admin-modal-overlay" onClick={() => setNotifModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Send Notification to {notifModal.name}</h3>
              <button className="admin-modal-close" onClick={() => setNotifModal(null)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Notification Type</label>
              <select
                className="admin-select"
                value={notifForm.type}
                onChange={e => setNotifForm(p => ({ ...p, type: e.target.value }))}
              >
                <option value="general">General Update</option>
                <option value="offer">Exclusive Offer</option>
                <option value="alert">Security / System Alert</option>
                <option value="reminder">Listing Status Reminder</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Subject / Title</label>
              <input
                className="admin-input"
                value={notifForm.title}
                onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Notification headline"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Message Body</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={notifForm.message}
                onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Type your message to this user..."
              />
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setNotifModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSendNotif}>Send Notification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
