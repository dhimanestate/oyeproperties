import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const BHK_OPTIONS = ['all', '3', '4', '5'];
  const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'penthouse', label: 'Penthouses' },
    { value: 'luxury villa', label: 'Luxury Villas' },
    { value: 'garden estate', label: 'Garden Estates' }
  ];

  const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'area', label: 'Largest Area' }
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      marginBottom: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px'
    }}>
      {/* Left: Quick BHK & Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Bedrooms:
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {BHK_OPTIONS.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => onFilterChange('bhk', b)}
              style={{
                background: filters.bhk === b ? '#E71D2B' : 'var(--bg-secondary)',
                color: filters.bhk === b ? '#ffffff' : 'var(--text-secondary)',
                border: filters.bhk === b ? '1px solid #E71D2B' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: filters.bhk === b ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: filters.bhk === b ? '0 2px 8px rgba(231, 29, 43, 0.22)' : 'none'
              }}
            >
              {b === 'all' ? 'All BHK' : `${b} BHK`}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} className="hidden-mobile" />

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} className="hidden-mobile">
          {TYPE_OPTIONS.slice(1).map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onFilterChange('propertyType', filters.propertyType === t.value ? 'all' : t.value)}
              style={{
                background: filters.propertyType === t.value ? '#E71D2B' : 'var(--bg-secondary)',
                color: filters.propertyType === t.value ? '#ffffff' : 'var(--text-secondary)',
                border: filters.propertyType === t.value ? '1px solid #E71D2B' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: filters.propertyType === t.value ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Results Count & Sort Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <strong style={{ color: 'var(--accent-primary)' }}>{totalResults}</strong> Residences Found
        </span>

        <select
          id="select-sort"
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Expandable Advanced Filters */}
      {filtersOpen && (
        <div style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* BHK Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>Bedrooms:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {BHK_OPTIONS.map(b => (
                <button
                  key={b}
                  id={`filter-bhk-${b}`}
                  onClick={() => onFilterChange('bhk', b)}
                  style={{
                    background: filters.bhk === b ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: filters.bhk === b ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: filters.bhk === b ? '0 2px 8px rgba(231, 29, 43, 0.22)' : 'none'
                  }}
                >
                  {b === 'all' ? 'All' : b === '5' ? '5+ BHK' : `${b} BHK`}
                </button>
              ))}
            </div>
          </div>

          {/* Type + Budget Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            {/* Property Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Type:</span>
              <select
                id="select-type"
                value={filters.propertyType}
                onChange={(e) => onFilterChange('propertyType', e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-primary)',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Budget Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>Budget:</span>
              <input
                id="slider-max-price"
                type="range"
                min="50000000"
                max="650000000"
                step="10000000"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer', flex: 1 }}
              />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-primary)', minWidth: '52px', flexShrink: 0 }}>
                {filters.maxPrice >= 650000000 ? 'Any' : `₹${(filters.maxPrice / 10000000).toFixed(0)} Cr`}
              </span>
            </div>
          </div>

          {/* Results + Reset Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{totalResults}</span> curated estates
            </span>
            <button
              onClick={onResetFilters}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Always visible result count when filters closed */}
      {!filtersOpen && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{totalResults}</span> curated luxury estates
        </div>
      )}
    </div>
  );
}
