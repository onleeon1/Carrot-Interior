
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Inquiry, AppData, GithubConfig } from './types.ts';
import { INITIAL_PROJECTS } from './constants.tsx';
import { Layout } from './components/Layout.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { X, Loader2, ChevronRight, ArrowRight, AlertCircle, ArrowLeft, Github, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ projects: [], inquiries: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('전체');
  
  const [inquiryInput, setInquiryInput] = useState({ 
    name: '', phone: '', message: '', budget: '', desiredDate: '', category: 'Apartment' 
  });

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsLoggedIn(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 캐시 방지를 위해 타임스탬프 추가 및 no-cache 헤더 설정
      const response = await fetch(`./data.json?v=${Date.now()}`, { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) throw new Error('데이터 파일을 찾을 수 없습니다.');
      
      const result = await response.json();
      if (result && Array.isArray(result.projects)) {
        setData(result);
      }
    } catch (e) {
      console.warn("저장소에 data.json이 없거나 로드에 실패하여 기본 데이터를 사용합니다.");
      setData({ projects: INITIAL_PROJECTS, inquiries: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // 대용량 유니코드 문자열(이미지 포함 JSON)을 안전하게 Base64로 인코딩하는 함수
  const safeBtoa = (str: string) => {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (e) {
      console.error("인코딩 오류:", e);
      return btoa(str);
    }
  };

  const saveToGithub = async (newData: AppData, config: GithubConfig) => {
    if (!config.token || !config.owner || !config.repo) {
      alert("GitHub 설정을 먼저 완료해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. 현재 파일의 SHA 가져오기
      const getRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/data.json?ref=${config.branch}`, {
        headers: { 
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      let sha = "";
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 2. 데이터 인코딩 및 전송
      const jsonString = JSON.stringify(newData, null, 2);
      const content = safeBtoa(jsonString);

      const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/data.json`, {
        method: 'PUT',
        headers: { 
          'Authorization': `token ${config.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: 'Update Portfolio: ' + new Date().toLocaleString() + ' 🥕',
          content: content,
          sha: sha || undefined,
          branch: config.branch
        })
      });

      if (putRes.ok) {
        alert("🎉 배포 완료! 1~2분 뒤 사이트에 반영됩니다. (저장소의 data.json이 업데이트되었습니다)");
        setData(newData);
      } else {
        const err = await putRes.json();
        throw new Error(err.message || "GitHub API 전송 실패");
      }
    } catch (e: any) {
      alert("배포 중 오류: " + e.message);
      console.error(e);
    } finally {
      setIsSaving(false);
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
      projectTitle: selectedProject ? selectedProject.title : '일반 상담',
      name: inquiryInput.name,
      phone: inquiryInput.phone,
      message: inquiryInput.message,
      createdAt: Date.now(),
    };
    const newData = { ...data, inquiries: [newInquiry, ...data.inquiries] };
    setData(newData);
    alert('상담 내역이 임시 저장되었습니다. 관리자 페이지에서 [GitHub에 배포]를 눌러야 최종 저장됩니다.');
    setShowInquiryForm(false);
  };

  const sortedProjects = useMemo(() => {
    return [...data.projects].sort((a, b) => a.order - b.order);
  }, [data.projects]);

  const filteredProjects = useMemo(() => {
    const published = sortedProjects.filter(p => p.status === 'published');
    if (activeCategory === '전체') return published;
    const catMap: Record<string, string> = { '아파트': 'Apartment', '빌라': 'Villa', '상가': 'Commercial', '오피스': 'Office' };
    return published.filter(p => p.category === catMap[activeCategory]);
  }, [sortedProjects, activeCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#ff8a3d] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold">포트폴리오 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-gray-900">
      <Layout onAdminClick={handleAdminClick} onInquiryClick={() => { setSelectedProject(null); setShowInquiryForm(true); }}>
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
                onClick={() => { setSelectedProject(p); setIsDetailOpen(true); }}
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

      {isAdminOpen && (
        <AdminPanel 
          projects={sortedProjects} 
          inquiries={data.inquiries} 
          isSaving={isSaving}
          onSaveAll={(newData, githubConfig) => saveToGithub(newData, githubConfig)}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Project Detail Modal */}
      {isDetailOpen && selectedProject && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-0 md:p-8" onClick={() => setIsDetailOpen(false)}>
           <div className="bg-white w-full max-w-5xl h-full md:max-h-[95vh] md:rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col animate-in slide-in-from-bottom duration-500" onClick={e => e.stopPropagation()}>
             <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
                <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 shadow-xl pointer-events-auto hover:scale-110 transition-transform"><ArrowLeft size={24} /></button>
                <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 shadow-xl pointer-events-auto hover:scale-110 transition-transform"><X size={24} /></button>
             </div>
             <div className="flex-grow overflow-y-auto scroll-smooth">
               <div className="h-[50vh] md:h-[60vh] relative group cursor-zoom-in" onClick={() => setEnlargedImage(selectedProject.mainImage)}>
                 <img src={selectedProject.mainImage} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex flex-col justify-end p-8 md:p-16">
                   <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">{selectedProject.title}</h2>
                 </div>
               </div>
               <div className="max-w-4xl mx-auto px-8 py-16">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-16 border-b border-gray-100">
                    <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p><p className="font-bold text-gray-900">{selectedProject.location}</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Area</p><p className="font-bold text-gray-900">{selectedProject.area}</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</p><p className="font-bold text-gray-900">{selectedProject.category}</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p><p className="font-bold text-gray-900">{new Date(selectedProject.createdAt).toLocaleDateString()}</p></div>
                  </div>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed whitespace-pre-wrap mb-20 font-medium">{selectedProject.description}</p>
                  <div className="grid grid-cols-1 gap-10">
                    {selectedProject.gallery.map((img, i) => (
                      <div key={i} className="group overflow-hidden rounded-[32px] bg-gray-50 cursor-zoom-in" onClick={() => setEnlargedImage(img)}>
                        <img src={img} className="w-full h-auto transition-transform duration-700 group-hover:scale-105 shadow-md" />
                      </div>
                    ))}
                  </div>
               </div>
             </div>
           </div>
        </div>
      )}

      {enlargedImage && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setEnlargedImage(null)}>
          <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={40} /></button>
          <img src={enlargedImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="확대" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">관리자 로그인</h3>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input autoFocus type="password" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 text-center text-xl outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="비밀번호" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
              <button type="submit" className="w-full py-5 bg-[#ff8a3d] text-white rounded-2xl font-black shadow-xl shadow-orange-100 text-lg hover:scale-105 transition-all">접속하기</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full text-gray-400 font-bold text-sm text-center block mt-2">취소</button>
            </form>
          </div>
        </div>
      )}

      {showInquiryForm && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInquiryForm(false)}>
          <div className="bg-white w-full max-w-2xl h-full max-h-[80vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col p-10 md:p-16 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowInquiryForm(false)} className="absolute top-8 right-8 p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900"><X size={24} /></button>
            <h2 className="text-3xl font-black mb-8 text-center">상담 신청</h2>
            <form onSubmit={handleInquirySubmit} className="space-y-4 overflow-y-auto">
              <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="성함" value={inquiryInput.name} onChange={e => setInquiryInput({...inquiryInput, name: e.target.value})} />
              <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="연락처" value={inquiryInput.phone} onChange={e => setInquiryInput({...inquiryInput, phone: e.target.value})} />
              <textarea required className="w-full p-4 h-32 bg-gray-50 border border-gray-100 rounded-2xl font-bold resize-none outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="문의 내용" value={inquiryInput.message} onChange={e => setInquiryInput({...inquiryInput, message: e.target.value})} />
              <button type="submit" className="w-full py-5 bg-[#ff8a3d] text-white rounded-2xl font-black text-xl active:scale-95 transition-all shadow-xl shadow-orange-100">신청하기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
