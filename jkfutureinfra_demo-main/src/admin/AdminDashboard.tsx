import React, { useMemo, useState } from 'react';
import type { Project, Enquiry, Blog } from '../types';
import { 
  Building, 
  MessageSquare, 
  ChevronRight, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  FileDown, 
  Activity, 
  ClipboardList
} from 'lucide-react';

interface AdminDashboardProps {
  projects: Project[];
  marketing: Project[];
  enquiries: Enquiry[];
  blogs: Blog[];
  onSetTab: (tab: string) => void;
  onSelectEnquiry: (enquiry: Enquiry) => void;
  role: string;
  onSetSearchQuery?: (query: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  marketing,
  enquiries,
  blogs,
  onSetTab,
  onSelectEnquiry,
  role,
  onSetSearchQuery
}) => {
  const [hoveredProjSegment, setHoveredProjSegment] = useState<string | null>(null);
  const [hoveredMktSegment, setHoveredMktSegment] = useState<string | null>(null);

  const handleCategoryClick = (category: string, targetTab: 'projects' | 'marketing') => {
    if (onSetSearchQuery) {
      onSetSearchQuery(category);
    }
    onSetTab(targetTab);
  };

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
    const completedEnquiries = visibleEnquiries.filter(e => e.status === 'Completed').length;
    const inProgressEnquiries = visibleEnquiries.filter(e => e.status === 'In Progress').length;
    const totalBlogs = blogs.length;
    
    return {
      totalProjects,
      totalEnquiries,
      pendingEnquiries,
      completedEnquiries,
      inProgressEnquiries,
      totalBlogs,
      visitors: role === 'ProjectOwner' ? 3420 : role === 'MarketingOwner' ? 5012 : 8432
    };
  }, [visibleProjects, visibleEnquiries, blogs, role]);

  // Project type breakdown
  const projectsBreakdown = useMemo(() => {
    const counts: Record<string, number> = { Flats: 0, Villas: 0, 'Individual Houses': 0, Sites: 0 };
    projects.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [projects]);

  // Marketing type breakdown
  const marketingBreakdown = useMemo(() => {
    const counts: Record<string, number> = { Flats: 0, Villas: 0, 'Individual Houses': 0, Sites: 0 };
    marketing.forEach(m => {
      if (counts[m.category] !== undefined) {
        counts[m.category]++;
      }
    });
    return counts;
  }, [marketing]);

  const recentEnquiries = useMemo(() => {
    return visibleEnquiries.slice(0, 5);
  }, [visibleEnquiries]);

  const getDonutSegments = (breakdown: Record<string, number>) => {
    const categoriesList = [
      { label: 'Flats', count: breakdown.Flats, color: '#0854a0' },
      { label: 'Villas', count: breakdown.Villas, color: '#f2b705' },
      { label: 'Individual Houses', count: breakdown['Individual Houses'], color: '#10b981' },
      { label: 'Sites', count: breakdown.Sites, color: '#ef4444' }
    ];

    const total = categoriesList.reduce((sum, item) => sum + item.count, 0);
    let accumulatedCircumference = 0;
    const r = 50;
    const circumference = 2 * Math.PI * r;

    return categoriesList.map(cat => {
      const percentage = total > 0 ? (cat.count / total) * 100 : 0;
      const strokeLength = (percentage * circumference) / 100;
      const strokeOffset = circumference - accumulatedCircumference;
      accumulatedCircumference += strokeLength;

      return {
        ...cat,
        percentage: Math.round(percentage),
        strokeDash: `${strokeLength} ${circumference}`,
        strokeOffset
      };
    });
  };

  const projectSegments = useMemo(() => getDonutSegments(projectsBreakdown), [projectsBreakdown]);
  const marketingSegments = useMemo(() => getDonutSegments(marketingBreakdown), [marketingBreakdown]);

  // Mock activity logs (representing recent operations in dashboard context)
  const recentLogs = useMemo(() => {
    const logsList = [
      { id: '1', action: 'Leads Exported', user: 'Admin', details: 'Exported project leads to CSV', time: '10 mins ago', status: 'Success' },
      { id: '2', action: 'Master Updated', user: 'System', details: 'Synced city and microlocations configs', time: '1 hr ago', status: 'Success' },
      { id: '3', action: 'Login Approved', user: 'ProjectOwner', details: 'Session initialized for project dashboard', time: '2 hrs ago', status: 'Success' },
    ];
    return logsList;
  }, []);

  // Quick action triggers
  const handleExportAllLeads = () => {
    const headers = ['Lead ID', 'Customer Name', 'Phone', 'Email', 'Assigned Property', 'Status', 'Date'];
    const rows = visibleEnquiries.map(e => [
      e.id,
      e.name,
      e.phone,
      e.email,
      e.projectName || e.projectAssociation,
      e.status,
      e.date
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sap_leads_extract_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-dashboard-view">
      {/* Shell Header */}
      <div className="flex justify-between align-center mb-4" style={{ borderBottom: '1px solid var(--sap-border-color)', paddingBottom: '1rem' }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--sap-fiori-blue)', margin: 0 }}>Fiori Launchpad Overview</h2>
          <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0' }}>Real-time business intelligence, property metrics, and analytics</p>
        </div>
        <div className="role-scope-badge">
          <span className="pulse-indicator"></span>
          <span>Scope: <strong>{role === 'Admin' ? 'Super Admin (All)' : role === 'ProjectOwner' ? 'Project Owner' : 'Marketing Owner'}</strong></span>
        </div>
      </div>

      {/* SAP Fiori Interactive Launchpad Tiles */}
      <div className="sap-tile-grid">
        <div 
          className="sap-tile tile-blue" 
          onClick={() => onSetTab(role === 'MarketingOwner' ? 'marketing' : 'projects')}
        >
          <div className="sap-tile-header">
            <span className="sap-tile-title">Assigned Listings</span>
            <Building size={16} className="sap-tile-icon" />
          </div>
          <div className="sap-tile-content">
            <span className="sap-tile-kpi">{stats.totalProjects}</span>
            <span className="sap-tile-trend up">
              +12% <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="sap-tile-footer">Manage properties list</div>
        </div>

        <div 
          className="sap-tile tile-gold"
          onClick={() => onSetTab(role === 'MarketingOwner' ? 'marketing_enquiries' : 'project_enquiries')}
        >
          <div className="sap-tile-header">
            <span className="sap-tile-title">Total Leads Intake</span>
            <MessageSquare size={16} className="sap-tile-icon" />
          </div>
          <div className="sap-tile-content">
            <span className="sap-tile-kpi">{stats.totalEnquiries}</span>
            <span className="sap-tile-trend up">
              +8% <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="sap-tile-footer">All received inquiries</div>
        </div>

        <div 
          className="sap-tile tile-red"
          onClick={() => onSetTab(role === 'MarketingOwner' ? 'marketing_enquiries' : 'project_enquiries')}
        >
          <div className="sap-tile-header">
            <span className="sap-tile-title">Pending Action Leads</span>
            <Clock size={16} className="sap-tile-icon" />
          </div>
          <div className="sap-tile-content">
            <span className="sap-tile-kpi">{stats.pendingEnquiries}</span>
            <span className="sap-tile-trend down" style={{ color: stats.pendingEnquiries > 0 ? '#ef4444' : '#10b981' }}>
              {stats.pendingEnquiries > 0 ? 'Requires attention' : 'All clear'} 
            </span>
          </div>
          <div className="sap-tile-footer">Status: New Leads</div>
        </div>


      </div>

      {/* Mid row: Charts and Quick Actions */}
      <div className="dashboard-section-grid mb-4">
        
        {/* Main Charts & Analytics container */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--sap-card-bg)' }}>
          <h3 className="text-md font-bold mb-2 pb-2" style={{ borderBottom: '1px solid var(--sap-border-color)', color: '#2b303b', margin: 0 }}>
            System Business Intelligence
          </h3>

          <div style={{ 
            display: role === 'Admin' ? 'grid' : 'flex', 
            gridTemplateColumns: role === 'Admin' ? '1fr 1fr' : 'none', 
            justifyContent: 'center', 
            gap: '2.5rem', 
            padding: '0.5rem 0' 
          }}>
            {/* 1. Projects Donut Chart */}
            {(role === 'Admin' || role === 'ProjectOwner') && (
              <div className="sap-chart-container" style={{ alignItems: 'center' }}>
                <span className="text-xs font-bold text-muted mb-2 text-center" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Projects Portfolio Mix
                </span>
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                  <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                    {projects.length === 0 ? (
                      <circle cx="70" cy="70" r="50" fill="transparent" stroke="#cbd5e1" strokeWidth="15" />
                    ) : (
                      projectSegments.map((segment, index) => (
                        <circle
                          key={index}
                          cx="70"
                          cy="70"
                          r="50"
                          fill="transparent"
                          stroke={segment.color}
                          strokeWidth="15"
                          strokeDasharray={segment.strokeDash}
                          strokeDashoffset={segment.strokeOffset}
                          className="sap-donut-segment"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleCategoryClick(segment.label, 'projects')}
                          onMouseEnter={() => setHoveredProjSegment(`${segment.label}: ${segment.count} (${segment.percentage}%)`)}
                          onMouseLeave={() => setHoveredProjSegment(null)}
                        />
                      ))
                    )}
                  </svg>
                  {/* Donut Center Label */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'inherit'
                  }}>
                    <div className="text-xl font-bold" style={{ color: '#2b303b', lineHeight: 1 }}>{projects.length}</div>
                    <div className="text-xxs text-muted" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>Projects</div>
                  </div>
                </div>
                
                {/* Tooltip description */}
                <div style={{ height: '18px', marginTop: '0.5rem' }}>
                  <span className="text-xs font-semibold text-secondary" style={{ color: 'var(--sap-fiori-blue)' }}>
                    {hoveredProjSegment || 'Hover slices for details'}
                  </span>
                </div>

                {/* Legends list */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {projectSegments.map((seg, i) => (
                    <div 
                      key={i} 
                      className="flex align-center gap-0.25 text-xxs" 
                      style={{ fontSize: '0.7rem', cursor: 'pointer' }}
                      onClick={() => handleCategoryClick(seg.label, 'projects')}
                    >
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: seg.color, borderRadius: '2px' }}></span>
                      <span style={{ fontWeight: hoveredProjSegment?.startsWith(seg.label) ? 'bold' : 'normal' }}>
                        {seg.label} ({seg.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Marketing Donut Chart */}
            {(role === 'Admin' || role === 'MarketingOwner') && (
              <div className="sap-chart-container" style={{ alignItems: 'center' }}>
                <span className="text-xs font-bold text-muted mb-2 text-center" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Marketing Portfolio Mix
                </span>
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                  <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                    {marketing.length === 0 ? (
                      <circle cx="70" cy="70" r="50" fill="transparent" stroke="#cbd5e1" strokeWidth="15" />
                    ) : (
                      marketingSegments.map((segment, index) => (
                        <circle
                          key={index}
                          cx="70"
                          cy="70"
                          r="50"
                          fill="transparent"
                          stroke={segment.color}
                          strokeWidth="15"
                          strokeDasharray={segment.strokeDash}
                          strokeDashoffset={segment.strokeOffset}
                          className="sap-donut-segment"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleCategoryClick(segment.label, 'marketing')}
                          onMouseEnter={() => setHoveredMktSegment(`${segment.label}: ${segment.count} (${segment.percentage}%)`)}
                          onMouseLeave={() => setHoveredMktSegment(null)}
                        />
                      ))
                    )}
                  </svg>
                  {/* Donut Center Label */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'inherit'
                  }}>
                    <div className="text-xl font-bold" style={{ color: '#2b303b', lineHeight: 1 }}>{marketing.length}</div>
                    <div className="text-xxs text-muted" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>Marketing</div>
                  </div>
                </div>
                
                {/* Tooltip description */}
                <div style={{ height: '18px', marginTop: '0.5rem' }}>
                  <span className="text-xs font-semibold text-secondary" style={{ color: 'var(--sap-fiori-blue)' }}>
                    {hoveredMktSegment || 'Hover slices for details'}
                  </span>
                </div>

                {/* Legends list */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {marketingSegments.map((seg, i) => (
                    <div 
                      key={i} 
                      className="flex align-center gap-0.25 text-xxs" 
                      style={{ fontSize: '0.7rem', cursor: 'pointer' }}
                      onClick={() => handleCategoryClick(seg.label, 'marketing')}
                    >
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: seg.color, borderRadius: '2px' }}></span>
                      <span style={{ fontWeight: hoveredMktSegment?.startsWith(seg.label) ? 'bold' : 'normal' }}>
                        {seg.label} ({seg.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="admin-card flex flex-col justify-between" style={{ backgroundColor: 'var(--sap-card-bg)' }}>
          <div>
            <h3 className="text-md font-bold mb-2 pb-2" style={{ borderBottom: '1px solid var(--sap-border-color)', color: '#2b303b', margin: 0 }}>
              Quick Tasks
            </h3>
            <div className="flex flex-col gap-1 mt-2">
              <button 
                onClick={() => onSetTab(role === 'MarketingOwner' ? 'marketing' : 'projects')}
                className="btn btn-sm btn-outline flex align-center gap-0.5" 
                style={{ width: '100%', padding: '0.5rem', justifyContent: 'flex-start', fontSize: '0.8rem', borderColor: 'var(--sap-border-color)', color: 'var(--sap-fiori-blue)', background: 'transparent', cursor: 'pointer' }}
              >
                <Plus size={14} /> Add New Listing
              </button>
              <button 
                onClick={handleExportAllLeads}
                className="btn btn-sm btn-outline flex align-center gap-0.5" 
                style={{ width: '100%', padding: '0.5rem', justifyContent: 'flex-start', fontSize: '0.8rem', borderColor: 'var(--sap-border-color)', color: 'var(--sap-fiori-blue)', background: 'transparent', cursor: 'pointer' }}
              >
                <FileDown size={14} /> Extract Leads to CSV
              </button>
              <button 
                onClick={() => onSetTab('audit_logs')}
                className="btn btn-sm btn-outline flex align-center gap-0.5" 
                style={{ width: '100%', padding: '0.5rem', justifyContent: 'flex-start', fontSize: '0.8rem', borderColor: 'var(--sap-border-color)', color: 'var(--sap-fiori-blue)', background: 'transparent', cursor: 'pointer' }}
              >
                <ClipboardList size={14} /> View Audit Trails
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '1rem' }}>
            <span className="text-xxs text-muted uppercase font-bold" style={{ fontSize: '0.65rem' }}>System Performance</span>
            <div className="flex justify-between align-center text-xs mt-1">
              <span className="flex align-center gap-0.25 text-success"><Activity size={12} /> Database: Online</span>
              <span className="text-muted">Latency: 45ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent leads table + Recent activities */}
      <div className="dashboard-section-grid">
        
        {/* Recent leads table */}
        <div className="recent-leads-column admin-card" style={{ backgroundColor: 'var(--sap-card-bg)' }}>
          <div className="flex justify-between align-center mb-2" style={{ borderBottom: '1px solid var(--sap-border-color)', paddingBottom: '0.75rem' }}>
            <h3 className="text-md font-bold" style={{ margin: 0, color: '#2b303b' }}>Recent Leads</h3>
            <button 
              onClick={() => onSetTab(role === 'MarketingOwner' ? 'marketing_enquiries' : 'project_enquiries')} 
              className="text-sm font-semibold text-secondary flex align-center gap-0.5"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--sap-fiori-blue)' }}
            >
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
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--sap-fiori-blue)',
                            border: '1.5px solid var(--sap-fiori-blue)',
                            fontWeight: '600',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
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

        {/* System Operations Logs (Summary view) */}
        <div className="admin-card" style={{ backgroundColor: 'var(--sap-card-bg)' }}>
          <h3 className="text-md font-bold mb-2 pb-2" style={{ borderBottom: '1px solid var(--sap-border-color)', color: '#2b303b', margin: 0 }}>
            Recent Actions
          </h3>
          <div className="flex flex-col gap-1.5 mt-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex gap-0.5 align-start text-xs pb-1" style={{ borderBottom: '1px solid #f8fafc' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981', 
                  marginTop: '4px' 
                }} />
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-dark">{log.action}</span>
                    <span className="text-xxs text-muted">{log.time}</span>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>{log.details}</span>
                  <span className="text-xxs" style={{ color: '#0854a0', fontSize: '0.65rem' }}>Operator: {log.user}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <button 
              onClick={() => onSetTab('audit_logs')} 
              className="text-xs font-semibold text-secondary"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--sap-fiori-blue)' }}
            >
              See All Audit Trails
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
