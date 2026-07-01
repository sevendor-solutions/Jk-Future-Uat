import React, { useMemo } from 'react';
import type { Project, Enquiry, Blog } from '../types';
import { Building, MessageSquare, Eye, ChevronRight, Clock } from 'lucide-react';

interface AdminDashboardProps {
  projects: Project[];
  marketing: Project[];
  enquiries: Enquiry[];
  blogs: Blog[];
  onSetTab: (tab: string) => void;
  onSelectEnquiry: (enquiry: Enquiry) => void;
  role: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  marketing,
  enquiries,
  blogs,
  onSetTab,
  onSelectEnquiry,
  role
}) => {
  
  // Filter visible projects based on user role
  const visibleProjects = useMemo(() => {
    if (role === 'ProjectOwner') return projects;
    if (role === 'MarketingOwner') return marketing;
    return [...projects, ...marketing];
  }, [projects, marketing, role]);

  // Filter visible enquiries/leads based on user role
  const visibleEnquiries = useMemo(() => {
    if (role === 'ProjectOwner') {
      return enquiries.filter(e => e.projectAssociation === 'General' || projects.some(p => p.id === e.projectAssociation));
    }
    if (role === 'MarketingOwner') {
      return enquiries.filter(e => e.projectAssociation === 'General' || marketing.some(m => m.id === e.projectAssociation));
    }
    return enquiries;
  }, [enquiries, projects, marketing, role]);

  const stats = useMemo(() => {
    const totalProjects = visibleProjects.length;
    const totalEnquiries = visibleEnquiries.length;
    const pendingEnquiries = visibleEnquiries.filter(e => e.status === 'New').length;
    const totalBlogs = blogs.length;
    
    return {
      totalProjects,
      totalEnquiries,
      pendingEnquiries,
      totalBlogs,
      visitors: role === 'ProjectOwner' ? 3420 : role === 'MarketingOwner' ? 5012 : 8432 // Segmented traffic stats
    };
  }, [visibleProjects, visibleEnquiries, blogs, role]);

  // Project type breakdown
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = { Flats: 0, Villas: 0, 'Individual Houses': 0, Sites: 0 };
    visibleProjects.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [visibleProjects]);

  const recentEnquiries = useMemo(() => {
    return visibleEnquiries.slice(0, 5);
  }, [visibleEnquiries]);

  return (
    <div className="admin-dashboard-view">
      {/* Simple Header */}
      <div className="flex justify-between align-center mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--primary)', margin: 0 }}>Dashboard Overview</h2>
          <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0' }}>Monitor leads, track property status, and view site analytics</p>
        </div>
        <div className="role-scope-badge">
          <span className="pulse-indicator"></span>
          <span>Scope: <strong>{role === 'Admin' ? 'Super Admin (All)' : role === 'ProjectOwner' ? 'Project Owner' : 'Marketing Owner'}</strong></span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-4 gap-2 mb-4">
        <div className="admin-stat-card">
          <div>
            <span className="text-muted text-xs font-semibold uppercase">Assigned Listings</span>
            <h3 className="text-2xl font-bold mt-0.5" style={{ color: 'var(--primary)' }}>{stats.totalProjects}</h3>
          </div>
          <div className="stat-icon-box" style={{ color: 'var(--primary)' }}><Building size={22} /></div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span className="text-muted text-xs font-semibold uppercase">Total Leads</span>
            <h3 className="text-2xl font-bold mt-0.5" style={{ color: 'var(--secondary)' }}>{stats.totalEnquiries}</h3>
          </div>
          <div className="stat-icon-box" style={{ color: 'var(--secondary)' }}><MessageSquare size={22} /></div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span className="text-muted text-xs font-semibold uppercase">Pending Leads</span>
            <h3 className="text-2xl font-bold mt-0.5" style={{ color: '#f59e0b' }}>{stats.pendingEnquiries}</h3>
          </div>
          <div className="stat-icon-box" style={{ color: '#f59e0b' }}><Clock size={22} /></div>
        </div>

        <div className="admin-stat-card">
          <div>
            <span className="text-muted text-xs font-semibold uppercase">Reach</span>
            <h3 className="text-2xl font-bold mt-0.5" style={{ color: 'var(--info)' }}>{stats.visitors}</h3>
          </div>
          <div className="stat-icon-box" style={{ color: 'var(--info)' }}><Eye size={22} /></div>
        </div>
      </div>

      {/* Mid row: Recent leads + Category distribution */}
      <div className="grid grid-3 gap-3">
        {/* Recent leads table (Column width 2) */}
        <div className="recent-leads-column admin-card" style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between align-center mb-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 className="text-lg">Recent Scope Leads</h3>
            <button onClick={() => onSetTab('enquiries')} className="text-sm font-semibold text-secondary flex align-center gap-0.5">
              View All Leads <ChevronRight size={14} />
            </button>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No leads matching your ownership scope yet.</p>
          ) : (
            <div className="admin-table-wrapper" style={{ margin: 0, border: 'none' }}>
              <table className="admin-table text-sm">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Property Info</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.map(enq => (
                    <tr key={enq.id}>
                      <td>
                        <div className="font-semibold">{enq.name}</div>
                        <div className="text-xs text-muted">{enq.phone}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{enq.projectName}</div>
                        <div className="text-xs text-muted">{new Date(enq.date).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${enq.status.toLowerCase().replace(' ', '')}`}>
                          {enq.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => onSelectEnquiry(enq)}
                          className="btn-review"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Portfolio mix (Column width 1) */}
        <div className="portfolio-mix-column admin-card">
          <h3 className="text-lg mb-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Portfolio Mix</h3>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { label: 'Flats / Apartments', count: categoryBreakdown.Flats, color: 'var(--primary)' },
              { label: 'Gated Villas', count: categoryBreakdown.Villas, color: 'var(--secondary)' },
              { label: 'Individual Houses', count: categoryBreakdown['Individual Houses'], color: 'var(--success)' },
              { label: 'Venture Plots / Sites', count: categoryBreakdown.Sites, color: 'var(--info)' }
            ].map((mix, i) => (
              <div key={i} className="portfolio-mix-bar flex flex-col gap-0.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{mix.label}</span>
                  <span className="font-bold">{mix.count}</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      backgroundColor: mix.color, 
                      width: `${visibleProjects.length > 0 ? (mix.count / visibleProjects.length) * 100 : 0}%` 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
