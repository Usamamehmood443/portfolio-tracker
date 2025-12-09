// Project type with all relations
export interface ProjectWithRelations {
  id: string;
  projectTitle: string;
  clientName: string;
  projectSource: string;
  projectUrl: string | null;
  category: string;
  shortDescription: string;
  platform: string;
  status: string;
  proposedBudget: number | null;
  finalizedBudget: number | null;
  estimatedDuration: string;
  deliveredDuration: string | null;
  startDate: string;
  endDate: string | null;
  tagline: string | null;
  proposal: string | null;
  createdAt: string;
  updatedAt: string;
  features: string[];
  developers: string[];
  screenshots: ScreenshotData[];
  video: VideoData | null;
}

export interface ScreenshotData {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface VideoData {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

// Form data types
export interface ProjectFormData {
  projectTitle: string;
  clientName: string;
  projectSource: string;
  projectUrl?: string;
  category: string;
  shortDescription: string;
  platform: string;
  status: string;
  proposedBudget?: number;
  finalizedBudget?: number;
  estimatedDuration: string;
  deliveredDuration?: string;
  startDate: string;
  endDate?: string;
  tagline?: string;
  proposal?: string;
  features: string[];
  developers: string[];
  screenshots?: File[];
  video?: File;
}

// Dropdown option types
export interface DropdownOption {
  id: string;
  name: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileUploadResponse {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
