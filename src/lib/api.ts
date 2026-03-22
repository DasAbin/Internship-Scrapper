import type {
  ListingFilters,
  ListingSort,
  ListingType,
  ListingsResponse,
  Listing,
  UserProfile,
  ResumeUploadResponse,
  SavedListing,
  InteractionPayload,
  StatusType,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getHeaders(): Promise<HeadersInit> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    const { getIdToken } = await import("./firebase");
    token = await getIdToken();
  }
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function getMultipartHeaders(): Promise<HeadersInit> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    const { getIdToken } = await import("./firebase");
    token = await getIdToken();
  }
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "An unexpected error occurred",
    }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== Listings API ====================

export async function getListings(params: {
  type: ListingType;
  sort?: ListingSort;
  page?: number;
  limit?: number;
  filters?: ListingFilters;
}): Promise<ListingsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("type", params.type);
  if (params.sort) searchParams.set("sort", params.sort);
  searchParams.set("page", String(params.page || 1));
  searchParams.set("limit", String(params.limit || 20));
  if (params.filters) {
    searchParams.set("filters", JSON.stringify(params.filters));
  }
  return apiRequest<ListingsResponse>(`/listings?${searchParams.toString()}`);
}

export async function getListingById(id: string): Promise<Listing> {
  return apiRequest<Listing>(`/listings/${id}`);
}

// ==================== Profile API ====================

export async function uploadResume(
  file: File
): Promise<ResumeUploadResponse> {
  const headers = await getMultipartHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/profile/resume`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Failed to upload resume",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

export async function uploadLinkedIn(file: File): Promise<{ success: boolean }> {
  const headers = await getMultipartHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/profile/linkedin`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload LinkedIn data");
  }

  return response.json();
}

export async function submitGithub(username: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/profile/github", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function getProfile(userId: string): Promise<UserProfile> {
  return apiRequest<UserProfile>(`/profile/${userId}`);
}

export async function updateProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  return apiRequest<UserProfile>(`/profile/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ==================== Interactions API ====================

export async function createInteraction(
  payload: InteractionPayload
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/interactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSavedListings(
  userId: string
): Promise<SavedListing[]> {
  return apiRequest<SavedListing[]>(`/saved/${userId}`);
}

export async function updateSavedStatus(
  userId: string,
  listingId: string,
  status: StatusType
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/saved/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ listing_id: listingId, status }),
  });
}
