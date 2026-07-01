export type ProjectCategory = 'Flats' | 'Villas' | 'Individual Houses' | 'Sites';

export type SiteCategory = 'Development Sites' | 'Panchayati Approved Sites' | 'VUDA Approved Sites' | 'Ventures';

export type ProjectStatus = 'Ongoing' | 'Upcoming' | 'Completed';

export type GalleryCategory = 'Project Photos' | 'Project Videos' | 'Event Photos' | 'Construction Progress Updates';

export type BlogCategory = 'Real Estate News' | 'Property Updates' | 'Investment Guides' | 'Company News';

export type EnquiryStatus = 'New' | 'In Progress' | 'Completed';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  desc: string;
}

export interface FloorPlan {
  id: string;
  title: string;
  image: string;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  subCategory?: SiteCategory; // Relevant when category is 'Sites'
  status: ProjectStatus;
  location: string;
  description: string;
  images: string[];
  videos?: string[];
  highlights: string[];
  timeline: TimelineEvent[];
  amenities: string[];
  floorPlans: FloorPlan[];
  priceRange: string;
  priceValue: number; // For sorting and filtering
  paymentPlans: string[];
  mapCoordinates: {
    lat: number;
    lng: number;
  };
  brochureUrl: string;
  featured: boolean;
  
  // New fields for Honeyy-style checkbox filters and spec layouts
  facing?: string;
  city?: string;
  microLocation?: string;
  floors?: number;
  unitsCount?: number;
  availabilityDetails?: string;
  specImage?: string;
}


export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: BlogCategory;
  image: string;
  date: string;
  author: string;
  tags: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  projectAssociation?: string; // Project ID
  date: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  projectAssociation?: string; // Project ID or "General"
  projectName?: string; // Cached project name
  date: string;
  status: EnquiryStatus;
  notes?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Moderator' | 'ProjectOwner' | 'MarketingOwner';
  name: string;
  email: string;
  password?: string;
  allowedScreens?: string[];
}

export interface City {
  id: string;
  name: string;
}

export interface LocationMaster {
  id: string;
  name: string;
  cityId: string;
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  coverLetter?: string;
  status: 'Pending' | 'Interview Scheduled' | 'Shortlisted' | 'Rejected';
  date: string;
}
