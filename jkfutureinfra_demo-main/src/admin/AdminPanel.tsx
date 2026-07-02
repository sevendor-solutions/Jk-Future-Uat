import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, Project, Enquiry, Blog, GalleryItem, JobApplication, City, LocationMaster, PropertyType, Facing, Amenity } from '../types';
import logoImg from '../assets/logo.png';
import { 
  getProjects, 
  getMarketing,
  getEnquiries, 
  getBlogs, 
  getGallery, 
  getUsers, 
  getSessionUser, 
  setSessionUser,
  getApplications,
  getCities,
  getLocations,
  getPropertyTypes,
  getFacings,
  getAmenities,
  loginUser,
  logoutUser
} from '../utils/db';

// Subcomponents
import { AdminDashboard } from './AdminDashboard';
import { AdminProjects } from './AdminProjects';
import { AdminMarketing } from './AdminMarketing';
import { AdminSites } from './AdminSites';
import { AdminGallery } from './AdminGallery';
import { AdminBlogs } from './AdminBlogs';
import { AdminEnquiries } from './AdminEnquiries';
import { AdminUsers } from './AdminUsers';
import { AdminCareers } from './AdminCareers';
import { AdminMasters } from './AdminMasters';
import { AdminAuditLogs } from './AdminAuditLogs';
import type { AuditLog } from './AdminAuditLogs';

// Icons
import { 
  LayoutDashboard, 
  Building, 
  Layers, 
  Map, 
  Image as ImageIcon, 
  FileText, 
  MessageSquare, 
  Users, 
  Briefcase,
  Database,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Eye,
  EyeOff,
  Search,
  ClipboardList
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  selectedEnquiryFromDashboard: Enquiry | null;
  onClearSelectedEnquiry: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onNavigate,
  onAddToast,
  selectedEnquiryFromDashboard,
  onClearSelectedEnquiry
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Login credentials states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Database states
  const [projects, setProjects] = useState<Project[]>([]);
  const [marketing, setMarketing] = useState<Project[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<LocationMaster[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [facings, setFacings] = useState<Facing[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  // Multi-Tab routing state
  const [openTabs, setOpenTabs] = useState<string[]>(['dashboard']);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Triggered review from main dashboard click
  const [focusedEnquiry, setFocusedEnquiry] = useState<Enquiry | null>(null);

  // Custom confirmation dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmResolver, setConfirmResolver] = useState<((val: boolean) => void) | null>(null);

  // SAP Fiori top bar actions popovers
  const [profileOpen, setProfileOpen] = useState(false);

  // Theme variable controls
  const theme = 'belize';

  // Search query states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{ id: string; name: string; desc: string; type: string; tab: string }>>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profilePopoverRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [draggedTabIdx, setDraggedTabIdx] = useState<number | null>(null);



  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Log system action
  const logAction = (action: string, details: string, status: 'Success' | 'Warning' | 'Failed' = 'Success') => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      timestamp: new Date().toISOString(),
      user: currentUser ? currentUser.name : 'System/Guest',
      role: currentUser ? currentUser.role : 'Guest',
      action,
      details,
      ip: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
      status
    };
    
    const currentLogs = JSON.parse(localStorage.getItem('sap_audit_logs') || '[]');
    const updated = [newLog, ...currentLogs];
    localStorage.setItem('sap_audit_logs', JSON.stringify(updated));
    setAuditLogs(updated);
  };

  // Seed default audit logs if empty
  useEffect(() => {
    const existing = localStorage.getItem('sap_audit_logs');
    if (!existing) {
      const defaultLogs: AuditLog[] = [
        { id: 'LOG001', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), user: 'Admin', role: 'Admin', action: 'User Login', details: 'Admin logged in successfully', ip: '192.168.1.5', status: 'Success' },
        { id: 'LOG002', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), user: 'Moderator', role: 'Moderator', action: 'Data Update', details: 'Moderator updated pricing for Sunrise Enclave', ip: '192.168.1.18', status: 'Success' },
        { id: 'LOG003', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), user: 'Admin', role: 'Admin', action: 'Leads Export', details: 'Exported project enquiries report to CSV format', ip: '192.168.1.5', status: 'Success' },
        { id: 'LOG004', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), user: 'System', role: 'Admin', action: 'Backup System', details: 'Automatic SQL backup check completed', ip: '127.0.0.1', status: 'Success' }
      ];
      localStorage.setItem('sap_audit_logs', JSON.stringify(defaultLogs));
      setAuditLogs(defaultLogs);
    } else {
      setAuditLogs(JSON.parse(existing));
    }
  }, [currentUser]);

  // Apply Fiori theme colors variables dynamically on select
  useEffect(() => {
    const root = document.querySelector('.admin-layout') as HTMLElement;
    if (!root) return;

    if (theme === 'belize') {
      root.style.setProperty('--sap-shell-bg', '#0f2b46');
      root.style.setProperty('--sap-sidebar-bg', '#081625');
      root.style.setProperty('--sap-sidebar-active', '#1a436b');
    } else if (theme === 'quartz') {
      root.style.setProperty('--sap-shell-bg', '#18181b');
      root.style.setProperty('--sap-sidebar-bg', '#27272a');
      root.style.setProperty('--sap-sidebar-active', '#dc2626');
    } else if (theme === 'gold') {
      root.style.setProperty('--sap-shell-bg', '#3b0764');
      root.style.setProperty('--sap-sidebar-bg', '#1e1b4b');
      root.style.setProperty('--sap-sidebar-active', '#f2b705');
    }
  }, [theme]);

  // Handle global search input change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const suggestions: Array<{ id: string; name: string; desc: string; type: string; tab: string }> = [];

    // Search Projects
    projects.forEach(p => {
      if (p.name.toLowerCase().includes(query) || p.location.toLowerCase().includes(query)) {
        suggestions.push({
          id: p.id,
          name: p.name,
          desc: `Project: ${p.location}`,
          type: 'Project',
          tab: 'projects'
        });
      }
    });

    // Search Marketing
    marketing.forEach(m => {
      if (m.name.toLowerCase().includes(query) || m.location.toLowerCase().includes(query)) {
        suggestions.push({
          id: m.id,
          name: m.name,
          desc: `Marketing: ${m.location}`,
          type: 'Marketing',
          tab: 'marketing'
        });
      }
    });

    // Search Enquiries
    enquiries.forEach(e => {
      if (e.name.toLowerCase().includes(query) || (e.projectName && e.projectName.toLowerCase().includes(query))) {
        suggestions.push({
          id: e.id,
          name: e.name,
          desc: `Lead: Interested in ${e.projectName || 'General'}`,
          type: 'Lead',
          tab: e.projectAssociation?.startsWith('m') ? 'marketing_enquiries' : 'project_enquiries'
        });
      }
    });

    // Search Blogs
    blogs.forEach(b => {
      if (b.title.toLowerCase().includes(query)) {
        suggestions.push({
          id: b.id,
          name: b.title,
          desc: `Blog by ${b.author}`,
          type: 'Blog',
          tab: 'blogs'
        });
      }
    });

    setSearchSuggestions(suggestions.slice(0, 8));
  }, [searchQuery, projects, marketing, enquiries, blogs]);

  // Handle click outside global search dropdown to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle click outside profile popover to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        profileOpen &&
        profilePopoverRef.current &&
        !profilePopoverRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileOpen]);

  const handleConfirmAction = (message: string): Promise<boolean> => {
    setConfirmMessage(message);
    setConfirmOpen(true);
    return new Promise((resolve) => {
      setConfirmResolver(() => resolve);
    });
  };

  const handleConfirmChoice = (choice: boolean) => {
    setConfirmOpen(false);
    if (confirmResolver) {
      confirmResolver(choice);
    }
  };

  // Sync DB records
  const syncDBData = async () => {
    try {
      const [projs, mktg, enqs, blgs, gal, usrs, apps, cts, locs, pts, fcs, ams] = await Promise.all([
        getProjects(),
        getMarketing(),
        getEnquiries(),
        getBlogs(),
        getGallery(),
        getUsers(),
        getApplications(),
        getCities(),
        getLocations(),
        getPropertyTypes(),
        getFacings(),
        getAmenities()
      ]);
      setProjects(projs);
      setMarketing(mktg);
      setEnquiries(enqs);
      setBlogs(blgs);
      setGallery(gal);
      setUsers(usrs);
      setApplications(apps);
      setCities(cts);
      setLocations(locs);
      setPropertyTypes(pts);
      setFacings(fcs);
      setAmenities(ams);
    } catch (err) {
      console.error("Error syncing data from backend:", err);
      onAddToast("Failed to fetch records from backend server.", "error");
    }
  };

  useEffect(() => {
    const session = getSessionUser();
    const token = sessionStorage.getItem('jk_infra_logged_user_token');
    if (session && token) {
      setCurrentUser(session);
      syncDBData();
    } else if (session) {
      // Clear legacy session that has no token, force re-login
      setSessionUser(null);
      setCurrentUser(null);
    }
  }, []);

  // Helper for screen permissions
  const hasScreenAccess = (screenId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    
    if (currentUser.allowedScreens) {
      return currentUser.allowedScreens.includes(screenId);
    }
    
    // Fallback defaults
    switch (screenId) {
      case 'dashboard':
        return true;
      case 'projects':
        return currentUser.role === 'ProjectOwner';
      case 'marketing':
      case 'sites':
        return currentUser.role === 'MarketingOwner';
      case 'project_gallery':
      case 'blogs':
      case 'careers':
      case 'audit_logs':
        return true;
      case 'marketing_gallery':
        return currentUser.role === 'MarketingOwner';
      case 'project_enquiries':
        return currentUser.role === 'ProjectOwner';
      case 'marketing_enquiries':
        return currentUser.role === 'MarketingOwner';
      case 'users':
      case 'masters':
        return false;
      default:
        return false;
    }
  };

  // Redirect if currently selected tab is not allowed
  useEffect(() => {
    if (currentUser) {
      const allTabs = ['dashboard', 'projects', 'marketing', 'sites', 'project_gallery', 'marketing_gallery', 'blogs', 'project_enquiries', 'marketing_enquiries', 'careers', 'users', 'masters', 'audit_logs'];
      const allowed = allTabs.filter(tab => hasScreenAccess(tab));
      if (allowed.length > 0 && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
        setOpenTabs([allowed[0]]);
      }
    }
  }, [currentUser, activeTab]);

  // Handle direct enquiries clicks from main dashboard
  useEffect(() => {
    if (selectedEnquiryFromDashboard) {
      setFocusedEnquiry(selectedEnquiryFromDashboard);
      const isMarketing = selectedEnquiryFromDashboard.projectAssociation?.startsWith('m');
      const targetTab = isMarketing ? 'marketing_enquiries' : 'project_enquiries';
      handleOpenTab(targetTab);
      onClearSelectedEnquiry();
    }
  }, [selectedEnquiryFromDashboard, onClearSelectedEnquiry]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedUser = await loginUser(usernameInput, passwordInput);
      setSessionUser(loggedUser);
      setCurrentUser(loggedUser);
      await syncDBData();
      
      // Reset tabs on login
      setOpenTabs(['dashboard']);
      setActiveTab('dashboard');
      
      onAddToast(`Logged in successfully as ${loggedUser.name} (${loggedUser.role}).`, 'success');
      logAction('User Login', `Logged in successfully as ${loggedUser.name} (${loggedUser.role})`, 'Success');
    } catch (err: any) {
      onAddToast(err.message || 'Invalid username or password.', 'error');
      logAction('User Login', `Failed login attempt for username: ${usernameInput}`, 'Failed');
    }
  };

  const handleLogout = async () => {
    try {
      if (currentUser) {
        logAction('User Logout', `Logged out from session: ${currentUser.name}`, 'Success');
        await logoutUser(currentUser.username);
      }
    } catch (err) {
      console.error("Failed to track logout session:", err);
    }
    setSessionUser(null);
    setCurrentUser(null);
    onAddToast('Logged out from Admin Session.', 'info');
  };

  const handleSelectEnquiryReview = (enq: Enquiry) => {
    setFocusedEnquiry(enq);
    const isMarketing = enq.projectAssociation?.startsWith('m');
    handleOpenTab(isMarketing ? 'marketing_enquiries' : 'project_enquiries');
  };

  // Tabs Management
  const handleOpenTab = (tabKey: string) => {
    if (!hasScreenAccess(tabKey)) return;
    
    if (!openTabs.includes(tabKey)) {
      setOpenTabs([...openTabs, tabKey]);
    }
    setActiveTab(tabKey);
    setAdminMenuOpen(false);
  };

  const handleCloseTab = (tabKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabKey === 'dashboard') return; // Pinned tab
    
    const newTabs = openTabs.filter(t => t !== tabKey);
    setOpenTabs(newTabs);
    
    if (activeTab === tabKey) {
      setActiveTab(newTabs[newTabs.length - 1] || 'dashboard');
    }
  };

  // Drag and Drop Tabs reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTabIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedTabIdx === null || draggedTabIdx === targetIndex) return;

    const reorderedTabs = [...openTabs];
    const [removed] = reorderedTabs.splice(draggedTabIdx, 1);
    reorderedTabs.splice(targetIndex, 0, removed);

    setOpenTabs(reorderedTabs);
    setDraggedTabIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedTabIdx(null);
  };

  // Click handler on search recommendation
  const handleSuggestionClick = (sug: { id: string; name: string; tab: string }) => {
    handleOpenTab(sug.tab);
    setSearchQuery(sug.name);
    setSearchSuggestions([]);
    
    // Seed enquiry review if suggestion clicked was a lead
    if (sug.tab === 'project_enquiries' || sug.tab === 'marketing_enquiries') {
      const match = enquiries.find(e => e.id === sug.id);
      if (match) {
        setFocusedEnquiry(match);
      }
    }
    
    logAction('Global Search', `Navigated to ${sug.tab} and filtered by "${sug.name}"`, 'Success');
  };



  // Format Tab Display Name
  const getTabLabel = (tabKey: string): string => {
    switch (tabKey) {
      case 'dashboard': return 'Launchpad Overview';
      case 'projects': return 'Manage Projects';
      case 'marketing': return 'Manage Marketing';
      case 'sites': return 'Plot Layouts';
      case 'project_gallery': return 'Project Gallery';
      case 'marketing_gallery': return 'Marketing Gallery';
      case 'blogs': return 'Blogs & News';
      case 'project_enquiries': return 'Project Leads';
      case 'marketing_enquiries': return 'Marketing Leads';
      case 'careers': return 'Job Applications';
      case 'users': return 'Staff Logins';
      case 'masters': return 'Masters Config';
      case 'audit_logs': return 'System Audit Trail';
      default: return tabKey;
    }
  };

  // Filter states based on global search query
  const searchedProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.location.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  const searchedMarketing = useMemo(() => {
    if (!searchQuery.trim()) return marketing;
    const query = searchQuery.toLowerCase();
    return marketing.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.location.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query)
    );
  }, [marketing, searchQuery]);

  const searchedEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries;
    const query = searchQuery.toLowerCase();
    return enquiries.filter(e => 
      e.name.toLowerCase().includes(query) || 
      e.phone.includes(query) || 
      e.email.toLowerCase().includes(query) || 
      (e.projectName && e.projectName.toLowerCase().includes(query))
    );
  }, [enquiries, searchQuery]);

  const searchedBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const query = searchQuery.toLowerCase();
    return blogs.filter(b => 
      b.title.toLowerCase().includes(query) || 
      b.author.toLowerCase().includes(query) || 
      b.summary.toLowerCase().includes(query)
    );
  }, [blogs, searchQuery]);

  // Render Login Gate Screen
  if (!currentUser) {
    return (
      <div className="login-screen-wrapper">
        <div className="login-bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&auto=format&fit=crop&q=80')" }}></div>
        <div className="login-bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&auto=format&fit=crop&q=80')" }}></div>
        <div className="login-bg-slide" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop&q=80')" }}></div>

        <div className="login-card">
          <div className="login-card-header">
            <img 
              src={logoImg} 
              alt="JK Future Infra Logo" 
              style={{ height: '130px', width: 'auto', display: 'block', margin: '0 auto 0.75rem', objectFit: 'contain' }} 
            />
            <h2>Log In <span style={{ fontWeight: 300 }}>to your account</span></h2>
          </div>
          
          <div className="login-card-body">
            <form onSubmit={handleLoginSubmit}>
              <div className="login-form-group">
                <input 
                  type="text" 
                  className="login-form-control" 
                  placeholder="Username" 
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  required
                />
              </div>
              
              <div className="login-form-group" style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="login-form-control" 
                  placeholder="Password" 
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="login-actions-wrapper">
                <button 
                  type="button" 
                  onClick={() => onNavigate('home')} 
                  className="login-btn-back-link"
                >
                  ← Back to site
                </button>
                <button type="submit" className="login-btn-submit">
                  Log In
                </button>
              </div>
            </form>
          </div>

          <div className="login-card-footer-copyright">
            <div>© 2026 JK Future Infra</div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* Collapsible Left Sidebar */}
      <aside className={`admin-sidebar ${adminMenuOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        
        <div className="admin-sidebar-header">
          <img 
            src={logoImg} 
            alt="JK Logo" 
            style={{ height: '42px', width: '42px', objectFit: 'contain', backgroundColor: 'var(--white)', padding: '4px', borderRadius: '4px' }} 
          />
          {!sidebarCollapsed && <span className="font-bold text-xs text-white uppercase ml-1" style={{ letterSpacing: '1px' }}>Admin Portal</span>}
          <button 
            type="button"
            className="sidebar-collapse-btn hide-mobile"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <ul className="admin-sidebar-menu">
          
          {/* Group 1: General */}
          <div className="admin-sidebar-group">
            <div className="admin-sidebar-group-title">Overview</div>
            {hasScreenAccess('dashboard') && (
              <li className="admin-sidebar-item">
                <button 
                  onClick={() => handleOpenTab('dashboard')} 
                  className={`admin-sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  data-tooltip="Launchpad Overview"
                >
                  <LayoutDashboard size={16} /> <span className="admin-sidebar-link-text">Dashboard</span>
                </button>
              </li>
            )}
          </div>

          {/* Group 2: Listings & Properties */}
          {(hasScreenAccess('projects') || hasScreenAccess('marketing') || hasScreenAccess('sites')) && (
            <div className="admin-sidebar-group">
              <div className="admin-sidebar-group-title">Business Operations</div>
              
              {hasScreenAccess('projects') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('projects')} 
                    className={`admin-sidebar-link ${activeTab === 'projects' ? 'active' : ''}`}
                    data-tooltip="Manage Projects"
                  >
                    <Building size={16} /> <span className="admin-sidebar-link-text">Manage Projects</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('marketing') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('marketing')} 
                    className={`admin-sidebar-link ${activeTab === 'marketing' ? 'active' : ''}`}
                    data-tooltip="Manage Marketing"
                  >
                    <Layers size={16} /> <span className="admin-sidebar-link-text">Manage Marketing</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('sites') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('sites')} 
                    className={`admin-sidebar-link ${activeTab === 'sites' ? 'active' : ''}`}
                    data-tooltip="Plot Layouts"
                  >
                    <Map size={16} /> <span className="admin-sidebar-link-text">Plot Layouts</span>
                  </button>
                </li>
              )}
            </div>
          )}

          {/* Group 3: Media & Blogs */}
          {(hasScreenAccess('project_gallery') || hasScreenAccess('marketing_gallery') || hasScreenAccess('blogs')) && (
            <div className="admin-sidebar-group">
              <div className="admin-sidebar-group-title">Media & Content</div>
              
              {hasScreenAccess('project_gallery') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('project_gallery')} 
                    className={`admin-sidebar-link ${activeTab === 'project_gallery' ? 'active' : ''}`}
                    data-tooltip="Project Gallery"
                  >
                    <ImageIcon size={16} /> <span className="admin-sidebar-link-text">Project Gallery</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('marketing_gallery') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('marketing_gallery')} 
                    className={`admin-sidebar-link ${activeTab === 'marketing_gallery' ? 'active' : ''}`}
                    data-tooltip="Marketing Gallery"
                  >
                    <ImageIcon size={16} /> <span className="admin-sidebar-link-text">Marketing Gallery</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('blogs') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('blogs')} 
                    className={`admin-sidebar-link ${activeTab === 'blogs' ? 'active' : ''}`}
                    data-tooltip="Blogs & News"
                  >
                    <FileText size={16} /> <span className="admin-sidebar-link-text">Blogs & News</span>
                  </button>
                </li>
              )}
            </div>
          )}

          {/* Group 4: Inquiries & Leads */}
          {(hasScreenAccess('project_enquiries') || hasScreenAccess('marketing_enquiries') || hasScreenAccess('careers')) && (
            <div className="admin-sidebar-group">
              <div className="admin-sidebar-group-title">Inquiries & Leads</div>
              
              {hasScreenAccess('project_enquiries') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('project_enquiries')} 
                    className={`admin-sidebar-link ${activeTab === 'project_enquiries' ? 'active' : ''}`}
                    data-tooltip="Project Leads"
                  >
                    <MessageSquare size={16} /> <span className="admin-sidebar-link-text">Project Leads</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('marketing_enquiries') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('marketing_enquiries')} 
                    className={`admin-sidebar-link ${activeTab === 'marketing_enquiries' ? 'active' : ''}`}
                    data-tooltip="Marketing Leads"
                  >
                    <MessageSquare size={16} /> <span className="admin-sidebar-link-text">Marketing Leads</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('careers') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('careers')} 
                    className={`admin-sidebar-link ${activeTab === 'careers' ? 'active' : ''}`}
                    data-tooltip="Job Applications"
                  >
                    <Briefcase size={16} /> <span className="admin-sidebar-link-text">Job Applications</span>
                  </button>
                </li>
              )}
            </div>
          )}

          {/* Group 5: Administration */}
          {(hasScreenAccess('users') || hasScreenAccess('masters') || hasScreenAccess('audit_logs')) && (
            <div className="admin-sidebar-group">
              <div className="admin-sidebar-group-title">System Admin</div>
              
              {hasScreenAccess('users') && currentUser.role === 'Admin' && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('users')} 
                    className={`admin-sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
                    data-tooltip="Staff Logins"
                  >
                    <Users size={16} /> <span className="admin-sidebar-link-text">Staff Logins</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('masters') && currentUser.role === 'Admin' && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('masters')} 
                    className={`admin-sidebar-link ${activeTab === 'masters' ? 'active' : ''}`}
                    data-tooltip="Masters Config"
                  >
                    <Database size={16} /> <span className="admin-sidebar-link-text">Masters Config</span>
                  </button>
                </li>
              )}

              {hasScreenAccess('audit_logs') && (
                <li className="admin-sidebar-item">
                  <button 
                    onClick={() => handleOpenTab('audit_logs')} 
                    className={`admin-sidebar-link ${activeTab === 'audit_logs' ? 'active' : ''}`}
                    data-tooltip="System Audit Trail"
                  >
                    <ClipboardList size={16} /> <span className="admin-sidebar-link-text">Audit Trail</span>
                  </button>
                </li>
              )}
            </div>
          )}
        </ul>


      </aside>

      {/* Workspace Panel Rendering Container */}
      <div className="admin-workspace">
        
        {/* Top SAP Shell Bar */}
        <header className="sap-shellbar">
          <div className="sap-shellbar-left">
            <button 
              className="sidebar-collapse-btn show-mobile"
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              style={{ padding: '8px' }}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Global Smart Search */}
          <div className="sap-shellbar-center" ref={searchContainerRef}>
            <div className="sap-shellbar-search-wrapper">
              <input 
                type="text"
                placeholder="Global search projects, leads, blogs..."
                className="sap-shellbar-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSearchSuggestions([]);
                  }
                }}
              />
              <Search size={16} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)' }} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchSuggestions([]); }}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.6)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Suggestions dropdown list */}
            {searchSuggestions.length > 0 && (
              <div className="sap-search-suggestions">
                <div className="sap-suggestion-group-title">Recommendations matching "{searchQuery}"</div>
                {searchSuggestions.map((sug, i) => (
                  <div key={i} className="sap-suggestion-item" onClick={() => handleSuggestionClick(sug)}>
                    <div className="flex flex-col">
                      <span className="sap-suggestion-name">{sug.name}</span>
                      <span className="sap-suggestion-desc">{sug.desc}</span>
                    </div>
                    <span className="badge badge-ongoing" style={{ fontSize: '0.65rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {sug.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sap-shellbar-right">
            {/* User Profile */}
            <button 
              ref={profileButtonRef}
              className="sap-shellbar-action-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ padding: '4px' }}
              title="My Account"
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem', justifyContent: 'center' }}>
                {currentUser.name.charAt(0)}
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Action Popovers */}
        


        {/* 4. User Profile Profile Popover */}
        {profileOpen && (
          <div ref={profilePopoverRef} className="sap-popover" style={{ width: '280px' }}>
            <div className="sap-popover-body" style={{ padding: '1.25rem' }}>
              <div 
                className="flex flex-col align-center text-center gap-0.75 profile-block-hover"
                onClick={() => {
                  setProfileOpen(false);
                  if (hasScreenAccess('users')) {
                    handleOpenTab('users');
                  } else {
                    onAddToast('Staff logins management is restricted to Administrators.', 'error');
                  }
                }}
                style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', transition: 'background-color 0.2s' }}
                title="Go to Manage Staff Logins"
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.8rem', justifyContent: 'center', margin: '0 auto' }}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-md text-dark leading-tight">{currentUser.name}</span>
                  <span className="text-xs text-muted" style={{ marginTop: '0.1rem' }}>{currentUser.email}</span>
                  <span className="text-xxs text-secondary font-bold uppercase mt-0.5" style={{ color: 'var(--sap-fiori-blue)', fontSize: '0.65rem' }}>
                    Staff ID: JK-{currentUser.id.substring(0, 5).toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Authorization Level:</span>
                  <strong>{currentUser.role}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Staff Status:</span>
                  <span className="text-success font-semibold">Active Session</span>
                </div>
              </div>
            </div>
            <div className="sap-popover-footer" style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  if (hasScreenAccess('users')) {
                    handleOpenTab('users');
                  } else {
                    onAddToast('Staff logins management is restricted to Administrators.', 'error');
                  }
                }}
                className="btn btn-outline btn-sm flex-1"
                style={{ fontSize: '0.75rem', borderColor: 'var(--sap-border-color)' }}
              >
                Profile
              </button>
              <button 
                type="button"
                onClick={() => { setProfileOpen(false); handleLogout(); }}
                className="btn btn-secondary btn-sm flex-1"
                style={{ fontSize: '0.75rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Multi-Tab Navigation Bar */}
        <nav className="sap-tabbar">
          {openTabs.map((tabKey, index) => (
            <div 
              key={tabKey}
              className={`sap-tab ${activeTab === tabKey ? 'active' : ''} ${draggedTabIdx === index ? 'dragging' : ''}`}
              onClick={() => setActiveTab(tabKey)}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <span>{getTabLabel(tabKey)}</span>
              {tabKey !== 'dashboard' && (
                <button 
                  type="button"
                  onClick={(e) => handleCloseTab(tabKey, e)}
                  className="sap-tab-close"
                  title="Close tab"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Main Panel Content Render Area */}
        <main className="admin-main">
          {activeTab === 'dashboard' && hasScreenAccess('dashboard') && (
            <AdminDashboard 
              projects={searchedProjects}
              marketing={searchedMarketing}
              enquiries={searchedEnquiries}
              blogs={searchedBlogs}
              onSetTab={handleOpenTab}
              onSelectEnquiry={handleSelectEnquiryReview}
              role={currentUser.role}
              onSetSearchQuery={setSearchQuery}
            />
          )}
          
          {activeTab === 'projects' && hasScreenAccess('projects') && (
            <AdminProjects 
              projects={searchedProjects}
              cities={cities}
              locations={locations}
              propertyTypes={propertyTypes}
              facings={facings}
              amenities={amenities}
              onRefresh={() => { syncDBData(); logAction('Data Sync', 'Refreshed project lists from SQL database', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Project Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}
          
          {activeTab === 'marketing' && hasScreenAccess('marketing') && (
            <AdminMarketing 
              marketing={searchedMarketing}
              cities={cities}
              locations={locations}
              propertyTypes={propertyTypes}
              facings={facings}
              amenities={amenities}
              onRefresh={() => { syncDBData(); logAction('Data Sync', 'Refreshed marketing lists from SQL database', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Marketing Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'sites' && hasScreenAccess('sites') && (
            <AdminSites 
              marketing={searchedMarketing}
            />
          )}

          {activeTab === 'project_gallery' && hasScreenAccess('project_gallery') && (
            <AdminGallery 
              gallery={gallery}
              projects={searchedProjects}
              marketing={searchedMarketing}
              mediaType="projects"
              onRefresh={() => { syncDBData(); logAction('Gallery Sync', 'Synced projects photo gallery', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Gallery Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'marketing_gallery' && hasScreenAccess('marketing_gallery') && (
            <AdminGallery 
              gallery={gallery}
              projects={searchedProjects}
              marketing={searchedMarketing}
              mediaType="marketing"
              onRefresh={() => { syncDBData(); logAction('Gallery Sync', 'Synced marketing photo gallery', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Gallery Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'blogs' && hasScreenAccess('blogs') && (
            <AdminBlogs 
              blogs={searchedBlogs}
              onRefresh={() => { syncDBData(); logAction('Blogs Sync', 'Synced blogs and company updates list', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Blogs Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'project_enquiries' && hasScreenAccess('project_enquiries') && (
            <AdminEnquiries 
              enquiries={searchedEnquiries}
              type="projects"
              selectedEnquiry={focusedEnquiry}
              onClearSelected={() => setFocusedEnquiry(null)}
              onRefresh={() => { syncDBData(); logAction('Leads Sync', 'Synced project enquiries', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Leads Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'marketing_enquiries' && hasScreenAccess('marketing_enquiries') && (
            <AdminEnquiries 
              enquiries={searchedEnquiries}
              type="marketing"
              selectedEnquiry={focusedEnquiry}
              onClearSelected={() => setFocusedEnquiry(null)}
              onRefresh={() => { syncDBData(); logAction('Leads Sync', 'Synced marketing enquiries', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Leads Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'careers' && hasScreenAccess('careers') && (
            <AdminCareers 
              applications={applications}
              onRefresh={() => { syncDBData(); logAction('Careers Sync', 'Synced job applications list', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Careers Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'users' && hasScreenAccess('users') && currentUser.role === 'Admin' && (
            <AdminUsers 
              users={users}
              currentUser={currentUser}
              onRefresh={async () => {
                await syncDBData();
                logAction('Staff Sync', 'Refreshed staff configurations', 'Success');
                if (currentUser) {
                  try {
                    const dbUsers = await getUsers();
                    const freshSession = dbUsers.find(u => u.id === currentUser.id);
                    if (freshSession) {
                      setSessionUser(freshSession);
                      setCurrentUser(freshSession);
                    }
                  } catch (err) {
                    console.error("Error refreshing current user session:", err);
                  }
                }
              }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Staff Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'masters' && hasScreenAccess('masters') && currentUser.role === 'Admin' && (
            <AdminMasters 
              cities={cities}
              locations={locations}
              propertyTypes={propertyTypes}
              facings={facings}
              amenities={amenities}
              onRefresh={() => { syncDBData(); logAction('Masters Sync', 'Synced Masters configuration matrices', 'Success'); }}
              onAddToast={(msg, type) => {
                onAddToast(msg, type);
                if (type === 'success') logAction('Masters Update', msg, 'Success');
              }}
              onConfirm={handleConfirmAction}
            />
          )}

          {activeTab === 'audit_logs' && hasScreenAccess('audit_logs') && (
            <AdminAuditLogs 
              logs={auditLogs}
              onClearLogs={() => {
                localStorage.removeItem('sap_audit_logs');
                setAuditLogs([]);
                onAddToast('System audit trail log has been cleared.', 'info');
              }}
              onRefresh={() => {
                const refreshed = JSON.parse(localStorage.getItem('sap_audit_logs') || '[]');
                setAuditLogs(refreshed);
                onAddToast('Audit logs trail refreshed.', 'success');
              }}
            />
          )}
        </main>

        {/* Custom Confirmation Modal */}
        {confirmOpen && (
          <div className="modal-overlay" style={{ zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()} style={{ width: '400px', borderRadius: '8px', overflow: 'hidden' }}>
              <div className="confirm-modal-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#fce8e6', borderBottom: '1px solid #f5c2c2', color: '#c93b3b', fontWeight: 'bold' }}>
                <AlertTriangle size={20} />
                <span>Confirm Action Request</span>
              </div>
              <div className="confirm-modal-body" style={{ padding: '1.25rem', fontSize: '0.9rem', color: '#333' }}>
                {confirmMessage}
              </div>
              <div className="confirm-modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '1rem', borderTop: '1px solid #eee' }}>
                <button 
                  type="button"
                  onClick={() => handleConfirmChoice(false)} 
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => handleConfirmChoice(true)} 
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    backgroundColor: 'var(--danger)', 
                    borderColor: 'var(--danger)', 
                    color: 'white',
                    padding: '0.45rem 1rem', 
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
