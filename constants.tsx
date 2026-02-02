
import { Project } from './types';

export const COLORS = {
  primary: '#ff8a3d', // Karrot Orange
  secondary: '#ffefe5',
  text: '#212529',
  muted: '#868e96',
  border: '#e9ecef'
};

export const CATEGORIES = ['Apartment', 'Villa', 'Commercial', 'Office'] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  'Apartment': '아파트',
  'Villa': '빌라/주택',
  'Commercial': '상가',
  'Office': '오피스'
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'karrot-1',
    title: '대치 푸르지오 써밋 - 프리미엄 모던 하우스',
    category: 'Apartment',
    location: '서울시 강남구 대치동',
    area: '45평 (148㎡)',
    description: '당근 인테리어의 정체성이 담긴 하이엔드 주거 프로젝트입니다. \n\n전체적으로 화이트 베이스에 직선적인 라인 조명을 활용하여 공간의 확장감을 주었으며, 거실 아트월에는 천연 대리석을 시공하여 고급스러움을 더했습니다. \n\n주방은 대형 아일랜드 식탁을 중심으로 대면형 구조를 채택하여 가족 간의 소통을 강조했습니다. 침실은 조도를 낮춘 간접 조명 설계로 아늑한 휴식 공간을 완성했습니다.',
    mainImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1600607687940-4e524cb35a36?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 1000000,
    status: 'published',
    order: 1
  }
];
