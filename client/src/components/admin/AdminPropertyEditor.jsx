import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
  StarIcon,
  TrendingIcon,
  ShieldIcon,
  UploadCloudIcon,
  ImageIcon,
  VideoIcon
} from './AdminIcons';
import {
  ALL_INDIAN_CITIES,
  FARIDABAD_SECTORS_AND_AREAS,
  POPULAR_CITY_AREAS,
  PROPERTY_TYPES_CATALOGUE,
  BUILDER_FLOOR_LEVELS
} from '../../data/indiaGeographicDirectory';
import { compressImageFiles, processVideoFileStrict } from '../../utils/mediaCompressor';

const CITIES = ALL_INDIAN_CITIES;
const PROPERTY_TYPES = PROPERTY_TYPES_CATALOGUE;
const AMENITIES_LIST = [
  'Smart Home', '24/7 Security', 'Covered Parking', 'Infinity Pool', 'Club House',
  'Gym', 'Spa', 'Concierge', 'Helipad', 'Private Elevator', 'Sea View', 'Golf Course',
  'Tennis Court', 'Kids Play Area', 'Business Lounge', 'EV Charging',
];

export default function AdminPropertyEditor({ token, authHeaders, API_BASE, editingProperty, onSuccess, onCancel }) {
  const isEdit = Boolean(editingProperty);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    title: '',
    tagline: '',
    propertyType: 'Apartment',
    bhk: 3,
    baths: 3,
    price: '',
    priceFormatted: '',
    areaSqFt: '',
    areaUnit: 'Sq. Ft.',
    carpetAreaSqFt: '',
    status: 'Ready to Move',
    possession: 'Immediate',
    furnishing: 'Fully Furnished',
    facing: 'North-East',
    floor: '4th of 14 Floors',
    purpose: 'buy',
    location: { state: 'Maharashtra', city: 'Mumbai', locality: '', address: '' },
    floorPricing: [],
    builder: { name: '', experience: '', reraId: '' },
    contactDetails: { name: '', phone: '', email: '', whatsapp: '', role: 'Property Owner', preferredTime: '10 AM - 7 PM' },
    buyingDetails: { bookingAmount: '10% Token', possessionDate: 'Immediate', ownershipType: 'Freehold', paymentTerms: 'Flexible / Bank Approved', demandNegotiable: true },
    amenities: [],
    images: [''],
    reelVideo: '',
    topPick: false,
    trending: false,
    showInInstants: true,
    isOyeListing: true,
    approvalStatus: 'approved',
    pinnedInCities: [],
    promotionScore: 0,
    adminNotes: '',
    listingStatus: 'available',
    financials: { estimatedMonthlyRent: '', grossRentalYield: '', projectedCapitalAppreciation5Yr: '' },
    neighborhoodRadar: { walkScore: 85, transitScore: 80, schools: '', hospital: '', airport: '', lifestyle: '' },
  });

  useEffect(() => {
    if (editingProperty) {
      setForm(prev => ({
        ...prev,
        ...editingProperty,
        areaUnit: editingProperty.areaUnit || 'Sq. Ft.',
        floor: editingProperty.floor || prev.floor,
        location: editingProperty.location || prev.location,
        builder: editingProperty.builder || prev.builder,
        contactDetails: {
          ...prev.contactDetails,
          name: editingProperty.contactDetails?.name || editingProperty.relationshipManager?.name || editingProperty.builder?.name || '',
          phone: editingProperty.contactDetails?.phone || editingProperty.relationshipManager?.phone || '',
          whatsapp: editingProperty.contactDetails?.whatsapp || editingProperty.relationshipManager?.whatsapp || '',
          role: editingProperty.contactDetails?.role || editingProperty.relationshipManager?.role || 'Property Owner',
          email: editingProperty.contactDetails?.email || '',
          preferredTime: editingProperty.contactDetails?.preferredTime || '10 AM - 7 PM',
        },
        buyingDetails: {
          ...prev.buyingDetails,
          bookingAmount: editingProperty.buyingDetails?.bookingAmount || '10% Token',
          possessionDate: editingProperty.buyingDetails?.possessionDate || editingProperty.possession || 'Immediate',
          ownershipType: editingProperty.buyingDetails?.ownershipType || 'Freehold',
          paymentTerms: editingProperty.buyingDetails?.paymentTerms || 'Flexible / Bank Approved',
          demandNegotiable: editingProperty.buyingDetails?.demandNegotiable ?? true,
        },
        amenities: editingProperty.amenities || [],
        floorPricing: editingProperty.floorPricing || [],
        showInInstants: editingProperty.showInInstants !== false,
        images: editingProperty.images?.length ? editingProperty.images : [''],
        financials: editingProperty.financials || prev.financials,
        neighborhoodRadar: editingProperty.neighborhoodRadar || prev.neighborhoodRadar,
        pinnedInCities: editingProperty.pinnedInCities || [],
      }));
    }
  }, [editingProperty]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setNested = (parent, field, value) => setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a],
    }));
  };

  const updateImage = (i, val) => {
    setForm(prev => {
      const imgs = [...prev.images];
      imgs[i] = val;
      return { ...prev, images: imgs };
    });
  };

  const addImageField = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  const removeImage = (i) => setForm(prev => {
    const next = prev.images.filter((_, idx) => idx !== i);
    return { ...prev, images: next.length > 0 ? next : [''] };
  });

  const moveImage = (i, dir) => {
    setForm(prev => {
      const imgs = [...prev.images];
      const targetIdx = i + dir;
      if (targetIdx < 0 || targetIdx >= imgs.length) return prev;
      const temp = imgs[i];
      imgs[i] = imgs[targetIdx];
      imgs[targetIdx] = temp;
      return { ...prev, images: imgs };
    });
  };

  const processImageFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    showToast('Compressing photos client-side for fastest loading...');
    try {
      const compressedImages = await compressImageFiles(files, (curr, total) => {
        showToast(`Optimized ${curr}/${total} photos...`);
      });
      if (compressedImages.length === 0) {
        showToast('Please select valid image files (JPG, PNG, WebP, etc.)');
      } else {
        setForm(prev => {
          const existing = prev.images.filter(img => img && img.trim());
          return { ...prev, images: [...existing, ...compressedImages] };
        });
        showToast(`Successfully compressed & added ${compressedImages.length} photo(s)`);
      }
    } catch (e) {
      showToast('Error optimizing image files');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDevicePhotoChange = (e) => {
    processImageFiles(e.target.files);
    e.target.value = '';
  };

  const processVideoFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      return showToast('Please select a valid video file (MP4, WebM, MOV, etc.)');
    }
    setUploadingMedia(true);
    showToast('Processing video client-side...');
    try {
      const videoResult = await processVideoFileStrict(file, (percent) => {
        if (percent % 25 === 0) showToast(`Reading video: ${percent}%...`);
      });
      set('reelVideo', videoResult);
      showToast('Video / Reel successfully uploaded and optimized');
    } catch (err) {
      showToast('Error reading video file from device');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeviceVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processVideoFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.location.city) {
      return showToast('Title, price, and city are required fields.');
    }

    setSaving(true);
    try {
      const priceNum = Number(String(form.price).replace(/[^0-9.]/g, ''));
      const areaNum = Number(form.areaSqFt) || 2500;
      const unitLabel = form.areaUnit === 'Sq. Yds.' ? 'sq.yd' : 'sq.ft';

      const payload = {
        ...form,
        price: priceNum,
        priceFormatted: form.priceFormatted || `₹${(priceNum / 10000000).toFixed(2)} Cr`,
        pricePerSqFt: `₹${Math.round(priceNum / areaNum).toLocaleString()}/${unitLabel}`,
        areaSqFt: areaNum,
        areaUnit: form.areaUnit || 'Sq. Ft.',
        carpetAreaSqFt: Number(form.carpetAreaSqFt) || Math.round(areaNum * 0.85),
        bhk: Number(form.bhk),
        baths: Number(form.baths),
        possession: form.buyingDetails?.possessionDate || form.possession,
        promotionScore: Number(form.promotionScore) || 0,
        images: form.images.filter(img => img.trim()),
        relationshipManager: {
          name: form.contactDetails?.name || 'Oye Property Specialist',
          role: form.contactDetails?.role || 'Property Manager',
          phone: form.contactDetails?.phone || '+91 98200 14820',
          rating: 5.0,
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          whatsapp: (form.contactDetails?.whatsapp || form.contactDetails?.phone || '919820014820').replace(/\D/g, ''),
        }
      };

      let url, method;
      if (isEdit) {
        url = `${API_BASE}/api/admin/properties/${editingProperty._id}`;
        method = 'PUT';
      } else {
        url = `${API_BASE}/api/admin/properties`;
        method = 'POST';
      }

      const r = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await r.json();

      if (data.success) {
        showToast(`Property ${isEdit ? 'updated' : 'created'} successfully`);
        setTimeout(() => onSuccess(), 800);
      } else {
        showToast(data.error || 'Failed to save property');
      }
    } catch (err) {
      showToast('Network error while saving');
    }
    setSaving(false);
  };

  return (
    <div className="admin-section">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">{isEdit ? 'Edit Property Listing' : 'Create Oye Verified Listing'}</h2>
          <p className="admin-section-subtitle">
            {isEdit ? `Modifying: ${editingProperty?.title}` : 'Publish official listings with 10-point verified details and promotion weights'}
          </p>
        </div>
        <button className="admin-btn admin-btn-ghost" onClick={onCancel}>
          <ArrowLeftIcon size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-editor-form">
        {/* 1. Basic Info: Title, Type, BHK, Floor */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">1. Title, Type & Specifications</h3>
          <div className="admin-form-grid">
            <div className="admin-form-group admin-span-2">
              <label className="admin-label">Property Title *</label>
              <input
                className="admin-input"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Luxe 3 BHK Sea-View Apartment at Bandra West"
                required
              />
            </div>
            <div className="admin-form-group admin-span-2">
              <label className="admin-label">Short Tagline / Demand Hook</label>
              <input
                className="admin-input"
                value={form.tagline}
                onChange={e => set('tagline', e.target.value)}
                placeholder="e.g. Unobstructed sea views with private elevator access"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Property Type *</label>
              <select className="admin-select" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Listing Purpose</label>
              <select className="admin-select" value={form.purpose} onChange={e => set('purpose', e.target.value)}>
                <option value="buy">Buy (Sale)</option>
                <option value="rent">Rent (Lease)</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">BHK Configuration</label>
              <input className="admin-input" type="number" min={0} max={10} value={form.bhk} onChange={e => set('bhk', e.target.value)} placeholder="e.g. 3" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Bathrooms</label>
              <input className="admin-input" type="number" min={1} max={10} value={form.baths} onChange={e => set('baths', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Floor Details / Level *</label>
              <input
                className="admin-input"
                value={form.floor}
                onChange={e => set('floor', e.target.value)}
                placeholder="e.g. 4th of 14 Floors / Penthouse Level / Ground Floor"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Facing Direction</label>
              <select className="admin-select" value={form.facing} onChange={e => set('facing', e.target.value)}>
                {['North-East', 'East', 'North', 'West', 'South', 'Sea Facing', 'Park Facing', 'Road Facing'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Construction Status</label>
              <select className="admin-select" value={form.status} onChange={e => set('status', e.target.value)}>
                {['Ready to Move', 'Under Construction', 'Upcoming / Launch', 'New Resale'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {form.status === 'Under Construction' && (
              <div className="admin-form-group" style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                <label className="admin-label" style={{ color: '#B91C1C', fontWeight: 700 }}>Expected Possession Date *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select
                    className="admin-select"
                    value={form.possessionMonth || 'December'}
                    onChange={e => {
                      const m = e.target.value;
                      const y = form.possessionYear || '2026';
                      setForm(prev => ({
                        ...prev,
                        possessionMonth: m,
                        possession: `${m} ${y}`,
                        buyingDetails: { ...prev.buyingDetails, possessionDate: `${m} ${y}` }
                      }));
                    }}
                  >
                    {['Immediate', 'March', 'June', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    className="admin-select"
                    value={form.possessionYear || '2026'}
                    onChange={e => {
                      const y = e.target.value;
                      const m = form.possessionMonth || 'December';
                      setForm(prev => ({
                        ...prev,
                        possessionYear: y,
                        possession: `${m} ${y}`,
                        buyingDetails: { ...prev.buyingDetails, possessionDate: `${m} ${y}` }
                      }));
                    }}
                  >
                    {['2025', '2026', '2027', '2028', '2029', '2030'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="admin-form-group">
              <label className="admin-label">Furnishing Status</label>
              <select className="admin-select" value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                {['Fully Furnished', 'Semi Furnished', 'Unfurnished', 'Bare Shell'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Location & City */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">2. City & Location Details</h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Target City *</label>
              <select className="admin-select" value={form.location.city} onChange={e => setNested('location', 'city', e.target.value)}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Locality / Sector / Neighborhood *</label>
              <input
                className="admin-input"
                list="admin-localities-datalist"
                value={form.location.locality}
                onChange={e => setNested('location', 'locality', e.target.value)}
                placeholder="Type or select sector (e.g. Sector 14, Neharpar, Bandra West)"
                required
              />
              <datalist id="admin-localities-datalist">
                {form.location.city === 'Faridabad' && FARIDABAD_SECTORS_AND_AREAS.map(sec => (
                  <option key={sec} value={sec} />
                ))}
                {POPULAR_CITY_AREAS[form.location.city]?.map(area => (
                  <option key={area} value={area} />
                ))}
              </datalist>
            </div>
            <div className="admin-form-group admin-span-2">
              <label className="admin-label">Complete Street Address</label>
              <input className="admin-input" value={form.location.address} onChange={e => setNested('location', 'address', e.target.value)} placeholder="e.g. 12 Sea Face Lane, Bandra West, Mumbai 400050" />
            </div>
          </div>
        </div>

        {/* 3. Area & Pricing / Demand */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">3. Area & Price / Demand</h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Total / Super Area *</label>
              <input className="admin-input" type="number" value={form.areaSqFt} onChange={e => set('areaSqFt', e.target.value)} placeholder="e.g. 2500" required />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Area Unit *</label>
              <select className="admin-select" value={form.areaUnit} onChange={e => set('areaUnit', e.target.value)}>
                <option value="Sq. Ft.">Sq. Ft. (Square Feet)</option>
                <option value="Sq. Yds.">Sq. Yds. (Square Yards / Gaj)</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Carpet Area</label>
              <input className="admin-input" type="number" value={form.carpetAreaSqFt} onChange={e => set('carpetAreaSqFt', e.target.value)} placeholder="Auto: 85% of area" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Base / Starting Price (INR Numeric) *</label>
              <input
                className="admin-input"
                type="number"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="e.g. 45000000 (for ₹4.50 Cr)"
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Display Price / Demand (Formatted)</label>
              <input
                className="admin-input"
                value={form.priceFormatted}
                onChange={e => set('priceFormatted', e.target.value)}
                placeholder="e.g. ₹4.50 Cr (auto-calculated if blank)"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Est. Monthly Rent / ROI</label>
              <input className="admin-input" value={form.financials.estimatedMonthlyRent} onChange={e => setNested('financials', 'estimatedMonthlyRent', e.target.value)} placeholder="e.g. ₹1,20,000 /mo" />
            </div>
          </div>

          {/* Builder Floor Floor-Wise Pricing Grid */}
          {form.propertyType === 'Builder Floor' && (
            <div style={{ marginTop: '20px', background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                    🏢 Builder Floor: Floor-Wise Pricing & Inventory
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                    Set customized asking price and availability for each floor level
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const defaultLevels = BUILDER_FLOOR_LEVELS.map(fl => ({
                      floorLevel: fl.id,
                      label: fl.label,
                      price: form.price ? Number(form.price) : '',
                      priceFormatted: form.priceFormatted || '',
                      status: 'Available',
                      description: fl.desc
                    }));
                    set('floorPricing', defaultLevels);
                  }}
                  style={{
                    background: '#E71D2B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Populate All 5 Standard Floors
                </button>
              </div>

              {(!form.floorPricing || form.floorPricing.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '16px', background: '#FFFFFF', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748B' }}>
                    Click button above or add individual floor pricing below.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {form.floorPricing.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(180px, 1.2fr) minmax(130px, 1fr) minmax(130px, 1fr) 100px 32px',
                        gap: '8px',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>{item.label || item.floorLevel}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>{item.description}</div>
                      </div>
                      <div>
                        <input
                          type="number"
                          className="admin-input"
                          style={{ padding: '6px 8px', fontSize: '12px' }}
                          placeholder="Numeric INR (e.g. 18500000)"
                          value={item.price || ''}
                          onChange={e => {
                            const val = e.target.value;
                            const updated = [...form.floorPricing];
                            const num = Number(val);
                            updated[idx] = {
                              ...updated[idx],
                              price: num,
                              priceFormatted: num ? (num >= 10000000 ? `₹${(num / 10000000).toFixed(2)} Cr` : `₹${(num / 100000).toFixed(2)} Lakh`) : ''
                            };
                            set('floorPricing', updated);
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="admin-input"
                          style={{ padding: '6px 8px', fontSize: '12px' }}
                          placeholder="₹1.85 Cr"
                          value={item.priceFormatted || ''}
                          onChange={e => {
                            const updated = [...form.floorPricing];
                            updated[idx] = { ...updated[idx], priceFormatted: e.target.value };
                            set('floorPricing', updated);
                          }}
                        />
                      </div>
                      <div>
                        <select
                          className="admin-select"
                          style={{ padding: '6px 8px', fontSize: '11px' }}
                          value={item.status || 'Available'}
                          onChange={e => {
                            const updated = [...form.floorPricing];
                            updated[idx] = { ...updated[idx], status: e.target.value };
                            set('floorPricing', updated);
                          }}
                        >
                          <option value="Available">Available</option>
                          <option value="Booked">Booked</option>
                          <option value="Sold Out">Sold Out</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = form.floorPricing.filter((_, i) => i !== idx);
                          set('floorPricing', updated);
                        }}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px' }}
                        title="Remove floor"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Photos & Media Gallery */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">4. Photos & Showcase Video / Reel</h3>

          {/* Photo Upload Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '8px' }}>
              <label className="admin-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={14} color="#E71D2B" />
                Property Photo Gallery ({form.images.filter(x => x && x.trim()).length} Photos)
              </label>
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingMedia}
              >
                <UploadCloudIcon size={14} /> Upload Photos from Device
              </button>
            </div>

            <input
              type="file"
              ref={photoInputRef}
              onChange={handleDevicePhotoChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />

            {/* Photo Dropzone */}
            <div
              className={`admin-media-dropzone ${isPhotoDragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsPhotoDragging(true); }}
              onDragLeave={() => setIsPhotoDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsPhotoDragging(false);
                if (e.dataTransfer.files) processImageFiles(e.dataTransfer.files);
              }}
              onClick={() => photoInputRef.current?.click()}
            >
              <div className="admin-dropzone-icon">
                <UploadCloudIcon size={24} />
              </div>
              <div className="admin-dropzone-text">
                <strong>Click to browse or drag & drop photos here</strong>
                <small>Supports High-Res JPG, PNG, WEBP · Select multiple photos at once</small>
              </div>
            </div>

            {/* Photo Preview Grid with Reorder/Remove */}
            {form.images.filter(img => img && img.trim()).length > 0 && (
              <div className="admin-photos-grid">
                {form.images.map((img, i) => img && img.trim() ? (
                  <div key={i} className="admin-photo-card">
                    <img src={img} alt={`Photo #${i + 1}`} className="admin-photo-card-img" onError={e => e.target.style.display = 'none'} />
                    <div className="admin-photo-card-badge">
                      {i === 0 ? '★ Cover Photo' : `#${i + 1}`}
                    </div>
                    <div className="admin-photo-card-actions">
                      <button
                        type="button"
                        className="admin-photo-action-btn"
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        title="Move Left (Make Earlier/Cover)"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="admin-photo-action-btn"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === form.images.length - 1}
                        title="Move Right"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        className="admin-photo-action-btn danger"
                        onClick={() => removeImage(i)}
                        title="Delete Photo"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>
                  </div>
                ) : null)}
              </div>
            )}

            {/* URL Input Accordion / Fallback */}
            <div style={{ marginTop: '1rem' }}>
              <label className="admin-label" style={{ fontSize: '10px' }}>Or Manage Photo URLs Directly</label>
              {form.images.map((img, i) => (
                <div key={i} className="admin-image-row">
                  <input
                    className="admin-input"
                    value={img}
                    onChange={e => updateImage(i, e.target.value)}
                    placeholder={`Photo URL or Base64 #${i + 1}`}
                  />
                  {form.images.length > 1 && (
                    <button type="button" className="admin-icon-btn danger" onClick={() => removeImage(i)}>
                      <CloseIcon size={14} />
                    </button>
                  )}
                  {img && <img src={img} alt="" className="admin-img-preview" onError={e => e.target.style.display = 'none'} />}
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={addImageField} style={{ marginTop: '0.35rem' }}>
                <PlusIcon size={14} /> Add URL Slot
              </button>
            </div>
          </div>

          {/* Video / Reel Upload Section */}
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '8px' }}>
              <label className="admin-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <VideoIcon size={14} color="#E71D2B" />
                Showcase Video Tour / Reel Feed
              </label>
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingMedia}
              >
                <UploadCloudIcon size={14} /> Upload Video from Device
              </button>
            </div>

            <input
              type="file"
              ref={videoInputRef}
              onChange={handleDeviceVideoChange}
              accept="video/*"
              style={{ display: 'none' }}
            />

            {/* Video Dropzone */}
            <div
              className={`admin-media-dropzone ${isVideoDragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsVideoDragging(true); }}
              onDragLeave={() => setIsVideoDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsVideoDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) processVideoFile(e.dataTransfer.files[0]);
              }}
              onClick={() => videoInputRef.current?.click()}
            >
              <div className="admin-dropzone-icon">
                <VideoIcon size={24} />
              </div>
              <div className="admin-dropzone-text">
                <strong>Click to browse or drag & drop video tour here</strong>
                <small>Supports MP4, WebM, QuickTime MOV · Plays in immersive Vertical Reels feed</small>
              </div>
            </div>

            {/* Live Video Preview if present */}
            {form.reelVideo && (
              <div className="admin-video-preview-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <VideoIcon size={13} /> Active Reel Video Preview
                  </span>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={() => set('reelVideo', '')}
                  >
                    <CloseIcon size={12} /> Remove Video
                  </button>
                </div>
                <video
                  src={form.reelVideo}
                  controls
                  className="admin-video-player"
                  preload="metadata"
                />
              </div>
            )}

            <div style={{ marginTop: '0.75rem' }}>
              <label className="admin-label" style={{ fontSize: '10px' }}>Or Paste Video URL / Local Path</label>
              <input
                className="admin-input"
                value={form.reelVideo}
                onChange={e => set('reelVideo', e.target.value)}
                placeholder="e.g. /videos/reel_worli_sea_face.mp4 or https://..."
              />
            </div>
          </div>
        </div>

        {/* 5. Contact & Buying Details */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">5. Contact & Buying Details</h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Contact Person Name</label>
              <input
                className="admin-input"
                value={form.contactDetails?.name || ''}
                onChange={e => setNested('contactDetails', 'name', e.target.value)}
                placeholder="e.g. Rajesh Sharma / Oye Advisor"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Contact Phone Number</label>
              <input
                className="admin-input"
                value={form.contactDetails?.phone || ''}
                onChange={e => setNested('contactDetails', 'phone', e.target.value)}
                placeholder="e.g. +91 98200 14820"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">WhatsApp Contact Number</label>
              <input
                className="admin-input"
                value={form.contactDetails?.whatsapp || ''}
                onChange={e => setNested('contactDetails', 'whatsapp', e.target.value)}
                placeholder="e.g. 919820014820"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Seller / Contact Role</label>
              <select className="admin-select" value={form.contactDetails?.role || 'Property Owner'} onChange={e => setNested('contactDetails', 'role', e.target.value)}>
                {['Property Owner', 'Verified Broker', 'Direct Builder', 'Oye Relationship Manager'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Possession Date / Timeline</label>
              <input
                className="admin-input"
                value={form.buyingDetails?.possessionDate || form.possession || ''}
                onChange={e => {
                  setNested('buyingDetails', 'possessionDate', e.target.value);
                  set('possession', e.target.value);
                }}
                placeholder="e.g. Immediate / Ready to Move / Dec 2026"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Booking / Token Amount</label>
              <input
                className="admin-input"
                value={form.buyingDetails?.bookingAmount || ''}
                onChange={e => setNested('buyingDetails', 'bookingAmount', e.target.value)}
                placeholder="e.g. ₹5,00,000 or 10% Token"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Ownership Type</label>
              <select className="admin-select" value={form.buyingDetails?.ownershipType || 'Freehold'} onChange={e => setNested('buyingDetails', 'ownershipType', e.target.value)}>
                {['Freehold', 'Leasehold', 'Power of Attorney', 'Co-operative Society'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Payment / Buying Terms</label>
              <input
                className="admin-input"
                value={form.buyingDetails?.paymentTerms || ''}
                onChange={e => setNested('buyingDetails', 'paymentTerms', e.target.value)}
                placeholder="e.g. Bank Loan Approved / 20:80 Scheme / Flexible"
              />
            </div>
          </div>
        </div>

        {/* 6. Builder & RERA Compliance */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">6. Builder & RERA Compliance</h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Builder / Developer Name</label>
              <input className="admin-input" value={form.builder.name} onChange={e => setNested('builder', 'name', e.target.value)} placeholder="e.g. Lodha Luxury" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Developer Track Record</label>
              <input className="admin-input" value={form.builder.experience} onChange={e => setNested('builder', 'experience', e.target.value)} placeholder="e.g. 30+ Years Experience" />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">RERA Registration ID</label>
              <input className="admin-input" value={form.builder.reraId} onChange={e => setNested('builder', 'reraId', e.target.value)} placeholder="e.g. P51900012345 / VERIFIED" />
            </div>
          </div>
        </div>

        {/* 7. Amenities */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">7. Amenities & Privileges</h3>
          <div className="admin-amenities-grid">
            {AMENITIES_LIST.map(a => (
              <label key={a} className={`admin-amenity-chip ${form.amenities.includes(a) ? 'selected' : ''}`}>
                <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ display: 'none' }} />
                {a}
              </label>
            ))}
          </div>
        </div>

        {/* 8. Admin Moderation & Controls */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">8. Admin Moderation & Promotion</h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Approval Status</label>
              <select className="admin-select" value={form.approvalStatus} onChange={e => set('approvalStatus', e.target.value)}>
                <option value="approved">Approved (Live)</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Inventory Status</label>
              <select className="admin-select" value={form.listingStatus} onChange={e => set('listingStatus', e.target.value)}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Promotion Weight (0 to 100)</label>
              <input className="admin-input" type="number" min={0} max={100} value={form.promotionScore} onChange={e => set('promotionScore', e.target.value)} />
            </div>
            <div className="admin-form-group admin-span-2">
              <label className="admin-label">Pin to City Feeds</label>
              <div className="admin-city-chips">
                {CITIES.map(c => (
                  <label key={c} className={`admin-amenity-chip ${form.pinnedInCities.includes(c) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      style={{ display: 'none' }}
                      checked={form.pinnedInCities.includes(c)}
                      onChange={() => setForm(prev => ({
                        ...prev,
                        pinnedInCities: prev.pinnedInCities.includes(c)
                          ? prev.pinnedInCities.filter(x => x !== c)
                          : [...prev.pinnedInCities, c],
                      }))}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-form-group admin-toggles-row">
              <label className="admin-toggle-label">
                <input type="checkbox" checked={form.showInInstants} onChange={e => set('showInInstants', e.target.checked)} />
                <span className="admin-toggle-switch" />
                <span style={{ fontWeight: 700, color: form.showInInstants ? '#E71D2B' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚡ Show on Instants (Reels)
                </span>
              </label>
              <label className="admin-toggle-label">
                <input type="checkbox" checked={form.isOyeListing} onChange={e => set('isOyeListing', e.target.checked)} />
                <span className="admin-toggle-switch" />
                <span>Oye Verified Listing</span>
              </label>
              <label className="admin-toggle-label">
                <input type="checkbox" checked={form.topPick} onChange={e => set('topPick', e.target.checked)} />
                <span className="admin-toggle-switch" />
                <span>Top Pick</span>
              </label>
              <label className="admin-toggle-label">
                <input type="checkbox" checked={form.trending} onChange={e => set('trending', e.target.checked)} />
                <span className="admin-toggle-switch" />
                <span>Trending Badge</span>
              </label>
            </div>
            <div className="admin-form-group admin-span-2">
              <label className="admin-label">Internal Admin Notes</label>
              <textarea
                className="admin-textarea"
                rows={2}
                value={form.adminNotes}
                onChange={e => set('adminNotes', e.target.value)}
                placeholder="Private moderation notes — not visible to portal visitors"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
