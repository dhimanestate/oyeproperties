import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPinIcon,
  StarIcon,
  EditIcon,
  RefreshIcon,
  ShieldIcon,
  TrendingIcon,
  CloseIcon,
  CheckIcon
} from './AdminIcons';
import { ALL_INDIAN_CITIES } from '../../data/indiaGeographicDirectory';

const CITIES = ALL_INDIAN_CITIES;

export default function AdminAreaPromotion({ token, authHeaders, API_BASE }) {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [allCityProps, setAllCityProps] = useState([]);
  const [pinnedProps, setPinnedProps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [scoreModal, setScoreModal] = useState(null);
  const [newScore, setNewScore] = useState(0);
  const [topPicksData, setTopPicksData] = useState([]);
  const [activeTab, setActiveTab] = useState('city-pins');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCityProps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ city: selectedCity, limit: 40, sort: 'newest', approvalStatus: 'approved' });
      const [propsRes, pinnedRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/properties?${params}`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/area-promotions?city=${encodeURIComponent(selectedCity)}`, { headers: authHeaders }),
      ]);
      const propsData = await propsRes.json();
      const pinnedData = await pinnedRes.json();

      if (propsData.success) setAllCityProps(propsData.properties || []);
      if (pinnedData.success) setPinnedProps(pinnedData.pinned || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedCity, token]);

  const fetchTopPicks = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties?topPick=true&limit=20`, { headers: authHeaders });
      const data = await r.json();
      if (data.success) setTopPicksData(data.properties || []);
    } catch { }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'city-pins') fetchCityProps();
    else fetchTopPicks();
  }, [activeTab, fetchCityProps, fetchTopPicks]);

  const pinToCity = async (propId, cities, score = 0) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${propId}/pin-area`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ cities, promotionScore: score }),
      });
      const data = await r.json();
      if (data.success) {
        showToast('Area pinning preference updated');
        fetchCityProps();
      } else {
        showToast(data.error || 'Failed to update pinning');
      }
    } catch {
      showToast('Network error while pinning property');
    }
  };

  const handleTogglePin = async (prop) => {
    const currentlyPinned = prop.pinnedInCities || [];
    let newCities;
    if (currentlyPinned.includes(selectedCity)) {
      newCities = currentlyPinned.filter(c => c !== selectedCity);
    } else {
      newCities = [...currentlyPinned, selectedCity];
    }
    await pinToCity(prop._id, newCities, prop.promotionScore || 0);
  };

  const handleUpdateScore = async () => {
    if (!scoreModal) return;
    await pinToCity(scoreModal._id, scoreModal.pinnedInCities || [], newScore);
    setScoreModal(null);
  };

  const handleTopPickToggle = async (propId) => {
    try {
      const r = await fetch(`${API_BASE}/api/admin/properties/${propId}/top-pick`, { method: 'PATCH', headers: authHeaders });
      const data = await r.json();
      if (data.success) {
        showToast(data.message);
        fetchTopPicks();
      }
    } catch {
      showToast('Failed to update Top Pick status');
    }
  };

  const cityPinnedList = allCityProps.filter(p => (p.pinnedInCities || []).includes(selectedCity));
  const cityUnpinnedList = allCityProps.filter(p => !(p.pinnedInCities || []).includes(selectedCity));

  return (
    <div className="admin-section">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Area Promotions & Spotlights</h2>
          <p className="admin-section-subtitle">Boost specific listings to top placement in targeted city categories</p>
        </div>
        <div className="admin-tab-group">
          <button
            className={`admin-tab ${activeTab === 'city-pins' ? 'active' : ''}`}
            onClick={() => setActiveTab('city-pins')}
          >
            <MapPinIcon size={14} /> City Pins
          </button>
          <button
            className={`admin-tab ${activeTab === 'top-picks' ? 'active' : ''}`}
            onClick={() => setActiveTab('top-picks')}
          >
            <StarIcon size={14} /> Top Picks
          </button>
        </div>
      </div>

      {activeTab === 'city-pins' ? (
        <>
          {/* City Selector */}
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="admin-card-title" style={{ marginBottom: '1rem' }}>Select Target Market</h3>
            <div className="admin-city-selector">
              {CITIES.map(c => (
                <button
                  key={c}
                  className={`admin-city-btn ${selectedCity === c ? 'active' : ''}`}
                  onClick={() => setSelectedCity(c)}
                >
                  <MapPinIcon size={14} />
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <span>Loading {selectedCity} listings...</span>
            </div>
          ) : (
            <>
              {/* Pinned Properties */}
              <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div className="admin-card-header">
                  <div>
                    <h3 className="admin-card-title">Pinned in {selectedCity} ({cityPinnedList.length})</h3>
                    <p className="admin-meta-sub">Ranked and ordered by custom promotion weight</p>
                  </div>
                </div>
                {cityPinnedList.length === 0 ? (
                  <div className="admin-empty-state">
                    No properties currently pinned in {selectedCity}. Pin listings from the inventory below.
                  </div>
                ) : (
                  <div className="admin-promotion-grid">
                    {cityPinnedList
                      .sort((a, b) => (b.promotionScore || 0) - (a.promotionScore || 0))
                      .map(prop => (
                        <div key={prop._id} className="admin-promo-card pinned">
                          {prop.images?.[0] ? (
                            <img src={prop.images[0]} alt="" className="admin-promo-img" />
                          ) : (
                            <div className="admin-prop-thumb-placeholder">No Image</div>
                          )}
                          <div className="admin-promo-info">
                            <div className="admin-promo-title">{prop.title}</div>
                            <div className="admin-meta-sub">{prop.location?.locality} · {prop.priceFormatted}</div>
                            <div className="admin-promo-score">
                              Promotion Weight: <strong>{prop.promotionScore || 0}</strong>
                            </div>
                          </div>
                          <div className="admin-promo-actions">
                            <button
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => { setScoreModal(prop); setNewScore(prop.promotionScore || 0); }}
                            >
                              <EditIcon size={13} /> Weight
                            </button>
                            <button
                              className="admin-btn admin-btn-danger admin-btn-sm"
                              onClick={() => handleTogglePin(prop)}
                            >
                              <CloseIcon size={13} /> Unpin
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Available to Pin */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Available Listings in {selectedCity} ({cityUnpinnedList.length})</h3>
                </div>
                <div className="admin-promotion-grid">
                  {cityUnpinnedList.map(prop => (
                    <div key={prop._id} className="admin-promo-card">
                      {prop.images?.[0] ? (
                        <img src={prop.images[0]} alt="" className="admin-promo-img" />
                      ) : (
                        <div className="admin-prop-thumb-placeholder">No Image</div>
                      )}
                      <div className="admin-promo-info">
                        <div className="admin-promo-title">{prop.title}</div>
                        <div className="admin-meta-sub">{prop.location?.locality} · {prop.priceFormatted}</div>
                        <div className="admin-promo-flags">
                          {prop.isOyeListing && <span className="admin-flag oye">Oye Verified</span>}
                          {prop.topPick && <span className="admin-flag top">Top Pick</span>}
                        </div>
                      </div>
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => handleTogglePin(prop)}
                      >
                        <MapPinIcon size={13} /> Pin to Feed
                      </button>
                    </div>
                  ))}
                  {cityUnpinnedList.length === 0 && (
                    <div className="admin-empty-state">All active listings in {selectedCity} are already pinned.</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Score Modal */}
          {scoreModal && (
            <div className="admin-modal-overlay" onClick={() => setScoreModal(null)}>
              <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h3 className="admin-modal-title">Set Promotion Priority Weight</h3>
                  <button className="admin-modal-close" onClick={() => setScoreModal(null)}>
                    <CloseIcon size={18} />
                  </button>
                </div>
                <p className="admin-modal-desc">
                  Higher weight gives this property higher prominence in the {selectedCity} feed (Scale: 0 to 100).
                </p>
                <div style={{ fontWeight: 600, color: 'var(--admin-text)', marginBottom: '0.75rem' }}>
                  {scoreModal.title}
                </div>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  max={100}
                  value={newScore}
                  onChange={e => setNewScore(parseInt(e.target.value) || 0)}
                />
                <div className="admin-city-bar-wrap" style={{ marginTop: '0.75rem' }}>
                  <div className="admin-city-bar" style={{ width: `${newScore}%`, background: 'var(--admin-primary)' }} />
                </div>
                <div className="admin-modal-actions">
                  <button className="admin-btn admin-btn-ghost" onClick={() => setScoreModal(null)}>Cancel</button>
                  <button className="admin-btn admin-btn-primary" onClick={handleUpdateScore}>Save Weight</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Top Picks Tab */
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Curated Top Picks ({topPicksData.length})</h3>
              <p className="admin-meta-sub">
                Top picks receive featured card styling and priority placement on the homepage showcase.
              </p>
            </div>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchTopPicks}>
              <RefreshIcon size={14} /> Refresh
            </button>
          </div>

          <div className="admin-promotion-grid" style={{ marginTop: '1rem' }}>
            {topPicksData.map(prop => (
              <div key={prop._id} className="admin-promo-card pinned">
                {prop.images?.[0] ? (
                  <img src={prop.images[0]} alt="" className="admin-promo-img" />
                ) : (
                  <div className="admin-prop-thumb-placeholder">No Image</div>
                )}
                <div className="admin-promo-info">
                  <div className="admin-promo-title">{prop.title}</div>
                  <div className="admin-meta-sub">{prop.location?.city} · {prop.priceFormatted}</div>
                  <div className="admin-promo-flags">
                    {prop.isOyeListing && <span className="admin-flag oye">Oye Verified</span>}
                    {prop.trending && <span className="admin-flag trend">Trending</span>}
                  </div>
                </div>
                <button
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => handleTopPickToggle(prop._id)}
                >
                  <StarIcon size={13} /> Remove
                </button>
              </div>
            ))}
            {topPicksData.length === 0 && (
              <div className="admin-empty-state">
                No Top Picks defined yet. Go to Inventory and toggle the star icon on any property to feature it.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
