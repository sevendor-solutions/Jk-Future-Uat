import React, { useState } from 'react';
import type { City, LocationMaster } from '../types';
import { Plus, Trash2, MapPin, Building } from 'lucide-react';
import { addCity, deleteCity, addLocation, deleteLocation } from '../utils/db';

interface AdminMastersProps {
  cities: City[];
  locations: LocationMaster[];
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminMasters: React.FC<AdminMastersProps> = ({
  cities,
  locations,
  onRefresh,
  onAddToast,
  onConfirm
}) => {
  // Tabs: 'cities' | 'locations'
  const [activeSubTab, setActiveSubTab] = useState<'cities' | 'locations'>('cities');

  // Modal forms states
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [cityName, setCityName] = useState('');

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [parentCityId, setParentCityId] = useState('');

  // Handlers for Cities
  const handleOpenAddCity = () => {
    setCityName('');
    setCityModalOpen(true);
  };

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) {
      onAddToast('Please fill out the City Name', 'error');
      return;
    }

    const cleanName = cityName.trim();
    // Avoid exact duplicate
    const duplicate = cities.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
    if (duplicate) {
      onAddToast(`City "${cleanName}" already exists in the master database.`, 'error');
      return;
    }

    let nextNum = 1;
    cities.forEach(c => {
      const match = c.id.match(/^c(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 100000 && num >= nextNum) {
          nextNum = num + 1;
        }
      }
    });

    const newCity: City = {
      id: `c${nextNum}`,
      name: cleanName
    };

    try {
      await addCity(newCity);
      onAddToast(`City "${cleanName}" added successfully to masters.`, 'success');
      setCityModalOpen(false);
      onRefresh();
    } catch (error) {
      onAddToast('Failed to add city.', 'error');
    }
  };

  const handleCityDelete = async (id: string, name: string) => {
    const counts = locations.filter(l => l.cityId === id).length;
    let confirmMsg = `Are you sure you want to remove "${name}" from Cities master?`;
    if (counts > 0) {
      confirmMsg += ` WARNING: This will also delete all ${counts} locations mapped under this city!`;
    }
    if (await onConfirm(confirmMsg)) {
      try {
        await deleteCity(id);
        onAddToast(`City "${name}" and its mapped locations have been removed.`, 'success');
        onRefresh();
      } catch (error) {
        onAddToast('Failed to delete city.', 'error');
      }
    }
  };

  // Handlers for Locations
  const handleOpenAddLocation = () => {
    if (cities.length === 0) {
      onAddToast('Please register at least one City first.', 'error');
      return;
    }
    setLocationName('');
    setParentCityId(cities[0].id);
    setLocationModalOpen(true);
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !parentCityId) {
      onAddToast('Please fill out all mandatory fields.', 'error');
      return;
    }

    const cleanName = locationName.trim();
    const city = cities.find(c => c.id === parentCityId);
    
    // Check duplicate under same city
    const duplicate = locations.find(
      l => l.name.toLowerCase() === cleanName.toLowerCase() && l.cityId === parentCityId
    );
    if (duplicate) {
      onAddToast(`Location "${cleanName}" already exists under "${city?.name}".`, 'error');
      return;
    }

    let nextNum = 1;
    locations.forEach(l => {
      const match = l.id.match(/^loc(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 100000 && num >= nextNum) {
          nextNum = num + 1;
        }
      }
    });

    const newLoc: LocationMaster = {
      id: `loc${nextNum}`,
      name: cleanName,
      cityId: parentCityId
    };

    try {
      await addLocation(newLoc);
      onAddToast(`Location "${cleanName}" created under city "${city?.name}".`, 'success');
      setLocationModalOpen(false);
      onRefresh();
    } catch (error) {
      onAddToast('Failed to add location.', 'error');
    }
  };

  const handleLocationDelete = async (id: string, name: string) => {
    if (await onConfirm(`Are you sure you want to delete "${name}" from Locations master?`)) {
      try {
        await deleteLocation(id);
        onAddToast(`Location "${name}" removed.`, 'success');
        onRefresh();
      } catch (error) {
        onAddToast('Failed to delete location.', 'error');
      }
    }
  };

  return (
    <div className="admin-masters-view">
      <div className="flex justify-between align-center mb-3">
        <div>
          <h2>Masters Configuration</h2>
          <p className="text-xs text-muted">Manage system-wide dropdown variables for Cities and Micro-locations</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-light-soft p-0.5" style={{ borderRadius: '8px', padding: '0.25rem' }}>
          <button 
            className={`toggle-btn ${activeSubTab === 'cities' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('cities')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <Building size={14} /> Cities List ({cities.length})
          </button>
          <button 
            className={`toggle-btn ${activeSubTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('locations')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <MapPin size={14} /> Locations List ({locations.length})
          </button>
        </div>
      </div>

      {/* CITIES TAB */}
      {activeSubTab === 'cities' && (
        <div className="admin-card p-3 shadow-sm">
          <div className="flex justify-between align-center mb-2">
            <h3 className="text-primary font-bold my-0">Registered Cities</h3>
            <button onClick={handleOpenAddCity} className="btn btn-secondary btn-sm flex align-center gap-0.5">
              <Plus size={16} /> Add City
            </button>
          </div>

          <div className="admin-table-wrapper" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
            <table className="admin-table text-sm">
              <thead>
                <tr>
                  <th>City ID</th>
                  <th>City Name</th>
                  <th>Mapped Locations</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map(c => {
                  const mappedCount = locations.filter(l => l.cityId === c.id).length;
                  return (
                    <tr key={c.id}>
                      <td className="font-mono text-xs">{c.id}</td>
                      <td className="font-semibold text-primary">{c.name}</td>
                      <td>
                        <span className="badge badge-completed">{mappedCount} Locations</span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleCityDelete(c.id, c.name)}
                          className="btn btn-sm btn-outline btn-icon-only"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          title="Delete City"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {cities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">No cities registered. Click "Add City" to start.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOCATIONS TAB */}
      {activeSubTab === 'locations' && (
        <div className="admin-card p-3 shadow-sm">
          <div className="flex justify-between align-center mb-2">
            <h3 className="text-primary font-bold my-0">Micro Locations (Under Cities)</h3>
            <button onClick={handleOpenAddLocation} className="btn btn-secondary btn-sm flex align-center gap-0.5">
              <Plus size={16} /> Create Location
            </button>
          </div>

          <div className="admin-table-wrapper" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
            <table className="admin-table text-sm">
              <thead>
                <tr>
                  <th>Location ID</th>
                  <th>Location Area</th>
                  <th>Parent City</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(l => {
                  const parentCity = cities.find(c => c.id === l.cityId);
                  return (
                    <tr key={l.id}>
                      <td className="font-mono text-xs">{l.id}</td>
                      <td className="font-semibold text-primary">{l.name}</td>
                      <td>
                        <span className="badge badge-ongoing" style={{ textTransform: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building size={12} /> {parentCity ? parentCity.name : 'Unknown City'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleLocationDelete(l.id, l.name)}
                          className="btn btn-sm btn-outline btn-icon-only"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          title="Delete Location"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {locations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">No locations registered. Click "Create Location" to start.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {cityModalOpen && (
        <div className="modal-overlay" onClick={() => setCityModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 className="p-3 bg-light-soft border-bottom-title" style={{ margin: 0 }}>Register City Master</h3>
            <form onSubmit={handleCitySubmit} className="p-3">
              <div className="form-group">
                <label className="form-label">City Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Visakhapatnam" 
                  value={cityName}
                  onChange={e => setCityName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setCityModalOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-secondary btn-sm">Create City</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {locationModalOpen && (
        <div className="modal-overlay" onClick={() => setLocationModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3 className="p-3 bg-light-soft border-bottom-title" style={{ margin: 0 }}>Create Micro Location</h3>
            <form onSubmit={handleLocationSubmit} className="p-3">
              <div className="form-group">
                <label className="form-label">Parent City *</label>
                <select 
                  className="form-control" 
                  value={parentCityId}
                  onChange={e => setParentCityId(e.target.value)}
                  required
                >
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location Area Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Madhurawada" 
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setLocationModalOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-secondary btn-sm">Create Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
