import React, { useState, useEffect } from 'react';
import type { User, Project, Enquiry, Blog, GalleryItem, JobApplication, City, LocationMaster } from '../types';
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
  LogOut, 
  Globe, 
  UserCheck, 
  ShieldCheck,
  Briefcase,
  Database,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Eye,
  EyeOff
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

  // Navigation tab within admin panel
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Triggered review from main dashboard click
  const [focusedEnquiry, setFocusedEnquiry] = useState<Enquiry | null>(null);

  // Custom confirmation dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmResolver, setConfirmResolver] = useState<((val: boolean) => void) | null>(null);

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
      const [projs, mktg, enqs, blgs, gal, usrs, apps, cts, locs] = await Promise.all([
        getProjects(),
        getMarketing(),
        getEnquiries(),
        getBlogs(),
        getGallery(),
        getUsers(),
        getApplications(),
        getCities(),
        getLocations()
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
      const allTabs = ['dashboard', 'projects', 'marketing', 'sites', 'project_gallery', 'marketing_gallery', 'blogs', 'project_enquiries', 'marketing_enquiries', 'careers', 'users', 'masters'];
      const allowed = allTabs.filter(tab => hasScreenAccess(tab));
      if (allowed.length > 0 && !allowed.includes(activeTab)) {
        setActiveTab(allowed[0]);
      }
    }
  }, [currentUser, activeTab]);

  // Handle direct enquiries clicks from main dashboard
  useEffect(() => {
    if (selectedEnquiryFromDashboard) {
      setFocusedEnquiry(selectedEnquiryFromDashboard);
      const isMarketing = selectedEnquiryFromDashboard.projectAssociation?.startsWith('m');
      setActiveTab(isMarketing ? 'marketing_enquiries' : 'project_enquiries');
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
      onAddToast(`Logged in successfully as ${loggedUser.name} (${loggedUser.role}).`, 'success');
    } catch (err: any) {
      onAddToast(err.message || 'Invalid username or password.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      if (currentUser) {
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
    setActiveTab('enquiries');
  };

  // Render Login Gate Screen
  if (!currentUser) {
    return (
      <div className="login-screen-wrapper">
        {/* Animated Background Slideshow */}
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

  // Render Logged In Admin Dashboard Sidebar Layout
  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Top Header */}
      <div 
        className="admin-mobile-header" 
        style={{ 
          display: 'none', // Styled in CSS media queries to show on mobile
          backgroundColor: 'var(--primary)',
          color: 'var(--white)',
          padding: '1rem 1.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <button 
          onClick={() => setAdminMenuOpen(!adminMenuOpen)}
          style={{ color: 'var(--white)' }}
        >
          {adminMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-bold text-sm text-white" style={{ letterSpacing: '0.5px' }}>JK ADMIN PORTAL</span>
        <button 
          onClick={handleLogout}
          style={{ color: 'var(--white)' }}
          title="Log Out"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {adminMenuOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setAdminMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '57px', // Height of mobile top header
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 98,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Expand Sidebar Button (Floating on the left) */}
      {sidebarCollapsed && (
        <button 
          className="admin-sidebar-expand-btn hide-mobile"
          onClick={() => setSidebarCollapsed(false)}
          title="Expand Sidebar"
        >
          <ChevronRight size={20} />
        </button>
      )}

      <aside className={`admin-sidebar ${adminMenuOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header flex flex-col gap-1" style={{ position: 'relative', padding: '1rem 0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', alignItems: 'center' }}>
          <button 
            type="button"
            className="sidebar-collapse-btn hide-mobile"
            onClick={() => setSidebarCollapsed(true)}
            title="Collapse Sidebar"
            style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'var(--white)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <img 
            src={logoImg} 
            alt="JK Logo" 
            style={{ height: '101px', width: '191px', objectFit: 'contain', backgroundColor: 'var(--white)', padding: '4px', borderRadius: 'var(--radius-sm)', marginTop: '24px' }} 
          />
        </div>

        <ul className="admin-sidebar-menu">
          {hasScreenAccess('dashboard') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('dashboard'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
            </li>
          )}

          {hasScreenAccess('projects') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('projects'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'projects' ? 'active' : ''}`}
              >
                <Building size={18} /> Manage Projects
              </button>
            </li>
          )}

          {hasScreenAccess('marketing') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('marketing'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'marketing' ? 'active' : ''}`}
              >
                <Layers size={18} /> Manage Marketing
              </button>
            </li>
          )}

          {hasScreenAccess('sites') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('sites'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'sites' ? 'active' : ''}`}
              >
                <Map size={18} /> Plot Layouts
              </button>
            </li>
          )}

          {hasScreenAccess('project_gallery') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('project_gallery'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'project_gallery' ? 'active' : ''}`}
              >
                <ImageIcon size={18} /> Project Gallery
              </button>
            </li>
          )}

          {hasScreenAccess('marketing_gallery') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('marketing_gallery'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'marketing_gallery' ? 'active' : ''}`}
              >
                <ImageIcon size={18} /> Marketing Gallery
              </button>
            </li>
          )}

          {hasScreenAccess('blogs') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('blogs'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'blogs' ? 'active' : ''}`}
              >
                <FileText size={18} /> Blogs & News
              </button>
            </li>
          )}

          {hasScreenAccess('project_enquiries') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('project_enquiries'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'project_enquiries' ? 'active' : ''}`}
              >
                <MessageSquare size={18} /> Project Leads
              </button>
            </li>
          )}

          {hasScreenAccess('marketing_enquiries') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('marketing_enquiries'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'marketing_enquiries' ? 'active' : ''}`}
              >
                <MessageSquare size={18} /> Marketing Leads
              </button>
            </li>
          )}

          {hasScreenAccess('careers') && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('careers'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'careers' ? 'active' : ''}`}
              >
                <Briefcase size={18} /> Job Applications
              </button>
            </li>
          )}

          {hasScreenAccess('users') && currentUser.role === 'Admin' && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('users'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
              >
                <Users size={18} /> Staff Logins
              </button>
            </li>
          )}

          {hasScreenAccess('masters') && currentUser.role === 'Admin' && (
            <li className="admin-sidebar-item">
              <button 
                onClick={() => { setActiveTab('masters'); setAdminMenuOpen(false); }} 
                className={`admin-sidebar-link ${activeTab === 'masters' ? 'active' : ''}`}
              >
                <Database size={18} /> Masters Config
              </button>
            </li>
          )}
        </ul>

        {/* Sidebar bottom info */}
        <div className="admin-sidebar-footer flex flex-col gap-1">
          <div className="flex gap-1 align-center text-sm">
            <div className="user-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem', justifyContent: 'center' }}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-white leading-tight">{currentUser.name}</span>
              <span className="text-xxs text-muted flex align-center gap-0.5 leading-none" style={{ fontSize: '0.7rem' }}>
                {currentUser.role === 'Admin' ? <ShieldCheck size={10} className="text-success" /> : <UserCheck size={10} />}
                {currentUser.role}
              </span>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => { onNavigate('home'); setAdminMenuOpen(false); }} 
              className="btn btn-outline-white btn-sm flex-1 flex align-center justify-center gap-0.5" 
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <Globe size={12} /> Exit Site
            </button>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary btn-sm flex-1 flex align-center justify-center gap-0.5"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
            >
              <LogOut size={12} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Render Area */}
      <main className="admin-main">
        {activeTab === 'dashboard' && hasScreenAccess('dashboard') && (
          <AdminDashboard 
            projects={projects}
            marketing={marketing}
            enquiries={enquiries}
            blogs={blogs}
            onSetTab={setActiveTab}
            onSelectEnquiry={handleSelectEnquiryReview}
            role={currentUser.role}
          />
        )}
        
        {activeTab === 'projects' && hasScreenAccess('projects') && (
          <AdminProjects 
            projects={projects}
            cities={cities}
            locations={locations}
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}
        
        {activeTab === 'marketing' && hasScreenAccess('marketing') && (
          <AdminMarketing 
            marketing={marketing}
            cities={cities}
            locations={locations}
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'sites' && hasScreenAccess('sites') && (
          <AdminSites 
            marketing={marketing}
          />
        )}

        {activeTab === 'project_gallery' && hasScreenAccess('project_gallery') && (
          <AdminGallery 
            gallery={gallery}
            projects={projects}
            marketing={marketing}
            mediaType="projects"
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'marketing_gallery' && hasScreenAccess('marketing_gallery') && (
          <AdminGallery 
            gallery={gallery}
            projects={projects}
            marketing={marketing}
            mediaType="marketing"
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'blogs' && hasScreenAccess('blogs') && (
          <AdminBlogs 
            blogs={blogs}
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'project_enquiries' && hasScreenAccess('project_enquiries') && (
          <AdminEnquiries 
            enquiries={enquiries}
            type="projects"
            selectedEnquiry={focusedEnquiry}
            onClearSelected={() => setFocusedEnquiry(null)}
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'marketing_enquiries' && hasScreenAccess('marketing_enquiries') && (
          <AdminEnquiries 
            enquiries={enquiries}
            type="marketing"
            selectedEnquiry={focusedEnquiry}
            onClearSelected={() => setFocusedEnquiry(null)}
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'careers' && hasScreenAccess('careers') && (
          <AdminCareers 
            applications={applications}
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'users' && hasScreenAccess('users') && currentUser.role === 'Admin' && (
          <AdminUsers 
            users={users}
            currentUser={currentUser}
            onRefresh={async () => {
              await syncDBData();
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
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}

        {activeTab === 'masters' && hasScreenAccess('masters') && currentUser.role === 'Admin' && (
          <AdminMasters 
            cities={cities}
            locations={locations}
            onRefresh={syncDBData}
            onAddToast={onAddToast}
            onConfirm={handleConfirmAction}
          />
        )}
      </main>

      {/* Custom Confirmation Modal */}
      {confirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <AlertTriangle size={22} style={{ color: 'var(--danger)' }} />
              <span>Confirm Delete</span>
            </div>
            <div className="confirm-modal-body">
              {confirmMessage}
            </div>
            <div className="confirm-modal-footer">
              <button 
                type="button"
                onClick={() => handleConfirmChoice(false)} 
                className="btn btn-outline btn-sm"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
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
                  fontSize: '0.85rem' 
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
