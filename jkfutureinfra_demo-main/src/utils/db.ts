import type { Project, Blog, GalleryItem, Enquiry, User, JobApplication, City, LocationMaster } from '../types';

//const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const getAuthHeaders = (): Record<string, string> => {
  const token = sessionStorage.getItem('jk_infra_logged_user_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (res: Response) => {
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
  return json.data;
};

// We don't need real initDB for SQL but we keep it as a no-op just to satisfy App.tsx import
export const initDB = () => {
  // Database runs on backend; no client-side DB initialization needed.
};

// Projects
export const getProjects = async (): Promise<Project[]> => {
  const res = await fetch(`${API_BASE_URL}/projects?isMarketing=false`);
  return handleResponse(res);
};

export const addProject = async (project: Project): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(project)
  });
  await handleResponse(res);
};

export const updateProject = async (project: Project): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/projects/${project.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(project)
  });
  await handleResponse(res);
};

export const deleteProject = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

// Marketing Properties
export const getMarketing = async (): Promise<Project[]> => {
  const res = await fetch(`${API_BASE_URL}/projects?isMarketing=true`);
  return handleResponse(res);
};

export const addMarketing = async (property: Project): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ ...property, isMarketing: true })
  });
  await handleResponse(res);
};

export const updateMarketing = async (property: Project): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/projects/${property.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ ...property, isMarketing: true })
  });
  await handleResponse(res);
};

export const deleteMarketing = async (id: string): Promise<void> => {
  await deleteProject(id);
};

// Blogs
export const getBlogs = async (): Promise<Blog[]> => {
  const res = await fetch(`${API_BASE_URL}/blogs`);
  return handleResponse(res);
};

export const addBlog = async (blog: Blog): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(blog)
  });
  await handleResponse(res);
};

export const updateBlog = async (blog: Blog): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/blogs/${blog.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(blog)
  });
  await handleResponse(res);
};

export const deleteBlog = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

// Gallery
export const getGallery = async (): Promise<GalleryItem[]> => {
  const res = await fetch(`${API_BASE_URL}/gallery`);
  return handleResponse(res);
};

export const addGalleryItem = async (item: GalleryItem): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item)
  });
  await handleResponse(res);
};

export const deleteGalleryItem = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

// Enquiries
export const getEnquiries = async (): Promise<Enquiry[]> => {
  const res = await fetch(`${API_BASE_URL}/enquiries`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addEnquiry = async (enquiry: Enquiry): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enquiry)
  });
  await handleResponse(res);
};

export const updateEnquiryStatus = async (id: string, status: Enquiry['status'], notes?: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status, notes })
  });
  await handleResponse(res);
};

export const deleteEnquiry = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addUser = async (user: User): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(user)
  });
  await handleResponse(res);
};

export const deleteUser = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

export const updateUser = async (user: User): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(user)
  });
  await handleResponse(res);
};

// Current Session User (session storage is used to clear session client-side on tab close)
export const getSessionUser = (): User | null => {
  const user = sessionStorage.getItem('jk_infra_logged_user');
  return user ? JSON.parse(user) : null;
};

export const setSessionUser = (user: User | null): void => {
  if (user) {
    sessionStorage.setItem('jk_infra_logged_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('jk_infra_logged_user');
    sessionStorage.removeItem('jk_infra_logged_user_token');
  }
};

// Careers / Job Applications
export const getApplications = async (): Promise<JobApplication[]> => {
  const res = await fetch(`${API_BASE_URL}/careers/applications`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const addApplication = async (app: JobApplication): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/careers/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(app)
  });
  await handleResponse(res);
};

export const updateApplicationStatus = async (id: string, status: JobApplication['status']): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/careers/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status })
  });
  await handleResponse(res);
};

export const deleteApplication = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/careers/applications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

// Cities Master
export const getCities = async (): Promise<City[]> => {
  const res = await fetch(`${API_BASE_URL}/masters/cities`);
  return handleResponse(res);
};

export const addCity = async (city: City): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/masters/cities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(city)
  });
  await handleResponse(res);
};

export const deleteCity = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/masters/cities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

// Locations Master
export const getLocations = async (): Promise<LocationMaster[]> => {
  const res = await fetch(`${API_BASE_URL}/masters/locations`);
  return handleResponse(res);
};

export const addLocation = async (loc: LocationMaster): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/masters/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(loc)
  });
  await handleResponse(res);
};

export const deleteLocation = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/masters/locations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
};

// User Authentication
export const loginUser = async (username: string, password: User['password']): Promise<User> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Login failed');
  }
  if (json.token) {
    sessionStorage.setItem('jk_infra_logged_user_token', json.token);
  }
  return json.user;
};

// Image Uploads
export const uploadImage = async (file: File, module: string = 'others'): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE_URL}/upload?module=${encodeURIComponent(module)}`, {
    method: 'POST',
    body: formData
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Image upload failed');
  }
  return json.url;
};

export const uploadMultipleImages = async (files: FileList | File[], module: string = 'others'): Promise<string[]> => {
  const formData = new FormData();
  const fileArray = files instanceof FileList ? Array.from(files) : files;
  fileArray.forEach((file) => {
    formData.append('images', file);
  });

  const res = await fetch(`${API_BASE_URL}/upload/multiple?module=${encodeURIComponent(module)}`, {
    method: 'POST',
    body: formData
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Images upload failed');
  }
  return json.urls;
};

export const logoutUser = async (username: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ username })
  });
  await handleResponse(res);
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const session = sessionStorage.getItem('jk_infra_logged_user');
    if (session) {
      try {
        const user = JSON.parse(session);
        if (user && user.username) {
          const blob = new Blob([JSON.stringify({ username: user.username })], { type: 'application/json' });
          navigator.sendBeacon(`${API_BASE_URL}/auth/logout`, blob);
        }
      } catch (e) {
        // Ignore
      }
    }
  });
}
