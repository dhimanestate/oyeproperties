import React, { useState, useRef, useEffect } from 'react';
import { API_BASE, getMediaUrl } from '../config';
import { 
  X, 
  Building2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  CheckCircle2, 
  UploadCloud, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Camera,
  Video,
  Image as ImageIcon,
  Trash2,
  Film,
  Calendar,
  Layers,
  IndianRupee
} from 'lucide-react';
import {
  INDIAN_STATES_AND_UTS,
  ALL_INDIAN_CITIES,
  FARIDABAD_SECTORS_AND_AREAS,
  POPULAR_CITY_AREAS,
  PROPERTY_TYPES_CATALOGUE,
  BUILDER_FLOOR_LEVELS
} from '../data/indiaGeographicDirectory';
import { compressImageFiles, processVideoFileStrict } from '../utils/mediaCompressor';

export default function ListPropertyModal({
  isOpen,
  onClose,
  currentUser,
  onPropertyCreated
}) {
  if (!isOpen) return null;

  const photoFileRef = useRef(null);
  const videoFileRef = useRef(null);
  const [devicePhotos, setDevicePhotos] = useState([]);
  const [deviceVideo, setDeviceVideo] = useState(null);
  const [uploadNotice, setUploadNotice] = useState('');
  const [allCitiesList, setAllCitiesList] = useState(ALL_INDIAN_CITIES);

  // Dynamic Builder Floor prices state: { ground: '2.85', first: '2.70', second: '2.60', third: '2.50', fourth_terrace: '3.10' }
  const [builderFloorPrices, setBuilderFloorPrices] = useState({
    ground: '2.85',
    first: '2.70',
    second: '2.60',
    third: '2.50',
    fourth_terrace: '3.15'
  });
  const [selectedBuilderFloorLevel, setSelectedBuilderFloorLevel] = useState('first');

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    propertyType: 'Apartment',
    state: 'Haryana',
    city: 'Faridabad',
    locality: '',
    address: '',
    priceCr: '4.50',
    bhk: '3',
    baths: '3',
    areaSqFt: '2400',
    areaUnit: 'Sq. Ft.',
    floor: '4th of 14 Floors',
    status: 'Ready to Move',
    possession: 'Immediate',
    possessionYear: '2026',
    possessionMonth: 'December',
    furnishing: 'Fully Furnished',
    contactName: currentUser?.name || '',
    contactPhone: currentUser?.phone || '',
    contactWhatsapp: (currentUser?.phone || '').replace(/\D/g, ''),
    contactRole: currentUser?.role || 'Property Owner',
    bookingAmount: '10% Token',
    amenities: ['Private Infinity Pool', 'Smart Home Automation', '24/7 Security'],
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    reelVideo: '/videos/reel_worli_sea_face.mp4'
  });

  // Fetch admin CMS configured featured cities & merge with all Indian cities
  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(r => r.json())
      .then(data => {
        if (data?.config?.featuredCities && Array.isArray(data.config.featuredCities)) {
          const merged = Array.from(new Set([...data.config.featuredCities, ...ALL_INDIAN_CITIES]));
          setAllCitiesList(merged);
        }
      })
      .catch(() => {});
  }, []);

  const handleDevicePhotoSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadNotice('Compressing photos client-side for fastest loading...');
    try {
      const compressedImgs = await compressImageFiles(files, (curr, total) => {
        setUploadNotice(`Optimizing photo ${curr}/${total}...`);
      });
      if (compressedImgs.length > 0) {
        setDevicePhotos(prev => {
          const combined = [...prev, ...compressedImgs];
          setFormData(f => ({ ...f, imageUrl: combined[0] }));
          return combined;
        });
        setUploadNotice(`Added ${compressedImgs.length} compressed photo(s)`);
        setTimeout(() => setUploadNotice(''), 3000);
      }
    } catch (err) {
      setUploadNotice('Failed to compress photos');
      setTimeout(() => setUploadNotice(''), 3000);
    }
    e.target.value = '';
  };

  const handleDeviceVideoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please choose a valid video file');
      return;
    }
    setUploadNotice('Processing video client-side...');
    try {
      const videoResult = await processVideoFileStrict(file, (percent) => {
        if (percent % 25 === 0) setUploadNotice(`Reading video: ${percent}%...`);
      });
      setDeviceVideo(videoResult);
      setFormData(f => ({ ...f, reelVideo: videoResult }));
      setUploadNotice('Video / Reel tour uploaded and ready');
      setTimeout(() => setUploadNotice(''), 3000);
    } catch {
      alert('Error reading video file');
    }
    e.target.value = '';
  };

  const removeDevicePhoto = (idx) => {
    setDevicePhotos(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0) {
        setFormData(f => ({ ...f, imageUrl: next[0] }));
      } else {
        setFormData(f => ({ ...f, imageUrl: PRESET_IMAGES[0].url }));
      }
      return next;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successProperty, setSuccessProperty] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const AMENITIES_LIST = [
    'Private Infinity Pool',
    'Sea / Ocean View',
    'Arnold Palmer Golf Access',
    'Smart Home Automation',
    'Private High-Speed Elevator',
    'Helipad Access',
    'Temperature Controlled Wine Cellar',
    '24/7 White-Glove Concierge',
    'EV Charging Station'
  ];

  const PRESET_IMAGES = [
    { label: 'Sea View Residence', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', video: '/videos/reel_worli_sea_face.mp4' },
    { label: 'Private Pool Villa', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', video: '/videos/reel_goa_beach_villa.mp4' },
    { label: 'Golf Greens Duplex', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', video: '/videos/reel_dlf_camellias.mp4' },
    { label: 'Modern Luxury Estate', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', video: '/videos/reel_palm_jumeirah.mp4' }
  ];

  const handleToggleAmenity = (item) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== item)
          : [...prev.amenities, item]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.locality || !formData.priceCr) {
      setErrorMsg('Please complete the title, locality, and asking price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Compute final possession text
    let finalPossession = formData.possession;
    if (formData.status === 'Under Construction') {
      finalPossession = `Possession Expected: ${formData.possessionMonth} ${formData.possessionYear}`;
    }

    // Builder Floor pricing structure if applicable
    let finalFloor = formData.floor || 'Upper Level';
    let finalPriceCr = formData.priceCr;
    let floorPricingArray = [];

    if (formData.propertyType === 'Builder Floor') {
      const activeLevelObj = BUILDER_FLOOR_LEVELS.find(l => l.id === selectedBuilderFloorLevel) || BUILDER_FLOOR_LEVELS[1];
      finalFloor = activeLevelObj.label;
      finalPriceCr = builderFloorPrices[selectedBuilderFloorLevel] || formData.priceCr;
      
      floorPricingArray = BUILDER_FLOOR_LEVELS.map(lvl => {
        const pCr = parseFloat(builderFloorPrices[lvl.id] || '2.50');
        const numPrice = Math.round(pCr * 10000000);
        return {
          floorLevel: lvl.label,
          price: numPrice,
          priceFormatted: `₹${pCr.toFixed(2)} Cr`,
          status: 'Available',
          description: lvl.id === 'fourth_terrace' ? 'Includes Private Terrace Rights' : (lvl.id === 'ground' ? 'Includes Front/Rear Lawn Rights' : 'Standard Luxury Floor')
        };
      });
    }

    const priceNum = Math.round(parseFloat(finalPriceCr) * 10000000);
    const unitSuffix = formData.areaUnit === 'Sq. Yds.' ? 'sq.yd' : 'sq.ft';
    const cName = formData.contactName || currentUser?.name || 'Verified Owner';
    const cPhone = formData.contactPhone || currentUser?.phone || '+91 98200 14820';
    const cRole = formData.contactRole || currentUser?.role || 'Property Owner';
    const cWhatsapp = formData.contactWhatsapp || cPhone.replace(/\D/g, '');

    const payload = {
      title: formData.title,
      tagline: formData.tagline || `Exclusive ${formData.bhk} BHK ${formData.propertyType} in ${formData.locality}, ${formData.city}`,
      propertyType: formData.propertyType,
      bhk: Number(formData.bhk),
      baths: Number(formData.baths),
      price: priceNum,
      priceFormatted: `₹${parseFloat(finalPriceCr).toFixed(2)} Cr`,
      pricePerSqFt: `₹${Math.round(priceNum / Number(formData.areaSqFt || 2500)).toLocaleString()}/${unitSuffix}`,
      areaSqFt: Number(formData.areaSqFt) || 2500,
      areaUnit: formData.areaUnit || 'Sq. Ft.',
      carpetAreaSqFt: Math.round(Number(formData.areaSqFt || 2500) * 0.85),
      floor: finalFloor,
      floorPricing: floorPricingArray,
      location: {
        state: formData.state || 'Haryana',
        city: formData.city,
        locality: formData.locality,
        address: formData.address || `${formData.locality}, ${formData.city}`
      },
      status: formData.status,
      possession: finalPossession,
      furnishing: formData.furnishing,
      amenities: formData.amenities,
      images: devicePhotos.length > 0 ? devicePhotos : [formData.imageUrl],
      reelVideo: formData.reelVideo,
      showInInstants: true,
      contactDetails: {
        name: cName,
        phone: cPhone,
        whatsapp: cWhatsapp,
        role: cRole,
        preferredTime: '10 AM - 8 PM',
      },
      buyingDetails: {
        bookingAmount: formData.bookingAmount || '10% Token',
        possessionDate: finalPossession,
        ownershipType: 'Freehold',
        paymentTerms: 'Bank Loan Available / Flexible Installments',
        demandNegotiable: true,
      },
      ownerInfo: {
        name: cName,
        role: cRole,
        phone: cPhone
      }
    };

    try {
      const res = await fetch(`${API_BASE}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.property) {
        setSuccessProperty(data.property);
        onPropertyCreated(data.property);
      } else {
        setErrorMsg(data.error || 'Failed to list property. Please try again.');
      }
    } catch {
      // Fallback
      const localProp = {
        ...payload,
        id: `prop-user-${Date.now().toString(36)}`,
        builder: { name: cName + ` (${cRole})`, experience: 'Owner Listed', reraId: 'VERIFIED-OWNER' },
        relationshipManager: {
          name: cName,
          role: cRole,
          phone: cPhone,
          rating: 5.0,
          photo: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          whatsapp: cWhatsapp
        },
        verified: true,
        isOwnerListing: true,
        likesCount: 1,
        viewsCount: 10
      };
      setSuccessProperty(localProp);
      onPropertyCreated(localProp);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ alignItems: window.innerWidth <= 768 ? 'flex-end' : 'center', padding: window.innerWidth <= 768 ? 0 : '16px' }}
    >
      <div
        className="glass-panel-heavy"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: window.innerWidth <= 768 ? '100%' : '740px',
          maxHeight: window.innerWidth <= 768 ? '92dvh' : '92vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          padding: window.innerWidth <= 768 ? '0 16px 28px' : '28px',
          background: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderBottomLeftRadius: window.innerWidth <= 768 ? 0 : 'var(--radius-lg)',
          borderBottomRightRadius: window.innerWidth <= 768 ? 0 : 'var(--radius-lg)',
          position: 'relative',
          boxShadow: window.innerWidth <= 768 ? '0 -10px 40px rgba(0,0,0,0.25)' : 'var(--shadow-lg)'
        }}
      >
        {window.innerWidth <= 768 && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
            <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: 'rgba(0,0,0,0.15)' }} />
          </div>
        )}
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(15, 23, 42, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>

        {successProperty ? (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(5, 150, 105, 0.12)',
              border: '2px solid var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-emerald)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Your Luxury Property is Now Live!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Your listing has been published to the Oye Properties catalogue & reel feed with a verified owner badge.
            </p>

            {/* Preview Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              gap: '16px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <img
                src={getMediaUrl(successProperty.images?.[0])}
                alt={successProperty.title}
                style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  ✓ Owner Verified Listing
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                  {successProperty.title}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {successProperty.location.locality}, {successProperty.location.city} • {successProperty.bhk} BHK
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                  {successProperty.priceFormatted}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '14px' }}
            >
              View in Catalogue & Reels
            </button>
          </div>
        ) : (
          /* Form Screen */
          <div>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    List Your Luxury Inventory
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Listing as: <strong style={{ color: 'var(--accent-primary)' }}>{currentUser?.name}</strong> ({currentUser?.role})
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(225, 29, 72, 0.08)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                color: '#e11d48',
                fontSize: '12px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title & Tagline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Imperial Bay Panoramic 3 BHK"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 270° Ocean Views & Private Deck"
                    value={formData.tagline}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Category, BHK, Floor */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Property Type *
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={e => {
                      const nextType = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        propertyType: nextType,
                        floor: nextType === 'Builder Floor' ? '1st Floor' : prev.floor,
                        areaUnit: nextType === 'Builder Floor' || nextType === 'Plot' ? 'Sq. Yds.' : prev.areaUnit
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      fontWeight: 600
                    }}
                  >
                    {PROPERTY_TYPES_CATALOGUE.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Configuration (BHK)
                  </label>
                  <select
                    value={formData.bhk}
                    onChange={e => setFormData({ ...formData, bhk: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5 BHK</option>
                    <option value="6">6+ BHK Grand</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {formData.propertyType === 'Builder Floor' ? 'Select Floor Offering *' : 'Floor Level *'}
                  </label>
                  {formData.propertyType === 'Builder Floor' ? (
                    <select
                      value={selectedBuilderFloorLevel}
                      onChange={e => {
                        const levelId = e.target.value;
                        setSelectedBuilderFloorLevel(levelId);
                        const lvlObj = BUILDER_FLOOR_LEVELS.find(l => l.id === levelId);
                        if (lvlObj) {
                          setFormData(prev => ({
                            ...prev,
                            floor: lvlObj.label,
                            priceCr: builderFloorPrices[levelId] || prev.priceCr
                          }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #E71D2B',
                        background: '#FFF0F1',
                        color: '#E71D2B',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        outline: 'none'
                      }}
                    >
                      {BUILDER_FLOOR_LEVELS.map(lvl => (
                        <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. 4th of 14 Floors / Ground"
                      value={formData.floor}
                      onChange={e => setFormData({ ...formData, floor: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* BUILDER FLOOR SPECIFIC INTERFACE: Floor-Wise Prices */}
              {formData.propertyType === 'Builder Floor' && (
                <div style={{
                  background: 'linear-gradient(135deg, #FFF8F8 0%, #FFFFFF 100%)',
                  border: '1.5px solid rgba(231, 29, 43, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 14px rgba(231, 29, 43, 0.05)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#E71D2B' }}>
                      <Layers size={16} />
                      <span>Builder Floor Level-Wise Pricing & Inventory</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                      Set prices according to each independent floor
                    </span>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#475569', marginBottom: '12px', lineHeight: 1.4 }}>
                    Buyers can view individual floors and their unique features (e.g. Ground with lawn, Top with terrace rights). Enter asking price for each available level:
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
                    {BUILDER_FLOOR_LEVELS.map(lvl => (
                      <div 
                        key={lvl.id}
                        style={{
                          background: selectedBuilderFloorLevel === lvl.id ? '#FFF0F1' : '#F8FAFC',
                          border: selectedBuilderFloorLevel === lvl.id ? '1.5px solid #E71D2B' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: selectedBuilderFloorLevel === lvl.id ? '#E71D2B' : '#1E293B' }}>
                            {lvl.label}
                          </span>
                          {selectedBuilderFloorLevel === lvl.id && (
                            <span style={{ fontSize: '9px', background: '#E71D2B', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              Current
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', flexShrink: 0 }}>₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={builderFloorPrices[lvl.id] || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setBuilderFloorPrices(prev => ({ ...prev, [lvl.id]: val }));
                              if (selectedBuilderFloorLevel === lvl.id) {
                                setFormData(prev => ({ ...prev, priceCr: val }));
                              }
                            }}
                            placeholder="2.50"
                            style={{
                              flex: 1,
                              minWidth: 0,
                              width: '100%',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '12px',
                              fontWeight: 700,
                              outline: 'none',
                              background: '#ffffff'
                            }}
                          />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', flexShrink: 0 }}>Cr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 3: State, City, & Locality (All India + Faridabad Sectors) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    State / UT *
                  </label>
                  <select
                    value={formData.state || 'Haryana'}
                    onChange={e => {
                      const newState = e.target.value;
                      let defaultCity = 'Faridabad';
                      if (newState === 'Maharashtra') defaultCity = 'Mumbai';
                      else if (newState === 'Delhi NCR') defaultCity = 'Delhi NCR';
                      else if (newState === 'Karnataka') defaultCity = 'Bangalore (Bengaluru)';
                      else if (newState === 'Telangana') defaultCity = 'Hyderabad';
                      else if (newState === 'Goa') defaultCity = 'Goa';
                      else if (newState === 'Uttar Pradesh') defaultCity = 'Noida';
                      else if (newState === 'Rajasthan') defaultCity = 'Jaipur';
                      setFormData(prev => ({ ...prev, state: newState, city: defaultCity }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    {INDIAN_STATES_AND_UTS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    City / Market *
                  </label>
                  <select
                    value={formData.city}
                    onChange={e => {
                      const newCity = e.target.value;
                      let newState = formData.state;
                      if (newCity === 'Faridabad' || newCity === 'Gurgaon (Gurugram)' || newCity === 'Panipat' || newCity === 'Karnal' || newCity === 'Sonipat' || newCity === 'Panchkula' || newCity === 'Rohtak') newState = 'Haryana';
                      else if (newCity === 'Noida' || newCity === 'Greater Noida' || newCity === 'Ghaziabad' || newCity === 'Lucknow' || newCity === 'Agra') newState = 'Uttar Pradesh';
                      else if (newCity === 'Mumbai' || newCity === 'Navi Mumbai' || newCity === 'Thane' || newCity === 'Pune') newState = 'Maharashtra';
                      else if (newCity === 'Delhi NCR') newState = 'Delhi NCR';
                      else if (newCity === 'Bangalore (Bengaluru)') newState = 'Karnataka';
                      else if (newCity === 'Hyderabad') newState = 'Telangana';
                      else if (newCity === 'Jaipur' || newCity === 'Udaipur') newState = 'Rajasthan';
                      else if (newCity === 'Goa') newState = 'Goa';

                      // Pre-fill first popular locality for ease
                      const cityAreas = POPULAR_CITY_AREAS[newCity] || [];
                      setFormData(prev => ({
                        ...prev,
                        city: newCity,
                        state: newState,
                        locality: cityAreas.length > 0 ? cityAreas[0] : prev.locality
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      fontWeight: 600
                    }}
                  >
                    {allCitiesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Locality / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    list="localities-datalist"
                    placeholder={formData.city === 'Faridabad' ? 'e.g. Sector 14, Sector 15A, Neharpar' : 'e.g. Sector / Locality Name'}
                    value={formData.locality}
                    onChange={e => setFormData({ ...formData, locality: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <datalist id="localities-datalist">
                    {(POPULAR_CITY_AREAS[formData.city] || (formData.city === 'Faridabad' ? FARIDABAD_SECTORS_AND_AREAS : [])).map((sec, idx) => (
                      <option key={idx} value={sec} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Street Address Row */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Street Address / Plot / Tower Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder={formData.propertyType === 'Builder Floor' ? 'e.g. Plot 42, Sector 15A, Faridabad' : 'e.g. Tower 4, Flat 1202, Road 14'}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Row 4: Area, Unit, Asking Price / Demand */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Total Area *
                  </label>
                  <input
                    type="number"
                    placeholder={formData.areaUnit === 'Sq. Yds.' ? '300' : '2400'}
                    value={formData.areaSqFt}
                    onChange={e => setFormData({ ...formData, areaSqFt: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Area Unit *
                  </label>
                  <select
                    value={formData.areaUnit}
                    onChange={e => setFormData({ ...formData, areaUnit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Sq. Ft.">Sq. Ft. (Square Feet)</option>
                    <option value="Sq. Yds.">Sq. Yds. (Square Yards / Gaj)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {formData.propertyType === 'Builder Floor' ? 'Price for Selected Floor (₹ Cr) *' : 'Asking Price / Demand (₹ Cr) *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="4.50"
                      value={formData.priceCr}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, priceCr: val }));
                        if (formData.propertyType === 'Builder Floor') {
                          setBuilderFloorPrices(prev => ({ ...prev, [selectedBuilderFloorLevel]: val }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 28px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        outline: 'none',
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Construction Status & Expected Possession Section */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} color="#E71D2B" />
                  Construction Status &amp; Possession Timeline
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: formData.status === 'Under Construction' ? '1fr 1fr 1fr' : '1fr 2fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => {
                        const nextStatus = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          status: nextStatus,
                          possession: nextStatus === 'Ready to Move' ? 'Immediate' : prev.possession
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12.5px',
                        background: '#ffffff',
                        fontWeight: 600
                      }}
                    >
                      <option value="Ready to Move">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="New Launch">New Launch / Upcoming</option>
                      <option value="Resale">Resale</option>
                    </select>
                  </div>

                  {formData.status === 'Under Construction' ? (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#E71D2B', marginBottom: '4px' }}>
                          Expected Possession Month *
                        </label>
                        <select
                          value={formData.possessionMonth}
                          onChange={e => setFormData({ ...formData, possessionMonth: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E71D2B',
                            background: '#FFF0F1',
                            color: '#E71D2B',
                            fontSize: '12px',
                            fontWeight: 700,
                            outline: 'none'
                          }}
                        >
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#E71D2B', marginBottom: '4px' }}>
                          Expected Possession Year *
                        </label>
                        <input
                          type="number"
                          min={new Date().getFullYear()}
                          value={formData.possessionYear}
                          onChange={e => setFormData({ ...formData, possessionYear: e.target.value })}
                          placeholder={`e.g. ${new Date().getFullYear() + 2}`}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E71D2B',
                            background: '#FFF0F1',
                            color: '#E71D2B',
                            fontSize: '12px',
                            fontWeight: 700,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Possession Timeline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Immediate / 30 Days"
                        value={formData.possession}
                        onChange={e => setFormData({ ...formData, possession: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px', background: '#ffffff' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Contact & Buying Details */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#E71D2B" />
                  Contact &amp; Buying Terms
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={formData.contactName}
                      onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98200..."
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Booking Token
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10% Token / ₹5 Lakhs"
                      value={formData.bookingAmount}
                      onChange={e => setFormData({ ...formData, bookingAmount: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Media Upload Section */}
              <div style={{ marginBottom: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={16} color="#E71D2B" />
                    Property Photos ({devicePhotos.length > 0 ? `${devicePhotos.length} Uploaded` : 'From Device or Preset'})
                  </div>
                  <button
                    type="button"
                    onClick={() => photoFileRef.current?.click()}
                    style={{
                      background: 'var(--accent-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 14px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <UploadCloud size={13} /> Upload Photos
                  </button>
                </div>

                <input
                  type="file"
                  ref={photoFileRef}
                  onChange={handleDevicePhotoSelect}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />

                {/* Device Photos Grid */}
                {devicePhotos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    {devicePhotos.map((img, i) => (
                      <div key={i} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', height: '64px', border: i === 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '2px', left: '2px', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '8px', padding: '1px 3px', borderRadius: '3px', fontWeight: 700 }}>
                          {i === 0 ? 'Cover' : `#${i + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDevicePhoto(i)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(231,29,43,0.85)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Architecture Presets */}
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Or Choose from Architecture Presets:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {PRESET_IMAGES.map((preset, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setDevicePhotos([]);
                        setFormData({ ...formData, imageUrl: preset.url, reelVideo: preset.video });
                      }}
                      style={{
                        border: (devicePhotos.length === 0 && formData.imageUrl === preset.url) ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#ffffff',
                        position: 'relative'
                      }}
                    >
                      <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '48px', objectFit: 'cover' }} />
                      <div style={{ fontSize: '9.5px', fontWeight: 600, padding: '3px', textAlign: 'center', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {preset.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Video Tour / Reel Upload from Device */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Video size={14} color="#E71D2B" />
                      Showcase Video Tour / Reel
                    </div>
                    <button
                      type="button"
                      onClick={() => videoFileRef.current?.click()}
                      style={{
                        background: '#ffffff',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Film size={12} color="#E71D2B" /> Choose Video
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={videoFileRef}
                    onChange={handleDeviceVideoSelect}
                    accept="video/*"
                    style={{ display: 'none' }}
                  />

                  {formData.reelVideo && (
                    <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: 'rgba(231,29,43,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E71D2B', flexShrink: 0 }}>
                        <Film size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {deviceVideo ? 'Video uploaded from device' : formData.reelVideo}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ready for Reels Feed</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setDeviceVideo(null); setFormData(f => ({ ...f, reelVideo: '' })); }}
                        style={{ background: 'none', border: 'none', color: '#E71D2B', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {uploadNotice && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    ✓ {uploadNotice}
                  </div>
                )}
              </div>

              {/* Amenities Checkbox Pills */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Key Amenities & Lifestyle Features
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {AMENITIES_LIST.map(item => {
                    const isChecked = formData.amenities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleAmenity(item)}
                        style={{
                          background: isChecked ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                          color: isChecked ? '#ffffff' : 'var(--text-secondary)',
                          border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isChecked && <CheckCircle2 size={12} />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-listing"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
              >
                {isSubmitting ? 'Publishing Luxury Listing...' : 'Publish Property Listing'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
