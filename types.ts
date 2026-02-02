
export interface Project {
  id: string;
  title: string;
  category: 'Apartment' | 'Villa' | 'Commercial' | 'Office';
  location: string;
  area: string;
  description: string;
  mainImage: string;
  gallery: string[];
  createdAt: number;
  status: 'draft' | 'published';
  order: number;
}

export interface Inquiry {
  id: string;
  projectId?: string;
  projectTitle?: string;
  name: string;
  phone: string;
  message: string;
  budget?: string;
  desiredDate?: string;
  category?: string;
  createdAt: number;
}

export interface GithubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface AppData {
  projects: Project[];
  inquiries: Inquiry[];
  githubConfig?: GithubConfig;
}
