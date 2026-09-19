import React, { useState } from 'react';
import {
  BuildingIcon,
  QueueIcon,
  UsersIcon,
  LeadsIcon,
  StarIcon,
  ShieldIcon,
  RefreshIcon,
  BanIcon,
  PlusIcon,
  BellIcon,
  CMSIcon,
  MapPinIcon
} from './AdminIcons';

const STAT_CARDS = [
  { key: 'totalProperties', label: 'Total Properties', icon: BuildingIcon, subKey: 'newPropertiesThisWeek', subLabel: 'this week' },
  { key: 'pendingProperties', label: 'Pending Approval', icon: QueueIcon, subKey: null, subLabel: 'awaiting review', urgent: true },
  { key: 'totalUsers', label: 'Registered Users', icon: UsersIcon, subKey: 'newUsersThisWeek', subLabel: 'this week' },
  { key: 'totalLeads', label: 'Total Leads', icon: LeadsIcon, subKey: null, subLabel: 'all inquiries' },
  { key: 'oyeListings', label: 'Oye Listings', icon: ShieldIcon, subKey: null, subLabel: 'official listings' },
  { key: 'topPicks', label: 'Top Picks', icon: StarIcon, subKey: null, subLabel: 'curated highlights' },
  { key: 'pendingRefresh', label: 'Need Refresh', icon: RefreshIcon, subKey: null, subLabel: '10-day overdue', urgent: true },
  { key: 'bannedUsers', label: 'Suspended Users', icon: BanIcon, subKey: null, subLabel: 'access restricted' },
];

export default function AdminDashboard({ stats, onRefresh, onNavigate }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const s = stats?.stats || {};
  const recentActivity = stats?.recentActivity || [];
  const cityBreakdown = stats?.cityBreakdown || [];

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Dashboard Overview</h2>
          <p className="admin-section-subtitle">Real-time performance metrics and operations overview</p>
        </div>
        <button
          className={`admin-btn admin-btn-ghost ${refreshing ? 'loading' : ''}`}
          onClick={handleRefresh}
        >
          <RefreshIcon size={16} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {STAT_CARDS.map(card => {
          const IconComponent = card.icon;
          const count = s[card.key] ?? 0;
          const isUrgent = card.urgent && count > 0;
          return (
            <div
              key={card.key}
              className={`admin-stat-card ${isUrgent ? 'urgent' : ''}`}
              onClick={() => {
                if (card.key === 'pendingProperties') onNavigate('queue');
                else if (card.key === 'totalUsers' || card.key === 'bannedUsers') onNavigate('users');
                else if (card.key === 'pendingRefresh') onNavigate('queue');
                else if (card.key === 'totalProperties' || card.key === 'oyeListings' || card.key === 'topPicks') onNavigate('properties');
                else if (card.key === 'totalLeads') onNavigate('leads');
              }}
            >
              <div className="admin-stat-icon-wrap">
                <IconComponent size={20} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">{s[card.key] ?? '—'}</div>
                <div className="admin-stat-label">{card.label}</div>
                {card.subKey && s[card.subKey] !== undefined ? (
                  <div className="admin-stat-sub">+{s[card.subKey]} {card.subLabel}</div>
                ) : (
                  <div className="admin-stat-sub">{card.subLabel}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two column: Recent Activity + City Breakdown */}
      <div className="admin-dashboard-grid">
        {/* Recent Submissions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Submissions</h3>
            <button className="admin-card-action-link" onClick={() => onNavigate('queue')}>
              View All Queue
            </button>
          </div>
          <div className="admin-activity-list">
            {recentActivity.length === 0 && (
              <div className="admin-empty-state">No recent submissions found</div>
            )}
            {recentActivity.map((item, i) => (
              <div key={item._id || i} className="admin-activity-item">
                <div className="admin-activity-avatar">
                  {item.listedBy?.avatar ? (
                    <img src={item.listedBy.avatar} alt="" />
                  ) : (
                    <span>{(item.listedBy?.name || 'U')[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="admin-activity-info">
                  <div className="admin-activity-title">{item.title}</div>
                  <div className="admin-activity-meta">
                    by {item.listedBy?.name || 'Unknown'} · {item.location?.city || 'Location N/A'}
                  </div>
                </div>
                <span className={`admin-status-pill status-${item.approvalStatus || 'pending'}`}>
                  {item.approvalStatus === 'approved' ? 'Live' : item.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* City Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Properties by City</h3>
            <button className="admin-card-action-link" onClick={() => onNavigate('area')}>
              Manage Area
            </button>
          </div>
          <div className="admin-city-list">
            {cityBreakdown.length === 0 && (
              <div className="admin-empty-state">No city data available yet</div>
            )}
            {cityBreakdown.map((city, i) => {
              const maxCount = cityBreakdown[0]?.count || 1;
              const pct = Math.round((city.count / maxCount) * 100);
              return (
                <div key={city._id || i} className="admin-city-row">
                  <div className="admin-city-name">{city._id || 'Other'}</div>
                  <div className="admin-city-bar-wrap">
                    <div className="admin-city-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="admin-city-count">{city.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Quick Actions</h3>
        </div>
        <div className="admin-quick-actions">
          <button className="admin-quick-action" onClick={() => onNavigate('queue')}>
            <div className="admin-quick-action-icon">
              <QueueIcon size={20} />
            </div>
            <div className="admin-quick-action-text">
              <strong>Review Queue</strong>
              <small>{s.pendingProperties || 0} awaiting approval</small>
            </div>
          </button>

          <button className="admin-quick-action" onClick={() => onNavigate('add-property')}>
            <div className="admin-quick-action-icon">
              <PlusIcon size={20} />
            </div>
            <div className="admin-quick-action-text">
              <strong>Add Oye Listing</strong>
              <small>Publish verified listing</small>
            </div>
          </button>

          <button className="admin-quick-action" onClick={() => onNavigate('notifications')}>
            <div className="admin-quick-action-icon">
              <BellIcon size={20} />
            </div>
            <div className="admin-quick-action-text">
              <strong>Send Alerts</strong>
              <small>Broadcast to users</small>
            </div>
          </button>

          <button className="admin-quick-action" onClick={() => onNavigate('cms')}>
            <div className="admin-quick-action-icon">
              <CMSIcon size={20} />
            </div>
            <div className="admin-quick-action-text">
              <strong>Content CMS</strong>
              <small>Banners, tags & config</small>
            </div>
          </button>

          <button className="admin-quick-action" onClick={() => onNavigate('area')}>
            <div className="admin-quick-action-icon">
              <MapPinIcon size={20} />
            </div>
            <div className="admin-quick-action-text">
              <strong>Area Promotions</strong>
              <small>Pin & boost localities</small>
            </div>
          </button>

          <button className="admin-quick-action" onClick={() => onNavigate('users')}>
            <div className="admin-quick-action-icon">
              <UsersIcon size={20} />
            </div>
            <div className="admin-quick-action-text">
              <strong>User Directory</strong>
              <small>{s.totalUsers || 0} registered members</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
