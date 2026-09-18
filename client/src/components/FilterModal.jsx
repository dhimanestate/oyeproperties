import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Check, RotateCcw, MapPin, Building2, Home, Compass, IndianRupee } from 'lucide-react';

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  currentCity,
  onSelectCity
}) {
  if (!isOpen) return null;

  // Local draft state so user can tweak and click "Apply"
  const [draft, setDraft] = useState({
    purpose: filters.purpose || 'all',
    propertyType: filters.propertyType || 'all',
    bhk: filters.bhk || 'all',
    maxPrice: filters.maxPrice || 650000000,
    facing: filters.facing || 'all',
    status: filters.status || 'all',
    city: currentCity || 'all'
  });

  useEffect(() => {
    setDraft({
      purpose: filters.purpose || 'all',
      propertyType: filters.propertyType || 'all',
      bhk: filters.bhk || 'all',
      maxPrice: filters.maxPrice || 650000000,
      facing: filters.facing || 'all',
      status: filters.status || 'all',
      city: currentCity || 'all'
    });
  }, [filters, currentCity, isOpen]);

  const PURPOSES = [
    { value: 'all', label: 'All Listings' },
    { value: 'buy', label: 'Buy (Sale)' },
    { value: 'rent', label: 'Rent (Lease)' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const PROPERTY_TYPES = [
    { value: 'all', label: 'All Categories' },
    { value: 'penthouse', label: 'Penthouses' },
    { value: 'sky-villa', label: 'Sky-Villas' },
    { value: 'luxury villa', label: 'Luxury Villas' },
    { value: 'garden estate', label: 'Garden Estates' },
    { value: 'duplex', label: 'Duplex Suites' },
    { value: 'commercial', label: 'Commercial / Office' }
  ];

  const CITIES = [
    { value: 'all', label: 'All Cities' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Delhi NCR', label: 'Delhi NCR' },
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Goa', label: 'Goa' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Hyderabad', label: 'Hyderabad' }
  ];

  const BHK_OPTIONS = [
    { value: 'all', label: 'Any BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4 BHK' },
    { value: '5', label: '5+ BHK / Suite' }
  ];

  const FACING_OPTIONS = [
    { value: 'all', label: 'Any Direction' },
    { value: 'North-East', label: 'North-East' },
    { value: 'Sea Facing', label: 'Sea Facing' },
    { value: 'Park Facing', label: 'Park Facing' },
    { value: 'Golf Course', label: 'Golf Course Facing' },
    { value: 'North', label: 'North' },
    { value: 'East', label: 'East' }
  ];

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'Ready to Move', label: 'Ready to Move' },
    { value: 'Under Construction', label: 'Under Construction' },
    { value: 'New Launch', label: 'New Launch' }
  ];

  const BUDGET_PRESETS = [
    { label: 'Under ₹10 Cr', value: 100000000 },
    { label: 'Under ₹25 Cr', value: 250000000 },
    { label: 'Under ₹45 Cr', value: 450000000 },
    { label: 'Max (₹65 Cr+)', value: 650000000 }
  ];

  const formatPriceDisplay = (val) => {
    if (val >= 650000000) return '₹65+ Cr (Any Budget)';
    if (val >= 10000000) return `Up to ₹${(val / 10000000).toFixed(1)} Cr`;
    return `Up to ₹${(val / 100000).toFixed(0)} Lakhs`;
  };

  const handleApply = () => {
    if (draft.city !== currentCity) {
      onSelectCity(draft.city);
    }
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters = {
      purpose: 'all',
      propertyType: 'all',
      bhk: 'all',
      maxPrice: 650000000,
      facing: 'all',
      status: 'all',
      city: 'all'
    };
    setDraft(defaultFilters);
    onResetFilters();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-box filter-modal-box"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="filter-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="filter-header-icon-box">
              <SlidersHorizontal size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Filter Properties & Instants
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Refine by rent/buy, property type, location, budget & facing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="filter-modal-close-btn" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Filter Sections */}
        <div className="filter-modal-body">
          {/* Section 1: Listing Purpose (Buy / Rent / Commercial) */}
          <div className="filter-section">
            <div className="filter-section-title">
              <Home size={14} color="#E71D2B" />
              <span>Listing Purpose</span>
            </div>
            <div className="filter-chips-grid">
              {PURPOSES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, purpose: p.value }))}
                  className={`filter-chip ${draft.purpose === p.value ? 'active' : ''}`}
                >
                  {draft.purpose === p.value && <Check size={13} />}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Location / Prime Market */}
          <div className="filter-section">
            <div className="filter-section-title">
              <MapPin size={14} color="#E71D2B" />
              <span>Location / City</span>
            </div>
            <div className="filter-chips-grid">
              {CITIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, city: c.value }))}
                  className={`filter-chip ${draft.city === c.value ? 'active' : ''}`}
                >
                  {draft.city === c.value && <Check size={13} />}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Property Type / Category */}
          <div className="filter-section">
            <div className="filter-section-title">
              <Building2 size={14} color="#E71D2B" />
              <span>Property Category</span>
            </div>
            <div className="filter-chips-grid">
              {PROPERTY_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, propertyType: t.value }))}
                  className={`filter-chip ${draft.propertyType === t.value ? 'active' : ''}`}
                >
                  {draft.propertyType === t.value && <Check size={13} />}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Configuration / BHK */}
          <div className="filter-section">
            <div className="filter-section-title">
              <span>Configuration / Bedrooms</span>
            </div>
            <div className="filter-chips-grid">
              {BHK_OPTIONS.map(b => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, bhk: b.value }))}
                  className={`filter-chip ${draft.bhk === b.value ? 'active' : ''}`}
                >
                  {draft.bhk === b.value && <Check size={13} />}
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Budget Range */}
          <div className="filter-section">
            <div className="filter-section-title" style={{ justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IndianRupee size={14} color="#E71D2B" />
                <span>Max Budget:</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatPriceDisplay(draft.maxPrice)}
              </span>
            </div>

            <div style={{ padding: '8px 0 12px 0' }}>
              <input
                type="range"
                min="30000000"
                max="650000000"
                step="20000000"
                value={draft.maxPrice}
                onChange={(e) => setDraft(prev => ({ ...prev, maxPrice: parseInt(e.target.value, 10) }))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div className="filter-chips-grid">
              {BUDGET_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, maxPrice: preset.value }))}
                  className={`filter-chip ${draft.maxPrice === preset.value ? 'active' : ''}`}
                >
                  {draft.maxPrice === preset.value && <Check size={13} />}
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Facing Direction */}
          <div className="filter-section">
            <div className="filter-section-title">
              <Compass size={14} color="#b45309" />
              <span>Facing Direction</span>
            </div>
            <div className="filter-chips-grid">
              {FACING_OPTIONS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, facing: f.value }))}
                  className={`filter-chip ${draft.facing === f.value ? 'active' : ''}`}
                >
                  {draft.facing === f.value && <Check size={13} />}
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 7: Possession / Status */}
          <div className="filter-section">
            <div className="filter-section-title">
              <span>Possession Status</span>
            </div>
            <div className="filter-chips-grid">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, status: s.value }))}
                  className={`filter-chip ${draft.status === s.value ? 'active' : ''}`}
                >
                  {draft.status === s.value && <Check size={13} />}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="filter-modal-footer">
          <button
            type="button"
            onClick={handleReset}
            className="filter-reset-btn"
          >
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn-primary filter-apply-btn"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
