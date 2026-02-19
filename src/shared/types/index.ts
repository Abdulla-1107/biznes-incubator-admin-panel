export interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = "NEW" | "REVIEWING" | "ACCEPTED" | "REJECTED";

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  NEW: "Yangi",
  REVIEWING: "Ko'rib chiqilmoqda",
  ACCEPTED: "Qabul qilindi",
  REJECTED: "Rad etildi",
};

export const applicationStatusColors: Record<ApplicationStatus, string> = {
  NEW: "info",
  REVIEWING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
};

export interface Service {
  id: string;
  titleUz: string;
  titleEn?: string;
  titleRu?: string;
  descriptionUz: string;
  descriptionEn?: string;
  descriptionRu?: string;
  price?: number;
  category: ServiceCategory;
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategory = "DESIGN" | "DEVELOPMENT" | "MARKETING" | "CONSULTING" | "OTHER";

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  DESIGN: "Dizayn",
  DEVELOPMENT: "Dasturlash",
  MARKETING: "Marketing",
  CONSULTING: "Konsalting",
  OTHER: "Boshqa",
};

export interface Partner {
  id: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  type: PartnerType;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export type PartnerType = "STRATEGIC" | "TECHNOLOGY" | "MEDIA" | "INVESTOR" | "OTHER";

export const partnerTypeLabels: Record<PartnerType, string> = {
  STRATEGIC: "Strategik",
  TECHNOLOGY: "Texnologik",
  MEDIA: "Media",
  INVESTOR: "Investor",
  OTHER: "Boshqa",
};

export interface Mentor {
  id: string;
  fullName: string;
  bio?: string;
  specialization: string;
  experienceYears: number;
  avatar?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Startup {
  id: string;
  name: string;
  description?: string;
  stage: StartupStage;
  industry: string;
  investment?: number;
  foundedYear?: number;
  logo?: string;
  pitchDeck?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export type StartupStage = "IDEA" | "MVP" | "GROWTH" | "SCALE" | "MATURE";

export const startupStageLabels: Record<StartupStage, string> = {
  IDEA: "G'oya",
  MVP: "MVP",
  GROWTH: "O'sish",
  SCALE: "Masshtablash",
  MATURE: "Yetuk",
};

export interface Event {
  id: string;
  titleUz: string;
  titleEn?: string;
  titleRu?: string;
  descriptionUz?: string;
  date: string;
  endDate?: string;
  format: EventFormat;
  category: EventCategory;
  maxParticipants?: number;
  isFree: boolean;
  registrationDeadline?: string;
  coverImage?: string;
  isActive: boolean;
  createdAt: string;
}

export type EventFormat = "ONLINE" | "OFFLINE" | "HYBRID";
export type EventCategory = "WORKSHOP" | "SEMINAR" | "CONFERENCE" | "MEETUP" | "HACKATHON";

export const eventFormatLabels: Record<EventFormat, string> = {
  ONLINE: "Onlayn",
  OFFLINE: "Oflayn",
  HYBRID: "Gibrid",
};

export const eventCategoryLabels: Record<EventCategory, string> = {
  WORKSHOP: "Ustaxona",
  SEMINAR: "Seminar",
  CONFERENCE: "Konferensiya",
  MEETUP: "Uchrashuv",
  HACKATHON: "Xakaton",
};

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";

export const contactStatusLabels: Record<ContactStatus, string> = {
  NEW: "Yangi",
  IN_PROGRESS: "Jarayonda",
  RESOLVED: "Hal qilindi",
  ARCHIVED: "Arxivlangan",
};

export const contactStatusColors: Record<ContactStatus, string> = {
  NEW: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  ARCHIVED: "muted",
};

export interface DashboardStats {
  totalStartups: number;
  totalMentors: number;
  totalServices: number;
  totalEvents: number;
  newApplications: number;
  newContacts: number;
}
