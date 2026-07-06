export type ProjectCategory = 'Flats' | 'Villas' | 'Individual Houses' | 'Sites' | 'Duplex';

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
  subCategory?: string; // Relevant when category is 'Sites' or residential properties
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
  uds?: string;
  width?: string;
  length?: string;
  classification?: string;
  isActive?: boolean;
  remarks?: string;
  marketingResult?: string;
  isMarketing?: boolean;
  agentId?: string;
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
  role: 'Admin' | 'Moderator' | 'ProjectOwner' | 'MarketingOwner' | 'Architecture' | 'MarketingAgent';
  name: string;
  email: string;
  password?: string;
  allowedScreens?: string[];
  agentId?: string;
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

export interface PropertyType {
  id: string;
  name: string;
}

export interface Facing {
  id: string;
  name: string;
}

export interface Amenity {
  id: string;
  name: string;
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

export interface Document {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileType: string;
  projectAssociation?: string;
  uploadedBy?: string;
  date: string;
}

export interface SiteVisit {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectAssociation: string;
  projectName: string;
  visitDate: string;
  visitTime: string;
  emailStatus: 'Pending' | 'Sent' | 'Failed' | 'Skipped';
  emailSentDate?: string;
  assignedAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MailConfig {
  id: string;
  deliveryMode: 'smtp' | 'simulation';
  triggerWindowDays: number;
  sendBeforeDays: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  senderEmail: string;
  summaryEmail: string;
  emailSubject: string;
  emailTemplate: string;
  // SMS Integration
  smsProvider: string;
  smsApiKey: string;
  smsSenderId: string;
  smsEnabled: boolean;
  // WhatsApp Integration
  whatsappToken: string;
  whatsappPhoneId: string;
  whatsappEnabled: boolean;
  // Database Connection cache
  dbType: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword?: string;
  dbName: string;
  // JWT
  jwtSecret: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketingAgent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  designation?: string;
  photoUrl?: string;
  status: string; // 'Active' | 'Inactive'
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseLineItem {
  item: string;
  qty: number;
  priceUnit: number;
  taxLabel: string;
  taxPct: number;
  amount: number;
}

export interface Expense {
  id: string;
  party: string;
  location?: string;
  apartment?: string;
  projectName?: string;
  expenseCategory: string;
  expenseNo?: string;
  billDate: string;
  stateOfSupply?: string;
  lineItems: ExpenseLineItem[];
  paymentType?: string;
  referenceNo?: string;
  roundOff: boolean;
  gstEnabled?: boolean;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
