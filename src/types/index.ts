// ==================== User & Profile Types ====================

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  skills: string[];
  domains: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  preferences: UserPreferences;
  githubUsername?: string;
  linkedinImported: boolean;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface UserPreferences {
  locations: string[];
  remoteOnly: boolean;
  minimumStipend: number;
  domainsOfInterest: string[];
  hackathonMode?: "solo" | "team" | "both";
}

// ==================== Listing Types ====================

export type ListingType = "internship" | "hackathon";

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  organization: string;
  organizationLogo?: string;
  description: string;
  skillsRequired: string[];
  matchScore: number;
  matchReasons?: string[];
  deadline: string;
  location: string;
  isRemote: boolean;
  locationType: "remote" | "onsite" | "hybrid";
  source: string;
  sourceUrl: string;
  applyUrl: string;
  createdAt: string;
  // Internship-specific
  stipendMin?: number;
  stipendMax?: number;
  duration?: string;
  // Hackathon-specific
  prizePool?: string;
  teamSize?: string;
  hackathonMode?: "solo" | "team" | "both";
}

export type ListingSort = "score" | "recency" | "deadline" | "stipend";
export type LocationFilter = "remote" | "onsite" | "hybrid";
export type DurationFilter = "1-3" | "3-6" | "6+";
export type StatusType = "saved" | "applied" | "interviewing" | "rejected";

export interface ListingFilters {
  type?: LocationFilter[];
  domains?: string[];
  duration?: DurationFilter[];
  stipendMin?: number;
  stipendMax?: number;
  hackathonMode?: "solo" | "team" | "both";
  sources?: string[];
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SavedListing {
  id: string;
  listing: Listing;
  status: StatusType;
  savedAt: string;
  updatedAt: string;
}

// ==================== Interaction Types ====================

export type InteractionAction = "save" | "apply" | "ignore";

export interface InteractionPayload {
  listing_id: string;
  action: InteractionAction;
}

// ==================== API Response Types ====================

export interface ResumeUploadResponse {
  skills: string[];
  domains: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  summary: string;
}

export interface ApiError {
  detail: string;
  status: number;
}
