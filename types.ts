
export interface ContactInfo {
  phone: string;
  email: string;
  linkedin: string;
  location: string;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  year?: string;
}

export interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  link?: string;
  image?: string;
}

export interface CertificationItem {
  id?: string;
  title: string;
  issuer: string;
  year?: string;
  link?: string; // URL to the certificate image or verification page
}

export interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  price?: string; // Added for pricing management
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export interface ResumeData {
  name: string;
  title: string;
  summary?: string;
  profileImage?: string;
  contact: ContactInfo;
  skills: string[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  certifications: CertificationItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface PortalMessage {
  id: string;
  userId?: string; // ID of the client involved in the chat
  sender: 'client' | 'admin';
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ClientDocument {
  id: string;
  userId?: string; // Added to identify document owner
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'Submitted' | 'Under Review' | 'Solved';
  description?: string;
  solutionNote?: string;
  solvedFile?: string;
  fileUrl?: string; // For previewing files
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

// New Interface for editable UI labels and configuration
export interface SiteConfig {
  portalWelcomeTitle: string;
  portalWelcomeSubtitle: string;
  uploadCardTitle: string;
  uploadCardHelper: string;
  supportCardTitle: string;
  supportCardText: string;
  notificationUploadSuccess: string;
  notificationMaintenance: string;
}
