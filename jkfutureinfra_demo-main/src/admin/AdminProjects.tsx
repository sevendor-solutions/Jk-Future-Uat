import React, { useState } from 'react';
import type { Project, ProjectCategory, ProjectStatus, SiteCategory, City, LocationMaster } from '../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { addProject, updateProject, deleteProject, uploadImage, uploadMultipleImages } from '../utils/db';

interface AdminProjectsProps {
  projects: Project[];
  cities: City[];
  locations: LocationMaster[];
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({
  projects,
  cities,
  locations,
  onRefresh,
  onAddToast,
  onConfirm
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Upload states
  const [uploadingSpec, setUploadingSpec] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleSpecUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingSpec(true);
    try {
      const url = await uploadImage(e.target.files[0], 'MP');
      setSpecImage(url);
      onAddToast('Blueprint image uploaded successfully!', 'success');
    } catch (err: any) {
      onAddToast(err.message || 'Blueprint upload failed', 'error');
    } finally {
      setUploadingSpec(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImages(true);
    try {
      const urls = await uploadMultipleImages(e.target.files, 'MP');
      const currentUrls = imageUrl.split(',').map(u => u.trim()).filter(Boolean);
      const combinedUrls = [...currentUrls, ...urls].join(', ');
      setImageUrl(combinedUrls);
      onAddToast('Property images uploaded successfully!', 'success');
    } catch (err: any) {
      onAddToast(err.message || 'Images upload failed', 'error');
    } finally {
      setUploadingImages(false);
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
    setEditingProject(null);
    setName('');
    setCategory('Flats');
    setSubCategory('');
    setStatus('Ongoing');
    setLocation('');
    setDescription('');
    setPriceRange('₹50 L - ₹80 L');
    setPriceValue(5000000);
    setImageUrl('');
    setHighlightsText('Premium apartments\nExcellent security\n24/7 Power backup');
    setAmenitiesText('Clubhouse, Gymnasium, Swimming Pool, Gated Security');
    setLat(17.729);
    setLng(83.303);
    setFeatured(false);
    
    setFacing('East');
    setCity(cities.length > 0 ? cities[0].name : 'Visakhapatnam');
    setMicroLocation('');
    setFloors(5);
    setUnitsCount(50);
    setAvailabilityDetails('2 BHK: 20, 3 BHK: 30');
    setSpecImage('');
    
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setCategory(proj.category);
    setSubCategory(proj.subCategory || '');
    setStatus(proj.status);
    setLocation(proj.location);
    setDescription(proj.description);
    setPriceRange(proj.priceRange);
    setPriceValue(proj.priceValue);
    setImageUrl(proj.images.join(', '));
    setHighlightsText(proj.highlights.join('\n'));
    setAmenitiesText(proj.amenities.join(', '));
    setLat(proj.mapCoordinates.lat);
    setLng(proj.mapCoordinates.lng);
    setFeatured(proj.featured);
    
    setFacing(proj.facing || 'East');
    setCity(proj.city || 'Visakhapatnam');
    setMicroLocation(proj.microLocation || '');
    setFloors(proj.floors || 0);
    setUnitsCount(proj.unitsCount || 0);
    setAvailabilityDetails(proj.availabilityDetails || '');
    setSpecImage(proj.specImage || '');
    
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (await onConfirm(`Are you sure you want to delete "${name}"? This will also remove any related visual gallery entries.`)) {
      try {
        await deleteProject(id);
        onAddToast(`Project "${name}" has been deleted.`, 'success');
        onRefresh();
      } catch (error) {
        onAddToast('Failed to delete project.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !description.trim()) {
      onAddToast('Please fill in all mandatory fields', 'error');
      return;
    }

    // Split inputs
    const imagesArray = imageUrl.split(',').map(url => url.trim()).filter(Boolean);
    const highlightsArray = highlightsText.split('\n').map(h => h.trim()).filter(Boolean);
    const amenitiesArray = amenitiesText.split(',').map(a => a.trim()).filter(Boolean);

    const projectData: Project = {
      id: editingProject ? editingProject.id : 'p_' + Date.now(),
      name,
      category,
      subCategory: category === 'Sites' && subCategory ? (subCategory as SiteCategory) : undefined,
      status,
      location,
      description,
      images: imagesArray,
      highlights: highlightsArray,
      amenities: amenitiesArray,
      timeline: editingProject ? editingProject.timeline : [
        { id: 't_init', date: 'Jan 2026', title: 'Project Scaffolding', desc: 'Ground breaking ceremony and excavation starting.' }
      ],
      floorPlans: editingProject ? editingProject.floorPlans : [
        { id: 'f_init', title: 'Master Layout Plan', image: '' }
      ],
      priceRange,
      priceValue: Number(priceValue) || 0,
      paymentPlans: editingProject ? editingProject.paymentPlans : ['Booking Advance: 10%', 'Installments: 80%', 'Handover: 10%'],
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
      if (editingProject) {
        await updateProject(projectData);
        onAddToast(`Project "${name}" updated successfully.`, 'success');
      } else {
        await addProject(projectData);
        onAddToast(`New project "${name}" added successfully.`, 'success');
      }
      setModalOpen(false);
      onRefresh();
    } catch (error) {
      onAddToast('Failed to save project.', 'error');
    }
  };

  return (
    <div className="admin-projects-view">
      <div className="flex justify-between align-center mb-3">
        <h2>Manage Properties</h2>
        <button onClick={handleOpenAdd} className="btn btn-secondary btn-sm flex align-center gap-0.5">
          <Plus size={16} /> Add New Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Price Target</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(proj => (
              <tr key={proj.id}>
                <td className="font-semibold">{proj.name}</td>
                <td>
                  <span className="font-semibold text-secondary">{proj.category}</span>
                  {proj.subCategory && <div className="text-xs text-muted">({proj.subCategory})</div>}
                </td>
                <td>{proj.location}</td>
                <td>{proj.priceRange}</td>
                <td>
                  <span className={`badge badge-${proj.status.toLowerCase()}`}>{proj.status}</span>
                </td>
                <td>
                  {proj.featured ? (
                    <span className="text-success flex align-center gap-0.5"><CheckCircle2 size={16} /> Yes</span>
                  ) : (
                    <span className="text-muted flex align-center gap-0.5"><XCircle size={16} /> No</span>
                  )}
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button 
                      onClick={() => handleOpenEdit(proj)}
                      className="btn btn-sm btn-outline btn-icon-only"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(proj.id, proj.name)}
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
                  {editingProject ? 'Edit Property Details' : 'Create New Property'}
                </h3>
                {editingProject && <p className="modal-subtitle">Updating: <strong>{editingProject.name}</strong></p>}
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
                    <label className="form-label">Project Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter project name..." 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status *</label>
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
                    <label className="form-label">Main Category *</label>
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

                  {category === 'Sites' && (
                    <div className="form-group">
                      <label className="form-label">Site Classification *</label>
                      <select 
                        className="form-control" 
                        value={subCategory}
                        onChange={e => setSubCategory(e.target.value as SiteCategory)}
                        required
                      >
                        <option value="">Select Sub-category</option>
                        <option value="Development Sites">Development Sites</option>
                        <option value="Panchayati Approved Sites">Panchayati Approved Sites</option>
                        <option value="VUDA Approved Sites">VUDA Approved Sites</option>
                        <option value="Ventures">Ventures</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Section 2: Location & Address */}
                <div className="modal-section-title">Location & Address</div>
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
                    {!city && <div className="text-xxs text-muted mt-0.5">Select city first</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Facing Direction</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. East, West, North East" 
                      value={facing}
                      onChange={e => setFacing(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location Address *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Madhurawada, Visakhapatnam" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                  />
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
                <div className="modal-section-title">Configurations & Pricing</div>
                <div className="grid grid-3 gap-2">
                  <div className="form-group">
                    <label className="form-label">Total Floors</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 5" 
                      value={floors}
                      onChange={e => setFloors(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Units Count</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 120" 
                      value={unitsCount}
                      onChange={e => setUnitsCount(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">BHK / Plot Configurations</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 2 BHK: 30, 3 BHK: 20" 
                      value={availabilityDetails}
                      onChange={e => setAvailabilityDetails(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-2 gap-2">
                  <div className="form-group">
                    <label className="form-label">Price Range Text *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. ₹55 L - ₹90 L" 
                      value={priceRange}
                      onChange={e => setPriceRange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sort Value (Price Number) *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 5500000" 
                      value={priceValue}
                      onChange={e => setPriceValue(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Section 4: Media & Details */}
                <div className="modal-section-title">Media & Details</div>
                <div className="form-group">
                  <label className="form-label">Blueprint/Specifications Image</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://... or upload local file" 
                      value={specImage}
                      onChange={e => setSpecImage(e.target.value)}
                      style={{ marginBottom: 0, flex: 1 }}
                    />
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {uploadingSpec ? 'Uploading...' : 'Upload File'}
                      <input type="file" accept="image/*" onChange={handleSpecUpload} style={{ display: 'none' }} disabled={uploadingSpec} />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Property Images (Comma-separated URLs)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="URL1, URL2, URL3... or upload files below" 
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      style={{ marginBottom: 0 }}
                    />
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {uploadingImages ? 'Uploading Images...' : 'Upload Property Images'}
                      <input type="file" accept="image/*" multiple onChange={handleImagesUpload} style={{ display: 'none' }} disabled={uploadingImages} />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Overview *</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="Describe the property, builders specifications, and environment..." 
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
                      placeholder="Highlight 1&#10;Highlight 2..." 
                      value={highlightsText}
                      onChange={e => setHighlightsText(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amenities (Comma-separated)</label>
                    <textarea 
                      className="form-control" 
                      rows={3} 
                      placeholder="Clubhouse, Gym, Pool..." 
                      value={amenitiesText}
                      onChange={e => setAmenitiesText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="checkbox-group-premium">
                  <input 
                    type="checkbox" 
                    id="chkFeatured" 
                    checked={featured} 
                    onChange={e => setFeatured(e.target.checked)} 
                  />
                  <label htmlFor="chkFeatured">Show as Featured Project on Hero Banner</label>
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
