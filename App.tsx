
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Inquiry, AppData } from './types.ts';
import { INITIAL_PROJECTS } from './constants.tsx';
import { Layout } from './components/Layout.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { X, Loader2, Phone, User, MessageSquare, Send, Lock, ChevronRight, ArrowRight, Layout as LayoutIcon, Calendar, Wallet, Home, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ projects: [], inquiries: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isProtocolError, setIsProtocolError] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState('전체');
  
  const [showGlobalInquiry, setShowGlobalInquiry] = useState(false);
  const [inquiryInput, setInquiryInput] = useState({ 
    name: '', 
    phone: '', 
    message: '', 
    budget: '', 
    desiredDate: '', 
    category: 'Apartment' 
  });

  useEffect(() => {
    // file:/// 프로토콜 체크 (서버 없이 직접 연 경우)
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
        console.error("PHP 서버 연결 실패 또는 데이터 파싱 에러:", e);
        setData({ projects: INITIAL_PROJECTS, inquiries: [] });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isProtocolError]);

  const saveDataToServer = async (newData: AppData) => {
    if (isProtocolError) {
      alert("현재 '파일 직접 열기(file:///)' 모드입니다. PHP 서버가 없어 데이터가 저장되지 않습니다.");
      return;
    }

    try {
      const response = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      const resData = await response.json();
      if (!resData.success) {
        alert("데이터 저장 실패: " + (resData.error || "서버 권한을 확인하세요."));
      }
    } catch (e) {
      console.error("통신 오류:", e);
      alert("서버와 통신할 수 없습니다. PHP 서버 상태를 확인하세요.");
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
    
    if (!isProtocolError) {
      alert('상담 신청이 완료되었습니다!');
      setShowGlobalInquiry(false);
      setSelectedProject(null);
      setInquiryInput({ name: '', phone: '', message: '', budget: '', desiredDate: '', category: 'Apartment' });
    }
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
          <p className="text-gray-500 font-medium">서버에서 포트폴리오를 불러오는 중...</p>
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
      
      <Layout onAdminClick={handleAdminClick} onInquiryClick={() => setShowGlobalInquiry(true)}>
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
                  onClick={() => setShowGlobalInquiry(true)}
                  className="text-lg font-bold text-gray-900 flex items-center gap-2 group"
                >
                  무료 견적 신청 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

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
                onClick={() => setSelectedProject(p)}
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

      {(showGlobalInquiry || selectedProject) && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowGlobalInquiry(false); setSelectedProject(null); }}>
          <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowGlobalInquiry(false); setSelectedProject(null); }} className="absolute top-8 right-8 z-10 p-3 bg-white/80 rounded-full text-gray-500 hover:text-gray-900 transition-all shadow-md"><X size={24} /></button>
            <div className="flex-grow overflow-y-auto p-10 md:p-16">
              <div className="text-center mb-10">
                <div className="text-4xl mb-4">🥕</div>
                <h2 className="text-3xl font-black mb-2">{selectedProject ? '시공 상담 신청' : '인테리어 상담 신청'}</h2>
                <p className="text-gray-500 font-bold">{selectedProject ? selectedProject.title : '당근 인테리어가 당신의 공간을 디자인합니다.'}</p>
              </div>
              <form onSubmit={handleInquirySubmit} className="max-w-xl mx-auto space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900" placeholder="성함" value={inquiryInput.name} onChange={e => setInquiryInput({...inquiryInput, name: e.target.value})} />
                  <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900" placeholder="연락처" value={inquiryInput.phone} onChange={e => setInquiryInput({...inquiryInput, phone: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900" value={inquiryInput.category} onChange={e => setInquiryInput({...inquiryInput, category: e.target.value})}>
                    <option value="Apartment">아파트</option><option value="Villa">빌라/주택</option><option value="Commercial">상가</option><option value="Office">오피스</option>
                  </select>
                  <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900" placeholder="희망일 (예: 12월 말)" value={inquiryInput.desiredDate} onChange={e => setInquiryInput({...inquiryInput, desiredDate: e.target.value})} />
                </div>
                <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900" placeholder="예산 (예: 3천만원)" value={inquiryInput.budget} onChange={e => setInquiryInput({...inquiryInput, budget: e.target.value})} />
                <textarea className="w-full p-4 h-32 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 resize-none" placeholder="문의 사항" value={inquiryInput.message} onChange={e => setInquiryInput({...inquiryInput, message: e.target.value})} />
                <button type="submit" className="w-full py-5 bg-[#ff8a3d] text-white rounded-2xl font-black text-xl hover:bg-[#e67e35] shadow-xl transition-all active:scale-95">상담 신청하기</button>
              </form>
            </div>
          </div>
        </div>
      )}

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
