import React, { useState, useMemo } from 'react';
import type { Enquiry, EnquiryStatus } from '../types';
import { Edit, Trash2, Phone, Mail } from 'lucide-react';
import { updateEnquiryStatus, deleteEnquiry } from '../utils/db';

interface AdminEnquiriesProps {
  enquiries: Enquiry[];
  type?: 'projects' | 'marketing';
  selectedEnquiry: Enquiry | null;
  onClearSelected: () => void;
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminEnquiries: React.FC<AdminEnquiriesProps> = ({
  enquiries,
  type,
  selectedEnquiry,
  onClearSelected,
  onRefresh,
  onAddToast,
  onConfirm
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  
  // Review modal states
  const [reviewingEnq, setReviewingEnq] = useState<Enquiry | null>(selectedEnquiry);
  const [status, setStatus] = useState<EnquiryStatus>('New');
  const [notes, setNotes] = useState('');

  // Handle prop changes for direct dashboard click reviews
  React.useEffect(() => {
    if (selectedEnquiry) {
      handleOpenReview(selectedEnquiry);
      onClearSelected();
    }
  }, [selectedEnquiry]);

  const handleOpenReview = (enq: Enquiry) => {
    setReviewingEnq(enq);
    setStatus(enq.status);
    setNotes(enq.notes || '');
  };

  const handleDelete = async (id: string, name: string) => {
    if (await onConfirm(`Are you sure you want to delete lead from "${name}"?`)) {
      try {
        await deleteEnquiry(id);
        onAddToast(`Lead from "${name}" deleted.`, 'success');
        if (reviewingEnq?.id === id) setReviewingEnq(null);
        onRefresh();
      } catch (error) {
        onAddToast('Failed to delete enquiry.', 'error');
      }
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingEnq) return;

    try {
      await updateEnquiryStatus(reviewingEnq.id, status, notes);
      onAddToast(`Lead status updated to: ${status}`, 'success');
      setReviewingEnq(null);
      onRefresh();
    } catch (error) {
      onAddToast('Failed to update status.', 'error');
    }
  };

  // Filter leads based on the tab type prop (marketing starts with 'm', otherwise projects/general)
  const filteredByTypeEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      const isMarketing = e.projectAssociation?.startsWith('m');
      if (type === 'marketing') return isMarketing;
      if (type === 'projects') return !isMarketing;
      return true;
    });
  }, [enquiries, type]);

  const filteredEnquiries = useMemo(() => {
    return filteredByTypeEnquiries.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                            e.email.toLowerCase().includes(search.toLowerCase()) ||
                            e.phone.includes(search) || 
                            (e.projectName && e.projectName.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = filter === 'All' || e.status === filter;
      return matchesSearch && matchesStatus;
    });
  }, [filteredByTypeEnquiries, search, filter]);

  return (
    <div className="admin-enquiries-view">
      <div className="flex justify-between align-center mb-3">
        <h2>{type === 'marketing' ? 'Marketing Leads' : 'Project Leads'}</h2>
        <span className="badge badge-ongoing">{filteredByTypeEnquiries.filter(e => e.status === 'New').length} Pending Leads</span>
      </div>

      {/* Tabs & Search */}
      <div className="glass-card py-2 px-2 flex justify-between align-center flex-wrap gap-2 mb-3">
        <div className="gallery-tabs flex gap-1 flex-wrap mb-0">
          {['All', 'New', 'In Progress', 'Completed'].map((tab, i) => (
            <button 
              key={i}
              className={`gallery-tab-btn ${filter === tab ? 'active' : ''}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setFilter(tab)}
            >
              {tab} ({tab === 'All' ? filteredByTypeEnquiries.length : filteredByTypeEnquiries.filter(e => e.status === tab).length})
            </button>
          ))}
        </div>

        <input 
          type="text" 
          placeholder="Search customer, project..." 
          className="form-control"
          style={{ width: '260px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', marginBottom: 0 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Leads Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Property Association</th>
              <th>Message Preview</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.map(enq => (
              <tr key={enq.id}>
                <td>
                  <div className="font-semibold">{enq.name}</div>
                  <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}><Phone size={11} className="text-secondary" /> {enq.phone}</div>
                  <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}><Mail size={11} className="text-secondary" /> {enq.email}</div>
                </td>
                <td>
                  <span className="font-semibold text-secondary">{enq.projectName}</span>
                  <div className="text-xs text-muted">({enq.projectAssociation})</div>
                </td>
                <td style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {enq.message}
                </td>
                <td>
                  <span className={`badge badge-${enq.status.toLowerCase().replace(' ', '')}`}>{enq.status}</span>
                </td>
                <td>{new Date(enq.date).toLocaleString()}</td>
                <td>
                  <div className="admin-table-actions">
                    <button 
                      onClick={() => handleOpenReview(enq)}
                      className="btn btn-sm btn-outline btn-icon-only"
                      title="Review Lead"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(enq.id, enq.name)}
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

      {/* Review Modal Form */}
      {reviewingEnq && (
        <div className="modal-overlay" onClick={() => setReviewingEnq(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3 className="p-3 bg-light-soft border-bottom-title" style={{ margin: 0 }}>Review Customer Enquiry</h3>
            
            <form onSubmit={handleSaveReview} className="p-3">
              <div className="bg-light-soft p-2 mb-2" style={{ borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="grid grid-2 gap-2 text-sm">
                  <div>
                    <span className="font-bold">Customer:</span> {reviewingEnq.name}
                  </div>
                  <div>
                    <span className="font-bold">Phone:</span> {reviewingEnq.phone}
                  </div>
                  <div>
                    <span className="font-bold">Email:</span> {reviewingEnq.email}
                  </div>
                  <div>
                    <span className="font-bold">Property:</span> {reviewingEnq.projectName}
                  </div>
                </div>
                <div className="mt-1 text-sm pt-1" style={{ borderTop: '1px dashed var(--border-color)' }}>
                  <span className="font-bold">Message Details:</span>
                  <p className="text-muted text-sm mt-0.5" style={{ whiteSpace: 'pre-wrap' }}>{reviewingEnq.message}</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Update Status *</label>
                <select 
                  className="form-control" 
                  value={status}
                  onChange={e => setStatus(e.target.value as EnquiryStatus)}
                >
                  <option value="New">New Lead</option>
                  <option value="In Progress">In Progress (Following up)</option>
                  <option value="Completed">Completed (Deal closed/Disposed)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Follow-up Staff Notes</label>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  placeholder="Type updates (e.g. Called client, scheduled site visit on Sunday...)" 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setReviewingEnq(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-secondary btn-sm">Save Enquiry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
