import React, { useState } from 'react';
import type { Project, ProjectCategory, ProjectStatus, City, LocationMaster, PropertyType, Facing, Amenity } from '../types';
import { Edit2, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { addProject, updateProject, deleteProject, uploadImage, uploadMultipleImages } from '../utils/db';
import { ALVGrid } from './ALVGrid';
import type { ALVColumn } from './ALVGrid';

interface AdminProjectsProps {
  projects: Project[];
  cities: City[];
  locations: LocationMaster[];
  propertyTypes: PropertyType[];
  facings: Facing[];
  amenities: Amenity[];
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({
  projects,
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
  const [classification, setClassification] = useState('');
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
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [uds, setUds] = useState('');

  const handleOpenAdd = () => {
    setEditingProject(null);
    setName('');
    setCategory('Flats');
    setSubCategory('');
    setClassification('');
    setStatus('Ongoing');
    setLocation('');
    setDescription('');
    setPriceRange('₹50 L - ₹80 L');
    setPriceValue(5000000);
    setImageUrl('');
    setHighlightsText('Premium apartments\nExcellent security\n24/7 Power backup');
    setSelectedAmenities(['Clubhouse', 'Gymnasium', 'Swimming Pool', 'Gated Security']);
    setLat(17.729);
    setLng(83.303);
    setFeatured(false);
    
    setSelectedFacings(['East']);
    setCity(cities.length > 0 ? cities[0].name : 'Visakhapatnam');
    setMicroLocation('');
    setFloors(5);
    setUnitsCount(50);
    setSelectedPropertyTypes(['2 BHK', '3 BHK']);
    setConfigValues({ '2 BHK': '20', '3 BHK': '30' });
    setSpecImage('');
    setWidth('');
    setLength('');
    setUds('');
    
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setCategory(proj.category);
    setSubCategory(proj.subCategory || '');
    setClassification(proj.classification || '');
    setStatus(proj.status);
    setLocation(proj.location);
    setDescription(proj.description);
    setPriceRange(proj.priceRange);
    setPriceValue(proj.priceValue);
    setImageUrl(proj.images.join(', '));
    setHighlightsText(proj.highlights.join('\n'));
    setSelectedAmenities(proj.amenities || []);
    setLat(proj.mapCoordinates.lat);
    setLng(proj.mapCoordinates.lng);
    setFeatured(proj.featured);
    
    const initialFacings = proj.facing 
      ? proj.facing.split(',').map(f => f.trim()).filter(Boolean) 
      : [];
    setSelectedFacings(initialFacings);
    
    setCity(proj.city || 'Visakhapatnam');
    setMicroLocation(proj.microLocation || '');
    setFloors(proj.floors || 0);
    setUnitsCount(proj.unitsCount || 0);
    
    const parsedValues = parseAvailabilityDetails(proj.availabilityDetails || '');
    setSelectedPropertyTypes(Object.keys(parsedValues));
    setConfigValues(parsedValues);
    
    setSpecImage(proj.specImage || '');
    setWidth(proj.width || '');
    setLength(proj.length || '');
    setUds(proj.uds || '');
    
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

    // Serialize multi-select fields
    const facingString = selectedFacings.join(', ');
    const availabilityString = selectedPropertyTypes
      .map(type => {
        const val = configValues[type] !== undefined ? configValues[type] : '0';
        return `${type}: ${val}`;
      })
      .join(', ');

    const projectData: Project = {
      id: editingProject ? editingProject.id : 'p_' + Date.now(),
      name,
      category,
      subCategory: subCategory || undefined,
      status,
      location,
      description,
      images: imagesArray,
      highlights: highlightsArray,
      amenities: selectedAmenities,
      timeline: editingProject ? editingProject.timeline : [
        { id: 't_init', date: 'Jan 2026', title: 'Project Scaffolding', desc: 'Ground breaking ceremony and excavation starting.' }
      ],
      floorPlans: (() => {
        const plans = editingProject ? [...editingProject.floorPlans] : [
          { id: 'f_init', title: 'Master Layout Plan', image: specImage || '' }
        ];
        if (plans.length > 0 && plans[0].id === 'f_init') {
          plans[0] = { ...plans[0], image: specImage || '' };
        }
        return plans;
      })(),
      priceRange,
      priceValue: Number(priceValue) || 0,
      paymentPlans: editingProject ? editingProject.paymentPlans : ['Booking Advance: 10%', 'Installments: 80%', 'Handover: 10%'],
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
      width: category === 'Sites' ? width : undefined,
      length: category === 'Sites' ? length : undefined,
      uds: (category === 'Flats' || category === 'Sites') ? uds : undefined,
      classification: classification || undefined
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

  const projectColumns: ALVColumn[] = [
    { key: 'name',       label: 'Project Name', render: (_v, row) => <strong style={{color:'#1d2d3e'}}>{String(row.name)}</strong> },
    { key: 'category',  label: 'Category',     render: (_v, row) => {
      const r = row as any;
      return (
        <span>
          <span style={{fontWeight:600, color:'var(--secondary)'}}>{String(r.category)}</span>
          {r.subCategory && <span style={{fontSize:'0.72rem',color:'#888',marginLeft:'4px'}}>({String(r.subCategory)})</span>}
          {r.classification && (
            <div style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 600, marginTop: '2px' }}>{String(r.classification)}</div>
          )}
        </span>
      );
    }},
    { key: 'location',  label: 'Location' },
    { key: 'priceRange',label: 'Price Range' },
    { key: 'status',    label: 'Status', render: (_v, row) => (
      <span className={`badge badge-${String(row.status).toLowerCase()}`}>{String(row.status)}</span>
    )},
    { key: 'featured',  label: 'Featured', align: 'center', render: (_v, row) => (
      row.featured
        ? <span style={{color:'#1e7e34',display:'flex',alignItems:'center',gap:'4px',justifyContent:'center'}}><CheckCircle2 size={14}/> Yes</span>
        : <span style={{color:'#888',display:'flex',alignItems:'center',gap:'4px',justifyContent:'center'}}><XCircle size={14}/> No</span>
    )},
    { key: '__actions', label: 'Actions', sortable: false, width: '90px', align: 'center', render: (_v, row) => (
      <div className="admin-table-actions" style={{justifyContent:'center'}}>
        <button onClick={() => handleOpenEdit(row as unknown as Project)} className="alv-toolbar-btn" title="Edit"><Edit2 size={13}/></button>
        <button onClick={() => handleDelete(String(row.id), String(row.name))} className="alv-toolbar-btn" title="Delete" style={{color:'#dc2626',borderColor:'#dc2626'}}><Trash2 size={13}/></button>
      </div>
    )},
  ];

  return (
    <div className="admin-projects-view">
      <ALVGrid
        title="Manage Projects"
        subtitle={`${projects.length} property listing${projects.length !== 1 ? 's' : ''}`}
        columns={projectColumns}
        data={projects as unknown as Record<string, unknown>[]}
        rowKey="id"
        onAdd={handleOpenAdd}
        addLabel="Add Project"
        onRefresh={onRefresh}
        searchPlaceholder="Search by name, location, status..."
        emptyText="No projects found. Click + Add Project to create one."
      />

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

                <div className="grid grid-3 gap-2">
                  <div className="form-group">
                    <label className="form-label">Main Category *</label>
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
                      <option value="Sites">Sites / Plots</option>
                    </select>
                  </div>

                  {category === 'Sites' ? (
                    <div className="form-group">
                      <label className="form-label">Site Classification *</label>
                      <select 
                        className="form-control" 
                        value={subCategory}
                        onChange={e => setSubCategory(e.target.value)}
                        required
                      >
                        <option value="">Select Sub-category</option>
                        <option value="Development Sites">Development Sites</option>
                        <option value="Panchayati Approved Sites">Panchayati Approved Sites</option>
                        <option value="VUDA Approved Sites">VUDA Approved Sites</option>
                        <option value="Ventures">Ventures</option>
                      </select>
                    </div>
                  ) : (category === 'Flats' || category === 'Villas' || category === 'Individual Houses' || category === 'Duplex') ? (
                    <div className="form-group">
                      <label className="form-label">Sub-category *</label>
                      <select 
                        className="form-control" 
                        value={subCategory}
                        onChange={e => setSubCategory(e.target.value)}
                        required
                      >
                        <option value="">Select Sub-category</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Ready to Move">Ready to Move</option>
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Sub-category</label>
                      <input className="form-control" disabled value="N/A" />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Classification *</label>
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

                {/* Section 2: Location & Address */}
                <div className="modal-section-title">Location & Address</div>
                <div className="grid grid-2 gap-2">
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
                <div className="grid grid-2 gap-2">
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
                  {/* Blueprint preview */}
                  {specImage && (
                    <div style={{ marginTop: '0.5rem', display: 'inline-flex', position: 'relative' }}>
                      <img
                        src={specImage}
                        alt="Blueprint preview"
                        style={{ height: '80px', width: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setSpecImage('')}
                        title="Remove"
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          background: '#dc2626', color: '#fff', border: 'none',
                          borderRadius: '50%', width: '18px', height: '18px',
                          cursor: 'pointer', fontSize: '10px', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', lineHeight: 1
                        }}
                      >✕</button>
                    </div>
                  )}
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
                  {/* Property images preview grid */}
                  {imageUrl && imageUrl.split(',').map(u => u.trim()).filter(Boolean).length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {imageUrl.split(',').map(u => u.trim()).filter(Boolean).map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', display: 'inline-flex' }}>
                          <img
                            src={url}
                            alt={`Property image ${idx + 1}`}
                            style={{ height: '72px', width: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newUrls = imageUrl.split(',').map(u => u.trim()).filter(Boolean).filter((_, i) => i !== idx).join(', ');
                              setImageUrl(newUrls);
                            }}
                            title="Remove"
                            style={{
                              position: 'absolute', top: '-6px', right: '-6px',
                              background: '#dc2626', color: '#fff', border: 'none',
                              borderRadius: '50%', width: '18px', height: '18px',
                              cursor: 'pointer', fontSize: '10px', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', lineHeight: 1
                            }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
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
