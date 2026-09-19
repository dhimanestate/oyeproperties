import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../../config';
import AdminDashboard from './AdminDashboard';
import AdminPropertyQueue from './AdminPropertyQueue';
import AdminPropertyEditor from './AdminPropertyEditor';
import AdminUserManager from './AdminUserManager';
import AdminNotifications from './AdminNotifications';
import AdminContentCMS from './AdminContentCMS';
import AdminAreaPromotion from './AdminAreaPromotion';
import {
  DashboardIcon,
  QueueIcon,
  BuildingIcon,
  PlusIcon,
  UsersIcon,
  BellIcon,
  CMSIcon,
  MapPinIcon,
  LeadsIcon,
  MenuIcon,
  CloseIcon,
  ArrowLeftIcon,
  ShieldIcon
} from './AdminIcons';

const NAV_ITEMS = [
  { id: 'dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { id: 'queue', icon: QueueIcon, label: 'Approval Queue' },
  { id: 'properties', icon: BuildingIcon, label: 'All Properties' },
  { id: 'add-property', icon: PlusIcon, label: 'Add Oye Listing' },
  { id: 'users', icon: UsersIcon, label: 'Users' },
  { id: 'notifications', icon: BellIcon, label: 'Notifications' },
  { id: 'cms', icon: CMSIcon, label: 'Content CMS' },
  { id: 'area', icon: MapPinIcon, label: 'Area Promotions' },
  { id: 'leads', icon: LeadsIcon, label: 'Leads' },
];

export default function AdminPanel({ currentUser, onClose, token }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);

  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/stats`, { headers: authHeaders });
      const data = await r.json();
      if (data.success) setStats(data);
    } catch (e) {
      console.error('Failed to fetch admin stats:', e);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleEditProperty = (prop) => {
    setEditingProperty(prop);
    setActiveSection('add-property');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId !== 'add-property') setEditingProperty(null);
    setMobileMenuOpen(false);
  };

  const renderSection = () => {
    const sharedProps = { token, authHeaders, API_BASE };

    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard stats={stats} onRefresh={fetchStats} onNavigate={setActiveSection} authHeaders={authHeaders} />;
      case 'queue':
        return <AdminPropertyQueue {...sharedProps} onRefresh={fetchStats} onEditProperty={handleEditProperty} mode="pending" />;
      case 'properties':
        return <AdminPropertyQueue {...sharedProps} onRefresh={fetchStats} onEditProperty={handleEditProperty} mode="all" />;
      case 'add-property':
        return (
          <AdminPropertyEditor
            {...sharedProps}
            editingProperty={editingProperty}
            onSuccess={() => { setEditingProperty(null); setActiveSection('properties'); fetchStats(); }}
            onCancel={() => { setEditingProperty(null); setActiveSection('properties'); }}
          />
        );
      case 'users':
        return <AdminUserManager {...sharedProps} onRefresh={fetchStats} />;
      case 'notifications':
        return <AdminNotifications {...sharedProps} />;
      case 'cms':
        return <AdminContentCMS {...sharedProps} />;
      case 'area':
        return <AdminAreaPromotion {...sharedProps} />;
      case 'leads':
        return <AdminLeads {...sharedProps} />;
      default:
        return <AdminDashboard stats={stats} onRefresh={fetchStats} onNavigate={setActiveSection} authHeaders={authHeaders} />;
    }
  };

  const currentNav = NAV_ITEMS.find(n => n.id === activeSection) || NAV_ITEMS[0];

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        {/* Mobile Header Bar */}
        <div className="admin-mobile-header">
          <button
            className="admin-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
          <div className="admin-mobile-title">
            <span className="admin-mobile-brand-dot"></span>
            <span>{currentNav.label}</span>
          </div>
          <button className="admin-mobile-exit-btn" onClick={onClose} title="Exit Admin Panel">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div className="admin-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="admin-sidebar-header">
            {!sidebarCollapsed && (
              <div className="admin-brand">
                <div className="admin-brand-logo-badge">
                  <ShieldIcon size={18} />
                </div>
                <div>
                  <div className="admin-brand-name">Oye Admin</div>
                  <div className="admin-brand-role">Super Admin Console</div>
                </div>
              </div>
            )}
            <button
              className="admin-collapse-btn desktop-only"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
            <button
              className="admin-collapse-btn mobile-only"
              onClick={() => setMobileMenuOpen(false)}
              title="Close menu"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <nav className="admin-nav">
            {NAV_ITEMS.map(item => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id || (activeSection === 'add-property' && item.id === 'add-property');
              return (
                <button
                  key={item.id}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className="admin-nav-icon">
                    <IconComponent size={18} />
                  </span>
                  {!sidebarCollapsed && <span className="admin-nav-label">{item.label}</span>}
                  {!sidebarCollapsed && item.id === 'queue' && stats?.stats?.pendingProperties > 0 && (
                    <span className="admin-nav-badge">{stats.stats.pendingProperties}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="admin-sidebar-footer">
            {!sidebarCollapsed && (
              <div className="admin-user-info">
                <div className="admin-user-avatar">{currentUser?.name?.[0]?.toUpperCase() || 'A'}</div>
                <div className="admin-user-details">
                  <div className="admin-user-name">{currentUser?.name || 'Administrator'}</div>
                  <div className="admin-user-role">Super Admin</div>
                </div>
              </div>
            )}
            <button className="admin-close-btn" onClick={onClose} title="Exit Admin Panel">
              <ArrowLeftIcon size={16} />
              {!sidebarCollapsed && <span>Exit Portal</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          <div className="admin-main-inner">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Inline Leads Component ───────────────────────────────────────────────────
function AdminLeads({ authHeaders, API_BASE }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/leads`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        if (data.success) { setLeads(data.leads || []); setTotal(data.total || 0); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Leads & Inquiries</h2>
          <p className="admin-section-subtitle">Manage customer inquiries received across all property listings</p>
        </div>
        <span className="admin-stat-pill">{total} Total Leads</span>
      </div>
      {loading ? (
        <div className="admin-loading">Loading inquiries...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Property</th>
                <th>Inquiry Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead._id || i}>
                  <td><strong>{lead.name}</strong></td>
                  <td>{lead.phone}</td>
                  <td className="admin-truncate">{lead.propertyTitle || lead.propertyId}</td>
                  <td className="admin-truncate">{lead.message}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty-table-cell">No leads or inquiries recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
