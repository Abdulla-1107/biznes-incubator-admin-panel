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

export type ServiceCategory =
  | "BUSINESS_MODEL"
  | "LAUNCH"
  | "TECHNICAL"
  | "MARKETING_SALES"
  | "EDUCATION"
  | "INVESTMENT";

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  BUSINESS_MODEL: "Biznes modeli",
  LAUNCH: "Loyihani ishga tushirish",
  TECHNICAL: "Texnik",
  MARKETING_SALES: "Marketing & Savdo",
  EDUCATION: "Ta’lim",
  INVESTMENT: "Investitsiya",
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

export type PartnerType =
  | "STRATEGIC"
  | "TECHNOLOGY"
  | "MEDIA"
  | "INVESTOR"
  | "OTHER";

export const partnerTypeLabels: Record<PartnerType, string> = {
  STRATEGIC: "Strategik",
  TECHNOLOGY: "Texnologik",
  MEDIA: "Media",
  INVESTOR: "Investor",
  OTHER: "Boshqa",
};

export type MentorSpecialization =
  | "BUSINESS"
  | "TECHNOLOGY"
  | "MARKETING"
  | "FINANCE"
  | "LEGAL"
  | "DESIGN"
  | "HR"
  | "OTHER";

export interface Mentor {
  id: string;
  fullName: string;
  bio?: string;
  specialization: MentorSpecialization;
  experienceYears: number;
  photoUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export const mentorSpecializationLabels: Record<MentorSpecialization, string> =
  {
    BUSINESS: "Biznes",
    TECHNOLOGY: "Texnologiya",
    MARKETING: "Marketing",
    FINANCE: "Moliya",
    LEGAL: "Huquq",
    DESIGN: "Dizayn",
    HR: "HR",
    OTHER: "Boshqa",
  };
export type StartupStage = "IDEA" | "MVP" | "EARLY" | "GROWTH" | "SCALE";

export type StartupIndustry =
  | "FINTECH"
  | "EDTECH"
  | "HEALTHTECH"
  | "AGRITECH"
  | "ECOMMERCE"
  | "LOGISTICS"
  | "AI_ML"
  | "SAAS"
  | "OTHER";

export const startupStageLabels: Record<StartupStage, string> = {
  IDEA: "G'oya",
  MVP: "MVP",
  EARLY: "Erta bosqich",
  GROWTH: "O'sish",
  SCALE: "Kengayish",
};

export const startupIndustryLabels: Record<StartupIndustry, string> = {
  FINTECH: "Fintech",
  EDTECH: "Edtech",
  HEALTHTECH: "HealthTech",
  AGRITECH: "AgriTech",
  ECOMMERCE: "Ecommerce",
  LOGISTICS: "Logistika",
  AI_ML: "AI / ML",
  SAAS: "SaaS",
  OTHER: "Boshqa",
};

export interface Startup {
  id: string;

  stage?: StartupStage;
  industry?: StartupIndustry;

  nameUz: string;
  nameEn: string;
  nameRu: string;

  descriptionUz: string;
  descriptionEn: string;
  descriptionRu: string;
  
  logoUrl?: string;
  websiteUrl?: string;
  pitchDeck?: string;

  founderName?: string;
  founderEmail?: string;

  teamSize?: number;
  foundedYear?: number;
  investmentRaised?: number;

  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;

  createdAt: string;
  updatedAt: string;
}
export type EventFormat = "ONLINE" | "OFFLINE" | "HYBRID";
export type EventCategory =
  | "WORKSHOP"
  | "SEMINAR"
  | "CONFERENCE"
  | "MEETUP"
  | "HACKATHON";

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
