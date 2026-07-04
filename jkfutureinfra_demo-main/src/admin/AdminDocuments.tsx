import React, { useState } from 'react';
import type { Document, Project } from '../types';
import { Trash2, Edit2, Download, Eye, FileText, X, FileMinus, Image as ImageIcon } from 'lucide-react';
import { addDocument, updateDocument, deleteDocument, uploadImage } from '../utils/db';
import { ALVGrid } from './ALVGrid';
import type { ALVColumn } from './ALVGrid';

interface AdminDocumentsProps {
  documents: Document[];
  projects: Project[];
  marketing: Project[];
  onRefresh: () => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onConfirm: (msg: string) => Promise<boolean>;
}

export const AdminDocuments: React.FC<AdminDocumentsProps> = ({
  documents,
  projects,
  marketing,
  onRefresh,
  onAddToast,
  onConfirm
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Architecture Drawing');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [projectAssociation, setProjectAssociation] = useState('');

  // Uploading state
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const categories = [
    'Architecture Drawing',
    'Legal / RERA Certificate',
    'Structural Blueprint',
    'Brochure PDF',
    'Layout Design',
    'Other Document'
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingDoc(true);
    try {
      const uploadedUrl = await uploadImage(file, 'DOCS');
      setFileUrl(uploadedUrl);
      
      // Auto detect file type
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (ext === 'pdf') {
        setFileType('pdf');
      } else if (ext === 'doc' || ext === 'docx') {
        setFileType('word');
      } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        setFileType(ext === 'png' ? 'png' : 'jpeg');
      }
      onAddToast('Document file uploaded successfully!', 'success');
    } catch (err: any) {
      onAddToast(err.message || 'File upload failed', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setTitle('');
    setCategory('Architecture Drawing');
    setFileUrl('');
    setFileType('pdf');
    setProjectAssociation('');
    setModalOpen(true);
  };

  const handleOpenEdit = (doc: Document) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setFileUrl(doc.fileUrl);
    setFileType(doc.fileType);
    setProjectAssociation(doc.projectAssociation || '');
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (await onConfirm(`Are you sure you want to delete document "${name}"?`)) {
      try {
        await deleteDocument(id);
        onAddToast(`Document "${name}" deleted.`, 'success');
        onRefresh();
      } catch (error) {
        onAddToast('Failed to delete document.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      onAddToast('Please fill out all mandatory fields', 'error');
      return;
    }

    const docData: Document = {
      id: editingDoc ? editingDoc.id : 'doc_' + Date.now(),
      title,
      category,
      fileUrl,
      fileType,
      projectAssociation: projectAssociation || undefined,
      uploadedBy: 'Staff Member',
      date: editingDoc ? editingDoc.date : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    try {
      if (editingDoc) {
        await updateDocument(docData);
        onAddToast(`Document "${title}" updated successfully.`, 'success');
      } else {
        await addDocument(docData);
        onAddToast(`Document "${title}" uploaded successfully.`, 'success');
      }
      setModalOpen(false);
      onRefresh();
    } catch (error) {
      onAddToast(editingDoc ? 'Failed to update document.' : 'Failed to save document.', 'error');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText size={18} style={{ color: '#dc2626' }} />;
      case 'word':
        return <FileMinus size={18} style={{ color: '#2563eb' }} />;
      case 'jpeg':
      case 'png':
        return <ImageIcon size={18} style={{ color: '#16a34a' }} />;
      default:
        return <FileText size={18} style={{ color: '#4b5563' }} />;
    }
  };

  const allProjects = [...projects, ...marketing];

  const columns: ALVColumn[] = [
    {
      key: 'fileType',
      label: 'Type',
      width: '60px',
      render: (_v, row) => {
        const d = row as unknown as Document;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getFileIcon(d.fileType)}
          </div>
        );
      }
    },
    {
      key: 'title',
      label: 'Document Title',
      render: (_v, row) => <span className="font-semibold">{String(row.title)}</span>
    },
    { key: 'category', label: 'Category' },
    {
      key: 'projectAssociation',
      label: 'Associated Project',
      render: (_v, row) => {
        const d = row as unknown as Document;
        if (!d.projectAssociation) return <span className="text-muted text-xs">General</span>;
        const assoc = allProjects.find(p => p.id === d.projectAssociation);
        return <span>{assoc ? assoc.name : d.projectAssociation}</span>;
      }
    },
    { key: 'date', label: 'Uploaded Date', width: '120px' },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      render: (_v, row) => {
        const d = row as unknown as Document;
        return (
          <div className="flex gap-1" style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setPreviewDoc(d)}
              className="btn btn-xs btn-outline"
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
              title="Preview"
            >
              <Eye size={12} /> Preview
            </button>
            <a
              href={d.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="btn btn-xs btn-outline"
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--secondary)', borderColor: 'var(--secondary)' }}
              title="Download"
            >
              <Download size={12} /> Down
            </a>
            <button
              onClick={() => handleOpenEdit(d)}
              className="btn btn-xs btn-outline"
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--primary)', borderColor: 'var(--primary)' }}
              title="Edit"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => handleDelete(d.id, d.title)}
              className="btn btn-xs btn-outline"
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="admin-documents-view">
      <ALVGrid
        title="Document Storage & Management"
        subtitle={`${documents.length} document listing${documents.length !== 1 ? 's' : ''}`}
        columns={columns}
        data={documents as unknown as Record<string, unknown>[]}
        rowKey="id"
        onAdd={handleOpenAdd}
        addLabel="Upload Document"
        onRefresh={onRefresh}
        searchPlaceholder="Search by document title or category..."
        emptyText="No documents stored. Click Upload Document to add plans, certificates, or brochures."
      />

      {/* Upload/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="p-3 bg-light-soft border-bottom-title" style={{ margin: 0 }}>
              {editingDoc ? 'Edit Document Info' : 'Upload Document'}
            </h3>
            <form onSubmit={handleSubmit} className="p-3">
              <div className="form-group">
                <label className="form-label">Document Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Master Ground Layout Plan..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Associated Project</label>
                  <select
                    className="form-control"
                    value={projectAssociation}
                    onChange={e => setProjectAssociation(e.target.value)}
                  >
                    <option value="">None / General</option>
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">File Type *</label>
                <select
                  className="form-control"
                  value={fileType}
                  onChange={e => setFileType(e.target.value)}
                >
                  <option value="pdf">Adobe PDF (.pdf)</option>
                  <option value="jpeg">JPEG Image (.jpg)</option>
                  <option value="png">PNG Image (.png)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Upload File *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://... or upload local file"
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    required
                    style={{ marginBottom: 0, flex: 1 }}
                  />
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {uploadingDoc ? 'Uploading...' : 'Browse'}
                    <input 
                      type="file" 
                      accept={
                        fileType === 'pdf' ? '.pdf' :
                        fileType === 'png' ? '.png' :
                        fileType === 'jpeg' ? '.jpg,.jpeg' :
                        '.pdf,.jpg,.jpeg,.png'
                      } 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                      disabled={uploadingDoc} 
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-secondary btn-sm">{editingDoc ? 'Update Details' : 'Save Document'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="flex justify-between align-center p-3 bg-light-soft border-bottom-title">
              <h3 style={{ margin: 0 }}>Document Preview: {previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-3" style={{ textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
              {previewDoc.fileType === 'pdf' ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title="PDF Preview"
                  style={{ width: '100%', height: '500px', border: 'none', borderRadius: '6px' }}
                />
              ) : (previewDoc.fileType === 'jpeg' || previewDoc.fileType === 'png') ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                />
              ) : (
                <div style={{ padding: '2rem' }}>
                  <FileText size={64} style={{ color: '#2563eb', marginBottom: '1rem' }} />
                  <h4>Microsoft Word Document (.doc/.docx)</h4>
                  <p className="text-muted mt-0.5">Word files cannot be previewed in the browser directly.</p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn btn-secondary mt-2 flex align-center justify-center gap-0.5"
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <Download size={16} /> Download File to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
