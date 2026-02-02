
import { Project } from './types';

export const COLORS = {
  primary: '#ff8a3d', // Karrot Orange
  secondary: '#ffefe5',
  text: '#212529',
  muted: '#868e96',
  border: '#e9ecef'
};

export const CATEGORIES = ['Apartment', 'Villa', 'Commercial', 'Office'] as const;

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
    status: 'published'
  },
  {
    id: 'karrot-2',
    title: '한남 더 힐 - 내추럴 우드 리하우스',
    category: 'Apartment',
    location: '서울시 용산구 한남동',
    area: '62평 (205㎡)',
    description: '도시 속의 안식처를 컨셉으로 한 당근 인테리어의 리하우스 프로젝트입니다. \n\n천연 무늬목을 사용하여 벽면을 마감하고, 바닥은 광폭 원목 마루를 시공하여 갤러리 같은 분위기를 연출했습니다. \n\n욕실은 건식 구조를 적용하고 매립 수전을 설치하여 미니멀한 호텔 감성을 담았습니다. 거실 창가에는 윈도우 시트를 제작하여 한남동의 풍경을 즐길 수 있는 특별한 휴식처를 마련했습니다.',
    mainImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 2000000,
    status: 'published'
  },
  {
    id: 'karrot-3',
    title: '청담동 프리미엄 뷰티 라운지',
    category: 'Commercial',
    location: '서울시 강남구 청담동',
    area: '30평 (99㎡)',
    description: '심미적 가치와 기능성을 동시에 고려한 상업 공간 인테리어입니다. \n\n곡선 형태의 가벽과 템바보드 시공을 통해 부드럽고 우아한 무드를 조성했습니다. 각 관리실은 완벽한 방음과 독립된 공조 시스템을 구축하여 프라이빗한 서비스를 제공할 수 있도록 설계했습니다. \n\n입구 로비에는 펜던트 조명과 오브제를 활용하여 방문객들에게 강렬한 첫인상을 남기도록 했습니다.',
    mainImage: 'https://images.unsplash.com/photo-1571340911005-47e066a3628e?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 3000000,
    status: 'published'
  },
  {
    id: 'karrot-4',
    title: '성수동 테크 오피스 리노베이션',
    category: 'Office',
    location: '서울시 성동구 성수동',
    area: '120평 (396㎡)',
    description: '창의적인 아이디어가 샘솟는 오픈형 오피스 공간입니다. \n\n기존의 노출 천장을 살려 층고를 확보하고, 블랙 스틸 프레임과 유리 칸막이를 활용하여 개방적인 사무 환경을 조성했습니다. \n\n중앙에는 카페테리아 겸 라운지를 배치하여 유연한 커뮤니케이션이 가능하도록 했으며, 업무 집중도를 위해 폰 부스와 소규모 회의실을 곳곳에 배치했습니다.',
    mainImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 4000000,
    status: 'published'
  },
  {
    id: 'karrot-5',
    title: '반포 자이 - 미니멀 화이트 주거 인테리어',
    category: 'Apartment',
    location: '서울시 서초구 반포동',
    area: '34평 (112㎡)',
    description: '복잡한 요소들을 제거하고 본질에 집중한 미니멀 인테리어입니다. \n\n무몰딩, 무문선, 무걸레받이 시공을 통해 벽과 문이 하나로 이어지는 깔끔한 마감을 실현했습니다. \n\n거실에서 주방으로 이어지는 라인을 정리하여 30평대 아파트임에도 40평대 이상의 공간감을 확보했습니다. 모든 수납장은 매립형으로 제작하여 시각적 노이즈를 최소화한 힐링 홈입니다.',
    mainImage: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200'
    ],
    createdAt: Date.now() - 5000000,
    status: 'published'
  }
];
