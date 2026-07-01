import React, { useState } from 'react';
import type { JobApplication } from '../types';
import { Eye, Trash2, Phone, Mail } from 'lucide-react';
import { updateApplicationStatus, deleteApplication } from '../utils/db';

interface AdminCareersProps {
  applications: JobApplication[];
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminCareers: React.FC<AdminCareersProps> = ({
  applications,
  onRefresh,
  onAddToast,
  onConfirm
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (await onConfirm(`Are you sure you want to delete the application from ${name}?`)) {
      try {
        await deleteApplication(id);
        onAddToast(`Application from ${name} deleted successfully.`, 'info');
        onRefresh();
      } catch (error) {
        onAddToast('Failed to delete application.', 'error');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: JobApplication['status']) => {
    try {
      await updateApplicationStatus(id, newStatus);
      onAddToast(`Status updated to ${newStatus}.`, 'success');
      onRefresh();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      onAddToast('Failed to update status.', 'error');
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.position.toLowerCase().includes(search.toLowerCase()) || 
                          app.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-careers-view">
      <div className="flex justify-between align-center mb-3">
        <h2>Job Applications</h2>
        <span className="badge badge-ongoing">{applications.length} Submissions</span>
      </div>

      {/* Filter and Search controls */}
      <div className="admin-table-filters flex justify-between gap-2 mb-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search candidates, positions..." 
          style={{ maxWidth: '300px', marginBottom: 0 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <select 
          className="form-control" 
          style={{ maxWidth: '200px', marginBottom: 0 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table text-sm">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Target Position</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">No applications found matching your criteria.</td>
              </tr>
            ) : (
              filteredApps.map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="font-semibold">{app.name}</div>
                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}><Phone size={11} className="text-secondary" /> {app.phone}</div>
                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}><Mail size={11} className="text-secondary" /> {app.email}</div>
                  </td>
                  <td>
                    <span className="font-semibold text-primary">{app.position}</span>
                  </td>
                  <td>{app.experience}</td>
                  <td>
                    <span className={`badge badge-${app.status.toLowerCase().replace(' ', '')}`}>{app.status}</span>
                  </td>
                  <td>{new Date(app.date).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="btn btn-sm btn-outline btn-icon-only"
                        title="Review Cover Letter"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(app.id, app.name)}
                        className="btn btn-sm btn-outline btn-icon-only"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        title="Delete Application"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Application Detail Review Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3 className="p-3 bg-light-soft border-bottom-title" style={{ margin: 0 }}>Review Application</h3>
            
            <div className="p-3">
              <div className="bg-light-soft p-2 mb-2" style={{ borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="grid grid-2 gap-2 text-sm">
                  <div><span className="font-bold">Candidate:</span> {selectedApp.name}</div>
                  <div><span className="font-bold">Phone:</span> {selectedApp.phone}</div>
                  <div><span className="font-bold">Email:</span> {selectedApp.email}</div>
                  <div><span className="font-bold">Experience:</span> {selectedApp.experience}</div>
                  <div><span className="font-bold">Target Position:</span> <b className="text-primary">{selectedApp.position}</b></div>
                  <div><span className="font-bold">Applied:</span> {new Date(selectedApp.date).toLocaleString()}</div>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="mb-0.5">Experience & Cover Letter:</h4>
                <div className="p-2 bg-light-soft text-sm" style={{ border: '1px solid var(--border-color)', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {selectedApp.coverLetter}
                </div>
              </div>

              <div className="form-group mb-2">
                <label className="form-label font-bold">Update Recruitment Status</label>
                <div className="flex gap-1">
                  {(['Pending', 'Interview Scheduled', 'Shortlisted', 'Rejected'] as JobApplication['status'][]).map(st => (
                    <button 
                      key={st}
                      type="button"
                      className={`btn btn-sm ${selectedApp.status === st ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                      onClick={() => handleStatusChange(selectedApp.id, st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-top-title">
                <button onClick={() => setSelectedApp(null)} className="btn btn-secondary btn-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
