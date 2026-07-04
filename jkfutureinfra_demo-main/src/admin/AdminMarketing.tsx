import React, { useState } from 'react';
import type { Project, ProjectCategory, ProjectStatus, City, LocationMaster, PropertyType, Facing, Amenity } from '../types';
import { Edit2, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { addMarketing, updateMarketing, deleteMarketing, uploadImage } from '../utils/db';
import { ALVGrid } from './ALVGrid';
import type { ALVColumn } from './ALVGrid';

interface AdminMarketingProps {
  marketing: Project[];
  cities: City[];
  locations: LocationMaster[];
  propertyTypes: PropertyType[];
  facings: Facing[];
  amenities: Amenity[];
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminMarketing: React.FC<AdminMarketingProps> = ({
  marketing,
  cities,
  locations,
  propertyTypes,
  facings,
  amenities,
  onRefresh,
  onAddToast,
  onConfirm
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Project | null>(null);

  // Upload states
  const [uploadingElevation, setUploadingElevation] = useState(false);
  const [uploadingSpec, setUploadingSpec] = useState(false);

  const handleElevationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingElevation(true);
    try {
      const url = await uploadImage(e.target.files[0], 'MMS');
      setImageUrl(url);
      onAddToast('Elevation render image uploaded successfully!', 'success');
    } catch (err: any) {
      onAddToast(err.message || 'Elevation image upload failed', 'error');
    } finally {
      setUploadingElevation(false);
    }
  };

  const handleSpecUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingSpec(true);
    try {
      const url = await uploadImage(e.target.files[0], 'MMS');
      setSpecImage(url);
      onAddToast('Blueprint image uploaded successfully!', 'success');
    } catch (err: any) {
      onAddToast(err.message || 'Blueprint upload failed', 'error');
    } finally {
      setUploadingSpec(false);
    }
  };

  // Helper function to parse availability string (e.g. "2 BHK: 30, 3 BHK: 20")
  const parseAvailabilityDetails = (details: string) => {
    const result: { [type: string]: string } = {};
    if (!details) return result;
    details.split(',').forEach(item => {
      const parts = item.split(':');
      if (parts.length === 2) {
        const type = parts[0].trim();
        const count = parts[1].trim();
        if (type && count !== '') {
          result[type] = count;
        }
      }
    });
    return result;
  };

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Flats');
  const [subCategory, setSubCategory] = useState<string>('');
  const [status, setStatus] = useState<ProjectStatus>('Ongoing');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [priceValue, setPriceValue] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [lat, setLat] = useState(17.7);
  const [lng, setLng] = useState(83.3);
  const [featured, setFeatured] = useState(false);

  // Custom filterable fields
  const [selectedFacings, setSelectedFacings] = useState<string[]>([]);
  const [city, setCity] = useState('Visakhapatnam');
  const [microLocation, setMicroLocation] = useState('');
  const [floors, setFloors] = useState(0);
  const [unitsCount, setUnitsCount] = useState(0);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [configValues, setConfigValues] = useState<{ [type: string]: string }>({});
  const [specImage, setSpecImage] = useState('');
  const [uds, setUds] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [classification, setClassification] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [marketingResult, setMarketingResult] = useState('');

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setName('');
    setCategory('Flats');
    setSubCategory('');
    setStatus('Ongoing');
    setLocation('');
    setDescription('');
    setPriceRange('₹65 L - ₹95 L');
    setPriceValue(6500000);
    setImageUrl('');
    setHighlightsText('Modern urban living\nRERA Approved\nPremium quality specifications');
    setSelectedAmenities(['Clubhouse', 'Gymnasium', 'Swimming Pool', 'Gated Security']);
    setLat(17.702);
    setLng(83.238);
    setFeatured(false);

    setSelectedFacings(['East']);
    setCity('Visakhapatnam');
    setMicroLocation('Sheela Nagar');
    setFloors(10);
    setUnitsCount(0);
    setSelectedPropertyTypes(['2 BHK', '3 BHK']);
    setConfigValues({ '2 BHK': '30', '3 BHK': '20' });
    setSpecImage('');
    setUds('');
    setWidth('');
    setLength('');
    setClassification('');
    setIsActive(true);
    setRemarks('');
    setMarketingResult('');

    setModalOpen(true);
  };

  const handleOpenEdit = (prop: Project) => {
    setEditingProperty(prop);
    setName(prop.name);
    setCategory(prop.category);
    setSubCategory(prop.subCategory || '');
    setStatus(prop.status);
    setLocation(prop.location);
    setDescription(prop.description);
    setPriceRange(prop.priceRange);
    setPriceValue(prop.priceValue);
    setImageUrl(prop.images.join(', '));
    setHighlightsText(prop.highlights.join('\n'));
    setSelectedAmenities(prop.amenities || []);
    setLat(prop.mapCoordinates.lat);
    setLng(prop.mapCoordinates.lng);
    setFeatured(prop.featured);

    const initialFacings = prop.facing 
      ? prop.facing.split(',').map(f => f.trim()).filter(Boolean) 
      : [];
    setSelectedFacings(initialFacings);
    
    setCity(prop.city || 'Visakhapatnam');
    setMicroLocation(prop.microLocation || '');
    setFloors(prop.floors || 0);
    setUnitsCount(prop.unitsCount || 0);
    
    const parsedValues = parseAvailabilityDetails(prop.availabilityDetails || '');
    setSelectedPropertyTypes(Object.keys(parsedValues));
    setConfigValues(parsedValues);
    
    setSpecImage(prop.specImage || '');
    setUds(prop.uds || '');
    setWidth(prop.width || '');
    setLength(prop.length || '');
    setClassification(prop.classification || '');
    setIsActive(prop.isActive !== false);
    setRemarks(prop.remarks || '');
    setMarketingResult(prop.marketingResult || '');

    setModalOpen(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (await onConfirm(`Are you sure you want to delete "${name}" from the marketing verticals?`)) {
      try {
        await deleteMarketing(id);
        onAddToast(`Marketing property "${name}" has been deleted.`, 'success');
        onRefresh();
      } catch (error) {
        onAddToast('Failed to delete marketing property.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !description.trim()) {
      onAddToast('Please fill in all mandatory fields', 'error');
      return;
    }

    const imagesArray = imageUrl.split(',').map(url => url.trim()).filter(Boolean);
    const highlightsArray = highlightsText.split('\n').map(h => h.trim()).filter(Boolean);

    // Serialize multi-select fields
    const facingString = selectedFacings.join(', ');
    const availabilityString = selectedPropertyTypes
      .map(type => {
        const val = configValues[type] !== undefined ? configValues[type] : '0';
        return `${type}: ${val}`;
      })
      .join(', ');

    const propertyData: Project = {
      id: editingProperty ? editingProperty.id : 'm_' + Date.now(),
      name,
      category,
      subCategory: subCategory ? subCategory : undefined,
      status,
      location,
      description,
      images: imagesArray,
      highlights: highlightsArray,
      amenities: selectedAmenities,
      timeline: editingProperty ? editingProperty.timeline : [
        { id: 't_init', date: 'Jan 2026', title: 'Plotting & Inception', desc: 'Venture registration and layout development.' }
      ],
      floorPlans: (() => {
        const plans = editingProperty ? [...editingProperty.floorPlans] : [
          { id: 'f_init', title: 'Master Layout Plan', image: specImage || '' }
        ];
        if (plans.length > 0 && plans[0].id === 'f_init') {
          plans[0] = { ...plans[0], image: specImage || '' };
        }
        return plans;
      })(),
      priceRange,
      priceValue: Number(priceValue) || 0,
      paymentPlans: editingProperty ? editingProperty.paymentPlans : ['Booking Advance: 10%', 'Milestones: 60%', 'Registration: 30%'],
      mapCoordinates: { lat: Number(lat) || 17.7, lng: Number(lng) || 83.3 },
      brochureUrl: '#',
      featured,
      facing: facingString,
      city,
      microLocation,
      floors: Number(floors) || 0,
      unitsCount: Number(unitsCount) || 0,
      availabilityDetails: availabilityString,
      specImage: specImage || '',
      uds: (category === 'Flats' || category === 'Sites') ? uds : undefined,
      width: category === 'Sites' ? width : undefined,
      length: category === 'Sites' ? length : undefined,
      classification: classification || undefined,
      isActive,
      remarks: remarks || undefined,
      marketingResult: !isActive ? (marketingResult || undefined) : undefined
    };

    try {
      if (editingProperty) {
        await updateMarketing(propertyData);
        onAddToast(`Marketing property "${name}" updated successfully.`, 'success');
      } else {
        await addMarketing(propertyData);
        onAddToast(`New marketing property "${name}" added successfully.`, 'success');
      }
      setModalOpen(false);
      onRefresh();
    } catch (error) {
      onAddToast('Failed to save marketing property.', 'error');
    }
  };

  const marketingColumns: ALVColumn[] = [
    {
      key: 'name',
      label: 'Name',
      render: (_v, row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{String(row.name)}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (_v, row) => {
        const r = row as any;
        return (
          <div>
            <span style={{ fontWeight: 700, color: 'var(--color-secondary, #6d28d9)' }}>{String(r.category)}</span>
            {r.subCategory && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({String(r.subCategory)})</div>
            )}
            {r.classification && (
              <div style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 600, marginTop: '2px' }}>{String(r.classification)}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'location',
      label: 'Location',
      render: (_v, row) => (
        <div>
          <div>{String(row.location)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{String(row.city ?? '')}</div>
        </div>
      ),
    },
    {
      key: 'priceRange',
      label: 'Price Range',
    },
    {
      key: 'status',
      label: 'Status',
      render: (_v, row) => (
        <span className={`badge badge-${String(row.status).toLowerCase()}`}>{String(row.status)}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Activity Status',
      render: (_v, row) => {
        const r = row as any;
        const active = r.isActive !== false;
        return (
          <span 
            className={`badge`} 
            style={{ 
              backgroundColor: active ? '#e1f4e9' : (r.marketingResult === 'Success' ? '#e6f4ea' : '#fce8e6'), 
              color: active ? '#1e7e34' : (r.marketingResult === 'Success' ? '#137333' : '#c5221f'),
              border: `1px solid ${active ? '#c3edd5' : (r.marketingResult === 'Success' ? '#ceead6' : '#fad2cf')}`
            }}
          >
            {active ? 'Active' : `Inactive (${r.marketingResult || 'No Outcome'})`}
          </span>
        );
      }
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (_v, row) => {
        const r = row as any;
        return (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} title={r.remarks}>
            {r.remarks ? (r.remarks.length > 30 ? r.remarks.substring(0, 30) + '...' : r.remarks) : '-'}
          </span>
        );
      }
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (_v, row) =>
        row.featured ? (
          <span style={{ color: 'var(--color-success, #16a34a)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={16} /> Yes
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <XCircle size={16} /> No
          </span>
        ),
    },
    {
      key: '__actions',
      label: 'Actions',
      sortable: false,
      width: '90px',
      align: 'center',
      render: (_v, row) => (
        <div className="admin-table-actions" style={{ justifyContent: 'center' }}>
          <button
            onClick={() => handleOpenEdit(row as unknown as Project)}
            className="alv-toolbar-btn"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => handleDeleteClick(String(row.id), String(row.name))}
            className="alv-toolbar-btn"
            title="Delete"
            style={{ color: '#dc2626', borderColor: '#dc2626' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-projects-view">
      <ALVGrid
        title="Manage Marketing"
        subtitle={`${marketing.length} ${marketing.length === 1 ? 'item' : 'items'}`}
        columns={marketingColumns}
        data={marketing as unknown as Record<string, unknown>[]}
        rowKey="id"
        onAdd={handleOpenAdd}
        addLabel="Add Marketing"
        onRefresh={onRefresh}
        searchPlaceholder="Search marketing..."
        emptyText="No marketing properties created yet."
      />

      {/* Modal Form */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content premium-admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div>
                <h3 className="modal-title">
                  {editingProperty ? 'Edit Marketing Showcase' : 'Create Marketing Showcase'}
                </h3>
                {editingProperty && <p className="modal-subtitle">Updating: <strong>{editingProperty.name}</strong></p>}
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-premium">
              <div className="modal-body-premium">
                {/* Section 1: Basic Specifications */}
                <div className="modal-section-title">Basic Specifications</div>
                <div className="form-group">
                  <label className="form-label">Property Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. JK Whispering Pines"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-3 gap-2">
                  <div className="form-group">
                    <label className="form-label" style={{ minHeight: '34px', display: 'flex', alignItems: 'flex-end', marginBottom: '0.35rem' }}>Marketing Segment *</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={e => {
                        const newCat = e.target.value as ProjectCategory;
                        setCategory(newCat);
                        setSubCategory('');
                      }}
                    >
                      <option value="Flats">Flats</option>
                      <option value="Villas">Villas</option>
                      <option value="Individual Houses">Individual Houses</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Sites">Sites / Plots</option>
                    </select>
                  </div>

                  {category === 'Sites' ? (
                    <div className="form-group">
                      <label className="form-label" style={{ minHeight: '34px', display: 'flex', alignItems: 'flex-end', marginBottom: '0.35rem' }}>Subcategory *</label>
                      <select
                        className="form-control"
                        value={subCategory}
                        onChange={e => setSubCategory(e.target.value)}
                        required
                      >
                        <option value="">Select subCategory</option>
                        <option value="Development Sites">Development Sites</option>
                        <option value="Panchayati Approved Sites">Panchayati Approved Sites</option>
                        <option value="VUDA Approved Sites">VUDA Approved Sites</option>
                        <option value="Ventures">Ventures</option>
                      </select>
                    </div>
                  ) : (category === 'Flats' || category === 'Villas' || category === 'Individual Houses' || category === 'Duplex') ? (
                    <div className="form-group">
                      <label className="form-label" style={{ minHeight: '34px', display: 'flex', alignItems: 'flex-end', marginBottom: '0.35rem' }}>Subcategory *</label>
                      <select
                        className="form-control"
                        value={subCategory}
                        onChange={e => setSubCategory(e.target.value)}
                        required
                      >
                        <option value="">Select subCategory</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Ready to Move">Ready to Move</option>
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label" style={{ minHeight: '34px', display: 'flex', alignItems: 'flex-end', marginBottom: '0.35rem' }}>Subcategory</label>
                      <input className="form-control" disabled value="N/A" />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ minHeight: '34px', display: 'flex', alignItems: 'flex-end', marginBottom: '0.35rem' }}>Classification *</label>
                    <select
                      className="form-control"
                      value={classification}
                      onChange={e => setClassification(e.target.value)}
                      required
                    >
                      <option value="">Select Classification</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Semi Commercial">Semi Commercial</option>
                    </select>
                  </div>
                </div>

                {category === 'Flats' && (
                  <div className="form-group">
                    <label className="form-label">UDS (Sq. Yds) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 35"
                      value={uds}
                      onChange={e => setUds(e.target.value)}
                      required
                    />
                  </div>
                )}

                {category === 'Sites' && (
                  <>
                    <div className="grid grid-2 gap-2">
                      <div className="form-group">
                        <label className="form-label">Site Width (ft) *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 30"
                          value={width}
                          onChange={e => {
                            const newWidth = e.target.value;
                            setWidth(newWidth);
                            const w = parseFloat(newWidth);
                            const l = parseFloat(length);
                            if (!isNaN(w) && !isNaN(l)) {
                              setUds(String(Math.round((w * l / 9) * 100) / 100));
                            }
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Site Length (ft) *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 40"
                          value={length}
                          onChange={e => {
                            const newLength = e.target.value;
                            setLength(newLength);
                            const w = parseFloat(width);
                            const l = parseFloat(newLength);
                            if (!isNaN(w) && !isNaN(l)) {
                              setUds(String(Math.round((w * l / 9) * 100) / 100));
                            }
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Total Sq. Yards *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Calculated automatically, or enter manually"
                        value={uds}
                        onChange={e => setUds(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Section 2: Location & Address */}
                <div className="modal-section-title">Location &amp; Address</div>
                <div className="grid grid-3 gap-2">
                  <div className="form-group">
                    <label className="form-label">City Location *</label>
                    <select
                      className="form-control"
                      value={city}
                      onChange={e => {
                        setCity(e.target.value);
                        setMicroLocation('');
                      }}
                      required
                    >
                      <option value="">Select City</option>
                      {cities.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Micro Location Area *</label>
                    <select
                      className="form-control"
                      value={microLocation}
                      onChange={e => setMicroLocation(e.target.value)}
                      required
                      disabled={!city}
                    >
                      <option value="">Select Location</option>
                      {locations
                        .filter(l => {
                          const cityObj = cities.find(c => c.name === city);
                          return cityObj ? l.cityId === cityObj.id : false;
                        })
                        .map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Detailed Address *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bheemili Highway Road, Visakhapatnam"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Facing Directions * (Select multiple)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.4rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    {(facings && facings.length > 0 ? facings : [
                      { id: 'df1', name: 'East' },
                      { id: 'df2', name: 'West' },
                      { id: 'df3', name: 'North' },
                      { id: 'df4', name: 'South' },
                      { id: 'df5', name: 'North East' },
                      { id: 'df6', name: 'North West' }
                    ]).map(f => {
                      const isChecked = selectedFacings.includes(f.name);
                      return (
                        <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none' }}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFacings(prev => [...prev, f.name]);
                              } else {
                                setSelectedFacings(prev => prev.filter(item => item !== f.name));
                              }
                            }}
                            style={{ width: '16px', height: '16px', margin: 0 }}
                          />
                          {f.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Latitude Offset</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control"
                      value={lat}
                      onChange={e => setLat(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude Offset</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-control"
                      value={lng}
                      onChange={e => setLng(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Section 3: Configurations & Pricing */}
                <div className="modal-section-title">Configurations &amp; Pricing</div>
                {category !== 'Sites' && (
                  <div className="form-group">
                    <label className="form-label">Total Floors</label>
                    <input
                      type="number"
                      className="form-control"
                      value={floors}
                      onChange={e => setFloors(Number(e.target.value))}
                    />
                  </div>
                )}

                <div className="grid grid-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Price Range Text *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ₹45 L - ₹90 L"
                      value={priceRange}
                      onChange={e => setPriceRange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Numeric Price Value (Sorting) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 4500000"
                      value={priceValue}
                      onChange={e => setPriceValue(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">BHK / Plot Configurations * (Check config to enable quantity)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.4rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    {(propertyTypes && propertyTypes.length > 0 ? propertyTypes : [
                      { id: 'dpt1', name: '1 BHK' },
                      { id: 'dpt2', name: '2 BHK' },
                      { id: 'dpt3', name: '3 BHK' },
                      { id: 'dpt4', name: '4 BHK' },
                      { id: 'dpt5', name: 'Plots' },
                      { id: 'dpt6', name: 'Villa' }
                    ]).map(pt => {
                      const isChecked = selectedPropertyTypes.includes(pt.name);
                      const countValue = configValues[pt.name] !== undefined ? configValues[pt.name] : '';
                      return (
                        <div key={pt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', padding: '0.25rem', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', flex: 1, userSelect: 'none' }}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPropertyTypes(prev => [...prev, pt.name]);
                                  setConfigValues(prev => ({ ...prev, [pt.name]: '0' }));
                                } else {
                                  setSelectedPropertyTypes(prev => prev.filter(item => item !== pt.name));
                                  setConfigValues(prev => {
                                    const next = { ...prev };
                                    delete next[pt.name];
                                    return next;
                                  });
                                }
                              }}
                              style={{ width: '16px', height: '16px', margin: 0 }}
                            />
                            {pt.name}
                          </label>
                          <input 
                            type="number"
                            placeholder="Qty"
                            className="form-control"
                            style={{ width: '70px', height: '28px', margin: 0, padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                            value={countValue}
                            disabled={!isChecked}
                            onChange={(e) => {
                              const val = e.target.value;
                              setConfigValues(prev => ({ ...prev, [pt.name]: val }));
                            }}
                            min="0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Media & Details */}
                <div className="modal-section-title">Media &amp; Details</div>
                <div className="grid grid-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Elevation Render Image</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://images.unsplash.com/... or upload"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        style={{ marginBottom: 0, flex: 1 }}
                      />
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {uploadingElevation ? 'Uploading...' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleElevationUpload} style={{ display: 'none' }} disabled={uploadingElevation} />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specifications Blueprint Image</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://images.unsplash.com/... or upload"
                        value={specImage}
                        onChange={e => setSpecImage(e.target.value)}
                        style={{ marginBottom: 0, flex: 1 }}
                      />
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {uploadingSpec ? 'Uploading...' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleSpecUpload} style={{ display: 'none' }} disabled={uploadingSpec} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Marketing Overview Description *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe selling points, advantages, proximity details..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Highlights (One per line)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Highlights list..."
                    value={highlightsText}
                    onChange={e => setHighlightsText(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Amenities * (Select multiple)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.4rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    {(amenities && amenities.length > 0 ? amenities : [
                      { id: 'da1', name: 'Clubhouse' },
                      { id: 'da2', name: 'Gymnasium' },
                      { id: 'da3', name: 'Swimming Pool' },
                      { id: 'da4', name: 'Gated Security' }
                    ]).map(a => {
                      const isChecked = selectedAmenities.includes(a.name);
                      return (
                        <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none' }}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAmenities(prev => [...prev, a.name]);
                              } else {
                                setSelectedAmenities(prev => prev.filter(item => item !== a.name));
                              }
                            }}
                            style={{ width: '16px', height: '16px', margin: 0 }}
                          />
                          {a.name}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-section-title">Marketing Status &amp; Remarks</div>
                <div className={!isActive ? "grid grid-3 gap-2" : "grid grid-2 gap-2"}>
                  <div className="form-group">
                    <label className="form-label">Marketing Status</label>
                    <select
                      className="form-control"
                      value={isActive ? 'Active' : 'Inactive'}
                      onChange={e => {
                        const val = e.target.value === 'Active';
                        setIsActive(val);
                        if (val) {
                          setMarketingResult('');
                        }
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  {!isActive && (
                    <div className="form-group">
                      <label className="form-label">Deal Outcome *</label>
                      <select
                        className="form-control"
                        value={marketingResult}
                        onChange={e => setMarketingResult(e.target.value)}
                        required={!isActive}
                      >
                        <option value="">Select Outcome</option>
                        <option value="Success">Success</option>
                        <option value="Failure">Failure</option>
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Success/Failure Remarks</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Lead converted successfully"
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                    />
                  </div>
                </div>

                <div className="checkbox-group-premium">
                  <input
                    type="checkbox"
                    id="chkMktFeatured"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                  />
                  <label htmlFor="chkMktFeatured">Show as Featured Project on Hero Banner</label>
                </div>
              </div>

              <div className="modal-footer-premium">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-secondary btn-sm">Save Property</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
