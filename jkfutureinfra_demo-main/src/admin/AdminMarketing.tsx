import React, { useState } from 'react';
import type { Project, ProjectCategory, ProjectStatus, SiteCategory, City, LocationMaster } from '../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { addMarketing, updateMarketing, deleteMarketing, uploadImage } from '../utils/db';

interface AdminMarketingProps {
  marketing: Project[];
  cities: City[];
  locations: LocationMaster[];
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminMarketing: React.FC<AdminMarketingProps> = ({
  marketing,
  cities,
  locations,
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

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Flats');
  const [subCategory, setSubCategory] = useState<SiteCategory | ''>('');
  const [status, setStatus] = useState<ProjectStatus>('Ongoing');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [priceValue, setPriceValue] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [lat, setLat] = useState(17.7);
  const [lng, setLng] = useState(83.3);
  const [featured, setFeatured] = useState(false);

  // Custom filterable fields
  const [facing, setFacing] = useState('East');
  const [city, setCity] = useState('Visakhapatnam');
  const [microLocation, setMicroLocation] = useState('');
  const [floors, setFloors] = useState(0);
  const [unitsCount, setUnitsCount] = useState(0);
  const [availabilityDetails, setAvailabilityDetails] = useState('');
  const [specImage, setSpecImage] = useState('');

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
    setAmenitiesText('Clubhouse, Swimming Pool, Gated Security');
    setLat(17.702);
    setLng(83.238);
    setFeatured(false);

    setFacing('East');
    setCity('Visakhapatnam');
    setMicroLocation('Sheela Nagar');
    setFloors(10);
    setUnitsCount(120);
    setAvailabilityDetails('2 BHK: 30, 3 BHK: 20');
    setSpecImage('');

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
    setAmenitiesText(prop.amenities.join(', '));
    setLat(prop.mapCoordinates.lat);
    setLng(prop.mapCoordinates.lng);
    setFeatured(prop.featured);

    setFacing(prop.facing || 'East');
    setCity(prop.city || 'Visakhapatnam');
    setMicroLocation(prop.microLocation || '');
    setFloors(prop.floors || 0);
    setUnitsCount(prop.unitsCount || 0);
    setAvailabilityDetails(prop.availabilityDetails || '');
    setSpecImage(prop.specImage || '');

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
    const amenitiesArray = amenitiesText.split(',').map(a => a.trim()).filter(Boolean);

    const propertyData: Project = {
      id: editingProperty ? editingProperty.id : 'm_' + Date.now(),
      name,
      category,
      subCategory: category === 'Sites' && subCategory ? (subCategory as SiteCategory) : undefined,
      status,
      location,
      description,
      images: imagesArray,
      highlights: highlightsArray,
      amenities: amenitiesArray,
      timeline: editingProperty ? editingProperty.timeline : [
        { id: 't_init', date: 'Jan 2026', title: 'Plotting & Inception', desc: 'Venture registration and layout development.' }
      ],
      floorPlans: editingProperty ? editingProperty.floorPlans : [
        { id: 'f_init', title: 'Master Layout Plan', image: '' }
      ],
      priceRange,
      priceValue: Number(priceValue) || 0,
      paymentPlans: editingProperty ? editingProperty.paymentPlans : ['Booking Advance: 10%', 'Milestones: 60%', 'Registration: 30%'],
      mapCoordinates: { lat: Number(lat) || 17.7, lng: Number(lng) || 83.3 },
      brochureUrl: '#',
      featured,
      facing,
      city,
      microLocation,
      floors: Number(floors) || 0,
      unitsCount: Number(unitsCount) || 0,
      availabilityDetails,
      specImage: specImage || ''
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

  return (
    <div className="admin-projects-view">
      <div className="flex justify-between align-center mb-3">
        <h2>Manage Marketing Showcase</h2>
        <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm flex align-center gap-0.5">
          <Plus size={16} /> Add Marketing Property
        </button>
      </div>

      {/* Marketing Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Location / City</th>
              <th>Price Target</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {marketing.map(prop => (
              <tr key={prop.id}>
                <td className="font-semibold">{prop.name}</td>
                <td>
                  <span className="font-semibold text-secondary">{prop.category}</span>
                  {prop.subCategory && <div className="text-xs text-muted">({prop.subCategory})</div>}
                </td>
                <td>
                  <div>{prop.location}</div>
                  <div className="text-xs text-muted font-semibold">{prop.city}</div>
                </td>
                <td>{prop.priceRange}</td>
                <td>
                  <span className={`badge badge-${prop.status.toLowerCase()}`}>{prop.status}</span>
                </td>
                <td>
                  {prop.featured ? (
                    <span className="text-success flex align-center gap-0.5"><CheckCircle2 size={16} /> Yes</span>
                  ) : (
                    <span className="text-muted flex align-center gap-0.5"><XCircle size={16} /> No</span>
                  )}
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button
                      onClick={() => handleOpenEdit(prop)}
                      className="btn btn-sm btn-outline btn-icon-only"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(prop.id, prop.name)}
                      className="btn btn-sm btn-outline btn-icon-only"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {marketing.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">No marketing properties created yet. Click "Add Marketing Property" to insert one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                <div className="grid grid-2 gap-2">
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

                  <div className="form-group">
                    <label className="form-label">Project Status *</label>
                    <select
                      className="form-control"
                      value={status}
                      onChange={e => setStatus(e.target.value as ProjectStatus)}
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Marketing Segment Category *</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={e => setCategory(e.target.value as ProjectCategory)}
                    >
                      <option value="Flats">Flats</option>
                      <option value="Villas">Villas</option>
                      <option value="Individual Houses">Individual Houses</option>
                      <option value="Sites">Sites / Plots</option>
                    </select>
                  </div>

                  {category === 'Sites' ? (
                    <div className="form-group">
                      <label className="form-label">Site subCategory Classification *</label>
                      <select
                        className="form-control"
                        value={subCategory}
                        onChange={e => setSubCategory(e.target.value as SiteCategory)}
                        required
                      >
                        <option value="">Select subCategory</option>
                        <option value="Development Sites">Development Sites</option>
                        <option value="Panchayati Approved Sites">Panchayati Approved Sites</option>
                        <option value="VUDA Approved Sites">VUDA Approved Sites</option>
                        <option value="Ventures">Ventures</option>
                      </select>
                    </div>
                  ) : null}
                </div>

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
                <div className="grid grid-3 gap-2">
                  <div className="form-group">
                    <label className="form-label">Total Floors</label>
                    <input
                      type="number"
                      className="form-control"
                      value={floors}
                      onChange={e => setFloors(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Units Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={unitsCount}
                      onChange={e => setUnitsCount(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Property Facing (if Sites)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. East, West"
                      value={facing}
                      disabled={category !== 'Sites'}
                      onChange={e => setFacing(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-3 gap-2">
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

                  <div className="form-group">
                    <label className="form-label">Availability details badge</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Plots: 35 or 3 BHK: 12"
                      value={availabilityDetails}
                      onChange={e => setAvailabilityDetails(e.target.value)}
                    />
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

                <div className="grid grid-2 gap-2">
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
                    <label className="form-label">Amenities (Comma separated)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Clubhouse, BT Roads, Water Connection..."
                      value={amenitiesText}
                      onChange={e => setAmenitiesText(e.target.value)}
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
