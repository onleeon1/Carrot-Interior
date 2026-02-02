
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Inquiry, AppData } from './types.ts';
import { INITIAL_PROJECTS } from './constants.tsx';
import { Layout } from './components/Layout.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { X, Loader2, Phone, User, MessageSquare, Send, Lock, ChevronRight, ArrowRight, Layout as LayoutIcon, Calendar, Wallet, Home, AlertCircle, MapPin, Maximize, ArrowLeft, ZoomIn } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ projects: [], inquiries: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isProtocolError, setIsProtocolError] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // 뷰 제어 상태
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState('전체');
  
  const [inquiryInput, setInquiryInput] = useState({ 
    name: '', 
    phone: '', 
    message: '', 
    budget: '', 
    desiredDate: '', 
    category: 'Apartment' 
  });

  useEffect(() => {
    if (window.location.protocol === 'file:') {
      setIsProtocolError(true);
    }
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isProtocolError) {
      setData({ projects: INITIAL_PROJECTS, inquiries: [] });
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const response = await fetch('./api.php', { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        if (!text) throw new Error('Empty response from server');
        const result = JSON.parse(text);
        if (result && typeof result === 'object' && Array.isArray(result.projects)) {
          if (result.projects.length === 0 && INITIAL_PROJECTS.length > 0) {
            const initialData: AppData = { projects: INITIAL_PROJECTS, inquiries: [] };
            setData(initialData);
            saveDataToServer(initialData);
          } else {
            setData(result);
          }
        } else {
          setData({ projects: INITIAL_PROJECTS, inquiries: [] });
        }
      } catch (e) {
        console.error("PHP 서버 연결 실패:", e);
        setData({ projects: INITIAL_PROJECTS, inquiries: [] });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isProtocolError]);

  const saveDataToServer = async (newData: AppData) => {
    if (isProtocolError) return;
    try {
      const response = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      const resData = await response.json();
      if (!resData.success) alert("데이터 저장 실패: " + (resData.error || "권한 확인 필요"));
    } catch (e) {
      console.error("통신 오류:", e);
    }
  };

  const handleAdminClick = () => {
    if (isLoggedIn) setIsAdminOpen(true);
    else setShowLoginModal(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'catcat123') {
      setIsLoggedIn(true);
      setIsAdminOpen(true);
      setShowLoginModal(false);
      setPasswordInput('');
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setPasswordInput('');
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInquiry: Inquiry = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: selectedProject?.id,
      projectTitle: selectedProject ? selectedProject.title : '전역 상담 신청',
      name: inquiryInput.name,
      phone: inquiryInput.phone,
      message: inquiryInput.message,
      budget: inquiryInput.budget,
      desiredDate: inquiryInput.desiredDate,
      category: inquiryInput.category,
      createdAt: Date.now(),
    };
    const newData = { ...data, inquiries: [newInquiry, ...data.inquiries] };
    setData(newData);
    saveDataToServer(newData);
    
    alert('상담 신청이 완료되었습니다!');
    setShowInquiryForm(false);
    setIsDetailOpen(false);
    setSelectedProject(null);
    setInquiryInput({ name: '', phone: '', message: '', budget: '', desiredDate: '', category: 'Apartment' });
  };

  const openProjectDetail = (p: Project) => {
    setSelectedProject(p);
    setIsDetailOpen(true);
    setShowInquiryForm(false);
  };

  const openGlobalInquiry = () => {
    setSelectedProject(null);
    setShowInquiryForm(true);
    setIsDetailOpen(false);
  };

  const filteredProjects = useMemo(() => {
    const published = data.projects.filter(p => p.status === 'published');
    if (activeCategory === '전체') return published;
    const catMap: Record<string, string> = { '아파트': 'Apartment', '빌라': 'Villa', '상가': 'Commercial', '오피스': 'Office' };
    return published.filter(p => p.category === catMap[activeCategory]);
  }, [data.projects, activeCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#ff8a3d] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">포트폴리오를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-gray-900">
      {isProtocolError && (
        <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold sticky top-0 z-[200]">
          <AlertCircle size={16} />
          주의: 현재 서버 없이 파일을 직접 열었습니다. 미리보기는 가능하나 데이터 저장 및 관리는 작동하지 않습니다. (PHP 서버 필요)
        </div>
      )}
      
      <Layout onAdminClick={handleAdminClick} onInquiryClick={openGlobalInquiry}>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white pb-20 pt-16 sm:pb-32 sm:pt-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl leading-[1.2]">
                공간에 가치를 더하는 <br />
                <span className="text-[#ff8a3d]">하이엔드 인테리어</span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-700 font-medium">
                당근 인테리어만의 감각과 따뜻함을 담았습니다.<br />
                차별화된 자재와 정교한 마감으로 당신만의 특별한 공간을 제안합니다.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <button 
                  onClick={() => document.getElementById('portfolio-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-2xl bg-[#ff8a3d] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  시공 사례 확인하기 <ChevronRight size={20} />
                </button>
                <button 
                  onClick={openGlobalInquiry}
                  className="text-lg font-bold text-gray-900 flex items-center gap-2 group"
                >
                  무료 견적 신청 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div id="portfolio-grid" className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <h3 className="text-3xl font-black text-gray-900">Portfolio</h3>
            <div className="flex flex-wrap gap-2">
               {['전체', '아파트', '빌라', '상가', '오피스'].map(cat => (
                 <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${activeCategory === cat ? 'bg-[#ff8a3d] border-[#ff8a3d] text-white shadow-md' : 'border-gray-200 text-gray-500 bg-white hover:border-[#ff8a3d] hover:text-[#ff8a3d]'}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProjects.map((p) => (
              <div 
                key={p.id} 
                className="group cursor-pointer bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-50"
                onClick={() => openProjectDetail(p)}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={p.mainImage || 'https://picsum.photos/800/600'} 
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <span className="text-white font-bold text-lg flex items-center gap-2">상세 보기 <ChevronRight size={18} /></span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-[#ff8a3d] px-3 py-1 bg-orange-50 rounded-full uppercase tracking-widest">{p.category}</span>
                    <span className="text-xs text-gray-400 font-bold">{p.area}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#ff8a3d] transition-colors line-clamp-1 mb-2">{p.title}</h4>
                  <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed font-medium">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>

      {/* Project Detail Modal */}
      {isDetailOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-0 md:p-8" onClick={() => setIsDetailOpen(false)}>
          <div className="bg-white w-full max-w-5xl h-full md:max-h-[95vh] md:rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
              <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 shadow-xl pointer-events-auto hover:scale-110 transition-transform">
                <ArrowLeft size={24} />
              </button>
              <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 shadow-xl pointer-events-auto hover:scale-110 transition-transform">
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto scroll-smooth">
              {/* Hero Image */}
              <div 
                className="relative h-[50vh] md:h-[60vh] overflow-hidden cursor-zoom-in group/hero"
                onClick={() => setEnlargedImage(selectedProject.mainImage)}
              >
                <img src={selectedProject.mainImage} alt={selectedProject.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/hero:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#ff8a3d] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{selectedProject.category}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-3xl">
                    {selectedProject.title}
                  </h2>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity">
                   <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white">
                     <ZoomIn size={32} />
                   </div>
                </div>
              </div>

              {/* Content */}
              <div className="max-w-4xl mx-auto px-8 py-16">
                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-16 border-b border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                    <p className="font-bold text-gray-900 flex items-center gap-1"><MapPin size={14} className="text-[#ff8a3d]" /> {selectedProject.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Area</p>
                    <p className="font-bold text-gray-900 flex items-center gap-1"><Maximize size={14} className="text-[#ff8a3d]" /> {selectedProject.area}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                    <p className="font-bold text-gray-900">{new Date(selectedProject.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Style</p>
                    <p className="font-bold text-gray-900">High-End Modern</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-20">
                  <p className="text-lg md:text-xl text-gray-700 leading-[1.8] whitespace-pre-wrap font-medium">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Gallery */}
                <div className="space-y-10">
                   <h3 className="text-2xl font-black text-gray-900 mb-8">Detailed Gallery</h3>
                   <div className="grid grid-cols-1 gap-10">
                     {selectedProject.gallery.map((img, idx) => (
                       <div 
                        key={idx} 
                        className="group overflow-hidden rounded-[32px] bg-gray-50 cursor-zoom-in relative"
                        onClick={() => setEnlargedImage(img)}
                       >
                         <img src={img} alt={`Gallery ${idx}`} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ZoomIn size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Call to Action */}
                <div className="mt-24 p-10 md:p-16 bg-[#ffefe5] rounded-[48px] text-center">
                   <div className="text-4xl mb-6">🥕</div>
                   <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                     이런 스타일의 공간을 원하시나요?
                   </h3>
                   <p className="text-gray-600 font-bold mb-10 max-w-md mx-auto">
                     [ {selectedProject.title} ] 디자인을 바탕으로 당신만의 특별한 공간 견적을 제안해 드립니다.
                   </p>
                   <button 
                     onClick={() => setShowInquiryForm(true)}
                     className="px-12 py-5 bg-[#ff8a3d] text-white rounded-2xl font-black text-xl shadow-xl shadow-orange-200 hover:scale-105 transition-transform"
                   >
                     이 스타일로 상담 신청하기
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal (Lightbox) */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setEnlargedImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            onClick={() => setEnlargedImage(null)}
          >
            <X size={40} />
          </button>
          <img 
            src={enlargedImage} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
            alt="확대 이미지"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInquiryForm(false)}>
          <div className="bg-white w-full max-w-2xl h-full max-h-[85vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowInquiryForm(false)} className="absolute top-8 right-8 z-10 p-3 bg-white/80 rounded-full text-gray-500 hover:text-gray-900 transition-all shadow-md"><X size={24} /></button>
            <div className="flex-grow overflow-y-auto p-10 md:p-16">
              <div className="text-center mb-10">
                <div className="text-4xl mb-4">🥕</div>
                <h2 className="text-3xl font-black mb-2">{selectedProject ? '시공 상담 신청' : '인테리어 상담 신청'}</h2>
                <p className="text-gray-500 font-bold">{selectedProject ? `[${selectedProject.title}] 관련 문의` : '당근 인테리어가 당신의 공간을 디자인합니다.'}</p>
              </div>
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase pl-1">성함</label>
                    <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="성함" value={inquiryInput.name} onChange={e => setInquiryInput({...inquiryInput, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase pl-1">연락처</label>
                    <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="연락처" value={inquiryInput.phone} onChange={e => setInquiryInput({...inquiryInput, phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase pl-1">공간 유형</label>
                    <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ff8a3d]" value={inquiryInput.category} onChange={e => setInquiryInput({...inquiryInput, category: e.target.value})}>
                      <option value="Apartment">아파트</option><option value="Villa">빌라/주택</option><option value="Commercial">상가</option><option value="Office">오피스</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase pl-1">시공 희망일</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="예: 12월 말" value={inquiryInput.desiredDate} onChange={e => setInquiryInput({...inquiryInput, desiredDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase pl-1">예상 예산</label>
                  <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="예: 3,000만원 내외" value={inquiryInput.budget} onChange={e => setInquiryInput({...inquiryInput, budget: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase pl-1">문의 상세 내용</label>
                  <textarea className="w-full p-4 h-32 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 resize-none outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="궁금하신 점을 남겨주세요." value={inquiryInput.message} onChange={e => setInquiryInput({...inquiryInput, message: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-5 bg-[#ff8a3d] text-white rounded-2xl font-black text-xl hover:bg-[#e67e35] shadow-xl transition-all active:scale-95">상담 신청하기</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin, Login Panels */}
      {isAdminOpen && (
        <AdminPanel 
          projects={data.projects} inquiries={data.inquiries} 
          onAdd={p => { const n = { ...data, projects: [p, ...data.projects] }; setData(n); saveDataToServer(n); }}
          onUpdate={p => { const n = { ...data, projects: data.projects.map(pj => pj.id === p.id ? p : pj) }; setData(n); saveDataToServer(n); }}
          onDelete={id => { const n = { ...data, projects: data.projects.filter(p => p.id !== id) }; setData(n); saveDataToServer(n); }}
          onImport={ps => { const n = { ...data, projects: ps }; setData(n); saveDataToServer(n); }}
          onDeleteInquiry={id => { const n = { ...data, inquiries: data.inquiries.filter(i => i.id !== id) }; setData(n); saveDataToServer(n); }}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">관리자 로그인</h3>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input autoFocus type="password" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-gray-900 text-center" placeholder="비밀번호" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
              <button type="submit" className="w-full py-4 bg-[#ff8a3d] text-white rounded-2xl font-black shadow-lg">접속</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full py-2 text-gray-400 font-bold text-sm">취소</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
