import React, { useState, useEffect, useCallback } from 'react';
import {
  SearchIcon,
  CheckIcon,
  CloseIcon,
  StarIcon,
  TrendingIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  ShieldIcon,
  ZapIcon,
} from './AdminIcons';
import { getMediaUrl } from '../../config';

export default function AdminPropertyQueue({ token, authHeaders, API_BASE, onRefresh, onEditProperty, mode = 'pending' }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState(null); // propertyId
  const [rejectReason, setRejectReason] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [previewProp, setPreviewProp] = useState(null);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        approvalStatus: mode === 'pending' ? 'pending' : 'all',
        page,
        limit: 15,
        ...(search && { search }),
        ...(cityFilter !== 'all' && { city: cityFilter }),
      });
      const r = await fetch(`${API_BASE}/api/admin/properties?${params}`, { headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        setProperties(data.properties || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [mode, page, search, cityFilter, token]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({}),
      });
      const data = await r.json();
      if (data.success) {
        showToast('Property approved successfully');
        fetchProperties();
        onRefresh();
      } else {
        showToast(data.error || 'Failed to approve');
      }
    } catch {
      showToast('Network error while approving');
    }
    setActionLoading('');
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal + '-reject');
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${rejectModal}/reject`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ reason: rejectReason || 'Does not meet portal listing standards.' }),
      });
      const data = await r.json();
      if (data.success) {
        showToast('Property rejected and owner notified');
        setRejectModal(null);
        setRejectReason('');
        fetchProperties();
        onRefresh();
      } else {
        showToast(data.error || 'Failed to reject');
      }
    } catch {
      showToast('Network error');
    }
    setActionLoading('');
  };

  const handleToggleTopPick = async (id) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${id}/top-pick`, { method: 'PATCH', headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        showToast(data.message);
        fetchProperties();
      }
    } catch {
      showToast('Failed to update Top Pick status');
    }
  };

  const handleToggleTrending = async (id) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${id}/trending`, { method: 'PATCH', headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        showToast(`Trending status updated: ${data.trending ? 'Active' : 'Inactive'}`);
        fetchProperties();
      }
    } catch {
      showToast('Failed to update trending status');
    }
  };

  const handleToggleInstants = async (id) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${id}/instants`, { method: 'PATCH', headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        showToast(data.message || `Instants visibility updated`);
        fetchProperties();
        if (onRefresh) onRefresh();
      }
    } catch {
      showToast('Failed to toggle Instants visibility');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        showToast('Property deleted successfully');
        fetchProperties();
        onRefresh();
      }
    } catch {
      showToast('Failed to delete property');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return showToast('Please select at least one property');
    if (action === 'delete' && !window.confirm(`Delete ${selectedIds.length} properties permanently?`)) return;
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/bulk-action`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const data = await r.json();
      if (data.success) {
        showToast(`${data.message} (${data.affected} properties updated)`);
        setSelectedIds([]);
        fetchProperties();
        onRefresh();
      }
    } catch {
      showToast('Bulk action failed');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const allIds = properties.map(p => p._id);
    setSelectedIds(prev => prev.length === allIds.length ? [] : allIds);
  };

  return (
    <div className="admin-section">
      {toastMsg && <div className="admin-toast">{toastMsg}</div>}

      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            {mode === 'pending' ? 'Pending Approval Queue' : 'Property Inventory'}
          </h2>
          <p className="admin-section-subtitle">
            {total} {mode === 'pending' ? 'properties awaiting review' : 'total properties listed'}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-filters-bar">
        <div className="admin-search-input-wrap">
          <SearchIcon className="admin-search-icon" size={16} />
          <input
            className="admin-input admin-search-field"
            placeholder="Search by title, location, BHK..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select className="admin-select" value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}>
          <option value="all">All Cities</option>
          {['Mumbai', 'Delhi NCR', 'Dubai', 'Goa', 'Bangalore', 'Hyderabad', 'London'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {selectedIds.length > 0 && (
          <div className="admin-bulk-actions">
            <span className="admin-bulk-count">{selectedIds.length} Selected</span>
            {mode === 'pending' && (
              <>
                <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleBulkAction('approve')}>
                  <CheckIcon size={14} /> Approve All
                </button>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleBulkAction('reject')}>
                  <CloseIcon size={14} /> Reject All
                </button>
              </>
            )}
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleBulkAction('set-top-pick')}>
              <StarIcon size={14} /> Set Top Pick
            </button>
            <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ color: '#E71D2B', borderColor: '#FECDD3' }} onClick={() => handleBulkAction('show-instants')}>
              <ZapIcon size={14} /> Show in Instants
            </button>
            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleBulkAction('delete')}>
              <TrashIcon size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading inventory...</span>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === properties.length && properties.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Property Details & Type</th>
                  <th>City & Location</th>
                  <th>Area & Floor</th>
                  <th>Price / Demand</th>
                  <th>Contact / Lister</th>
                  <th>Approval</th>
                  <th>Badges</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(prop => (
                  <tr key={prop._id} className={selectedIds.includes(prop._id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(prop._id)}
                        onChange={() => toggleSelect(prop._id)}
                      />
                    </td>
                    <td>
                      <div className="admin-prop-cell" onClick={() => setPreviewProp(prop)}>
                        {prop.images?.[0] ? (
                          <div style={{ position: 'relative' }}>
                            <img
                              src={getMediaUrl(prop.images[0])}
                              alt=""
                              className="admin-prop-thumb"
                              onError={e => {
                                if (!e.target.dataset.fallback) {
                                  e.target.dataset.fallback = 'true';
                                  e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80';
                                }
                              }}
                            />
                            {prop.images.length > 1 && (
                              <span style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                fontSize: '9px',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}>
                                📷 {prop.images.length}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="admin-prop-thumb-placeholder">No Img</div>
                        )}
                        <div>
                          <div className="admin-prop-title">{prop.title}</div>
                          <div className="admin-prop-meta">
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{prop.bhk ? `${prop.bhk} BHK` : ''} {prop.propertyType}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>{prop.location?.city || '—'}</strong></div>
                      <div className="admin-meta-sub">{prop.location?.locality || prop.location?.address || ''}</div>
                    </td>
                    <td>
                      <div><strong>{prop.areaSqFt ? `${prop.areaSqFt.toLocaleString()} ${prop.areaUnit || 'Sq. Ft.'}` : '—'}</strong></div>
                      <div className="admin-meta-sub">{prop.floor || 'Standard Floor'}</div>
                    </td>
                    <td>
                      <div><strong style={{ color: 'var(--accent-primary)' }}>{prop.priceFormatted || '₹—'}</strong></div>
                      <div className="admin-meta-sub">{prop.pricePerSqFt || ''}</div>
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        {prop.listedBy?.avatar ? (
                          <img src={prop.listedBy.avatar} alt="" className="admin-user-thumb" />
                        ) : (
                          <div className="admin-user-avatar-sm">{(prop.contactDetails?.name || prop.listedBy?.name || 'U')[0]?.toUpperCase()}</div>
                        )}
                        <div>
                          <div className="admin-user-cell-name">{prop.contactDetails?.name || prop.listedBy?.name || 'Owner / Lister'}</div>
                          <div className="admin-meta-sub">
                            {prop.contactDetails?.phone || prop.relationshipManager?.phone || prop.listedBy?.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-pill status-${prop.approvalStatus || 'pending'}`}>
                        {prop.approvalStatus === 'approved' ? 'Live' : prop.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-flags">
                        {prop.isOyeListing && <span className="admin-flag oye">Oye Verified</span>}
                        {prop.showInInstants !== false && (
                          <span className="admin-flag" style={{ background: '#FFF0F1', color: '#E71D2B', border: '1px solid #FECDD3' }}>
                            In Instants
                          </span>
                        )}
                        {prop.topPick && <span className="admin-flag top">Top Pick</span>}
                        {prop.trending && <span className="admin-flag trend">Trending</span>}
                        {prop.listingStatus === 'sold' && <span className="admin-flag sold">Sold</span>}
                      </div>
                    </td>
                    <td className="admin-meta-sub">
                      {new Date(prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button
                          className="admin-icon-btn"
                          onClick={() => setPreviewProp(prop)}
                          title="Quick Preview"
                        >
                          <EyeIcon size={15} />
                        </button>

                        {/* Instants Toggle Button */}
                        <button
                          className={`admin-icon-btn ${prop.showInInstants !== false ? 'active-trend' : ''}`}
                          style={prop.showInInstants !== false ? { background: '#FFF0F1', color: '#E71D2B', borderColor: '#FECDD3' } : {}}
                          onClick={() => handleToggleInstants(prop._id)}
                          title={prop.showInInstants !== false ? "Visible in Instants (Click to remove)" : "Not in Instants (Click to show in Instants)"}
                        >
                          <ZapIcon size={15} filled={prop.showInInstants !== false} />
                        </button>

                        {prop.approvalStatus === 'pending' && (
                          <>
                            <button
                              className="admin-icon-btn success"
                              onClick={() => handleApprove(prop._id)}
                              disabled={actionLoading === prop._id + '-approve'}
                              title="Approve Listing"
                            >
                              <CheckIcon size={15} />
                            </button>
                            <button
                              className="admin-icon-btn danger"
                              onClick={() => { setRejectModal(prop._id); setRejectReason(''); }}
                              title="Reject Listing"
                            >
                              <CloseIcon size={15} />
                            </button>
                          </>
                        )}

                        <button
                          className={`admin-icon-btn ${prop.topPick ? 'active-star' : ''}`}
                          onClick={() => handleToggleTopPick(prop._id)}
                          title={prop.topPick ? 'Remove Top Pick' : 'Promote to Top Pick'}
                        >
                          <StarIcon size={15} filled={prop.topPick} />
                        </button>

                        <button
                          className={`admin-icon-btn ${prop.trending ? 'active-trend' : ''}`}
                          onClick={() => handleToggleTrending(prop._id)}
                          title="Toggle Trending Status"
                        >
                          <TrendingIcon size={15} />
                        </button>

                        <button
                          className="admin-icon-btn"
                          onClick={() => onEditProperty(prop)}
                          title="Edit Property"
                        >
                          <EditIcon size={15} />
                        </button>

                        <button
                          className="admin-icon-btn danger"
                          onClick={() => handleDelete(prop._id, prop.title)}
                          title="Delete Listing"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr>
                    <td colSpan={10} className="admin-empty-table-cell">
                      {mode === 'pending'
                        ? 'No pending properties in queue. All submissions reviewed!'
                        : 'No property listings found matching the criteria.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* Reject Modal */}
      {rejectModal && (
        <div className="admin-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Reject Property Submission</h3>
              <button className="admin-modal-close" onClick={() => setRejectModal(null)}>
                <CloseIcon size={18} />
              </button>
            </div>
            <p className="admin-modal-desc">
              Please specify the reason for rejection. This feedback will be delivered directly to the lister.
            </p>
            <textarea
              className="admin-textarea"
              placeholder="e.g. Incomplete pricing details, low-resolution photographs, or missing floor plans."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setRejectModal(null)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleReject}
                disabled={actionLoading.includes('-reject')}
              >
                Reject & Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Preview Modal - Complete 10-Point Spec */}
      {previewProp && (
        <div className="admin-modal-overlay" onClick={() => setPreviewProp(null)}>
          <div className="admin-modal admin-preview-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="admin-modal-header">
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {previewProp.propertyType} • {previewProp.bhk ? `${previewProp.bhk} BHK` : 'Commercial/Plot'}
                </span>
                <h3 className="admin-modal-title" style={{ marginTop: '2px' }}>{previewProp.title}</h3>
              </div>
              <button className="admin-modal-close" onClick={() => setPreviewProp(null)}>
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Photos Showcase */}
            <div className="admin-preview-images" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
              {previewProp.images?.slice(0, 4).map((img, i) => (
                <img
                  key={i}
                  src={getMediaUrl(img)}
                  alt=""
                  className="admin-preview-img"
                  onError={e => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = 'true';
                      e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
                    }
                  }}
                  style={{ height: '110px', width: '100%', objectFit: 'cover', borderRadius: '8px' }}
                />
              ))}
            </div>

            {/* 10-Point Grid */}
            <div className="admin-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="admin-preview-item">
                <span className="admin-preview-label">City</span>
                <span className="admin-preview-value">{previewProp.location?.city || '—'}</span>
              </div>
              <div className="admin-preview-item">
                <span className="admin-preview-label">Location / Address</span>
                <span className="admin-preview-value">
                  {previewProp.location?.address || previewProp.location?.locality || '—'}
                </span>
              </div>
              <div className="admin-preview-item">
                <span className="admin-preview-label">Floor Level</span>
                <span className="admin-preview-value">{previewProp.floor || 'Standard Floor'}</span>
              </div>

              <div className="admin-preview-item">
                <span className="admin-preview-label">Super / Built-up Area</span>
                <span className="admin-preview-value">
                  {previewProp.areaSqFt ? `${previewProp.areaSqFt.toLocaleString()} ${previewProp.areaUnit || 'Sq. Ft.'}` : '—'}
                </span>
              </div>
              <div className="admin-preview-item">
                <span className="admin-preview-label">Carpet Area</span>
                <span className="admin-preview-value">
                  {previewProp.carpetAreaSqFt ? `${previewProp.carpetAreaSqFt.toLocaleString()} ${previewProp.areaUnit || 'Sq. Ft.'}` : '—'}
                </span>
              </div>
              <div className="admin-preview-item">
                <span className="admin-preview-label">Price / Demand</span>
                <span className="admin-preview-value" style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>
                  {previewProp.priceFormatted || '₹—'}
                  {previewProp.pricePerSqFt && <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>({previewProp.pricePerSqFt})</span>}
                </span>
              </div>

              <div className="admin-preview-item">
                <span className="admin-preview-label">Contact Person</span>
                <span className="admin-preview-value">
                  {previewProp.contactDetails?.name || previewProp.relationshipManager?.name || previewProp.listedBy?.name || 'Owner'}
                </span>
              </div>
              <div className="admin-preview-item">
                <span className="admin-preview-label">Phone & WhatsApp</span>
                <span className="admin-preview-value">
                  {previewProp.contactDetails?.phone || previewProp.relationshipManager?.phone || '—'}
                </span>
              </div>
              <div className="admin-preview-item">
                <span className="admin-preview-label">Possession / Buying Terms</span>
                <span className="admin-preview-value">
                  {previewProp.buyingDetails?.possessionDate || previewProp.possession || 'Ready to Move'} ({previewProp.buyingDetails?.bookingAmount || '10% Token'})
                </span>
              </div>
            </div>

            {previewProp.amenities?.length > 0 && (
              <div className="admin-preview-amenities" style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Amenities:</span>
                {previewProp.amenities.map((a, i) => (
                  <span key={i} className="admin-tag">{a}</span>
                ))}
              </div>
            )}

            <div className="admin-modal-actions" style={{ marginTop: '18px' }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => setPreviewProp(null)}>
                Close
              </button>
              {previewProp.approvalStatus === 'pending' && (
                <>
                  <button
                    className="admin-btn admin-btn-success"
                    onClick={() => { handleApprove(previewProp._id); setPreviewProp(null); }}
                  >
                    <CheckIcon size={15} /> Approve Listing
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => { setRejectModal(previewProp._id); setPreviewProp(null); }}
                  >
                    <CloseIcon size={15} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
