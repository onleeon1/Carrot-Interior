
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
}

export interface Inquiry {
  id: string;
  projectId?: string; // 선택사항 (특정 프로젝트 보고 신청 시)
  projectTitle?: string;
  name: string;
  phone: string;
  message: string;
  budget?: string; // 예산 범위
  desiredDate?: string; // 시공 희망일
  category?: string; // 공간 유형
  createdAt: number;
}

export interface AppData {
  projects: Project[];
  inquiries: Inquiry[];
}
