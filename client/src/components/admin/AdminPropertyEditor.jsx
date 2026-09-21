import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
  StarIcon,
  TrendingIcon,
  ShieldIcon
} from './AdminIcons';

const CITIES = ['Mumbai', 'Delhi NCR', 'Dubai', 'Goa', 'Bangalore', 'Hyderabad', 'London'];
const PROPERTY_TYPES = ['Apartment', 'Penthouse', 'Luxury Villa', 'Duplex', 'Studio', 'Commercial Space', 'Plot', 'Row House'];
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
    location: { city: 'Mumbai', locality: '', address: '' },
    builder: { name: '', experience: '', reraId: '' },
    contactDetails: { name: '', phone: '', email: '', whatsapp: '', role: 'Property Owner', preferredTime: '10 AM - 7 PM' },
    buyingDetails: { bookingAmount: '10% Token', possessionDate: 'Immediate', ownershipType: 'Freehold', paymentTerms: 'Flexible / Bank Approved', demandNegotiable: true },
    amenities: [],
    images: [''],
    reelVideo: '',
    topPick: false,
    trending: false,
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
  const removeImage = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

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
              <input className="admin-input" value={form.location.locality} onChange={e => setNested('location', 'locality', e.target.value)} placeholder="e.g. Bandra West, Worli, DLF Phase 5" required />
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
              <label className="admin-label">Asking Price / Demand (INR Numeric) *</label>
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
        </div>

        {/* 4. Photos & Media Gallery */}
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">4. Photos & Showcase Gallery</h3>
          <div className="admin-form-group">
            <label className="admin-label">Video Tour / Reel URL</label>
            <input className="admin-input" value={form.reelVideo} onChange={e => set('reelVideo', e.target.value)} placeholder="https://..." />
          </div>
          <label className="admin-label" style={{ marginTop: '1rem' }}>Property Gallery Photos (URLs)</label>
          {form.images.map((img, i) => (
            <div key={i} className="admin-image-row">
              <input className="admin-input" value={img} onChange={e => updateImage(i, e.target.value)} placeholder={`Photo URL #${i + 1}`} />
              {form.images.length > 1 && (
                <button type="button" className="admin-icon-btn danger" onClick={() => removeImage(i)}>
                  <CloseIcon size={14} />
                </button>
              )}
              {img && <img src={img} alt="" className="admin-img-preview" onError={e => e.target.style.display = 'none'} />}
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={addImageField} style={{ marginTop: '0.5rem' }}>
            <PlusIcon size={14} /> Add Photo Slot
          </button>
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
