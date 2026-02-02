
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
  order: number; // 전시 순서 (낮을수록 앞에 노출)
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

export interface AppData {
  projects: Project[];
  inquiries: Inquiry[];
}
