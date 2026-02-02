
import React, { useState, useEffect } from 'react';
import { Project, Inquiry, GithubConfig, AppData } from '../types';
import { Plus, Edit3, Trash2, Layout, FileText, ChevronLeft, Upload, Settings, Github, Loader2, Save, ChevronUp, ChevronDown, Globe, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  projects: Project[];
  inquiries: Inquiry[];
  isSaving: boolean;
  onSaveAll: (newData: AppData, githubConfig: GithubConfig) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ projects: initialProjects, inquiries: initialInquiries, isSaving, onSaveAll, onClose }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'inquiries' | 'settings'>('portfolio');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [githubConfig, setGithubConfig] = useState<GithubConfig>(() => {
    const saved = localStorage.getItem('github_config');
    return saved ? JSON.parse(saved) : { owner: '', repo: '', branch: 'main', token: '' };
  });

  useEffect(() => {
    localStorage.setItem('github_config', JSON.stringify(githubConfig));
  }, [githubConfig]);

  // GitHub 연결 상태 테스트 기능
  const testConnection = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) {
      setTestResult({ success: false, message: '모든 설정을 입력해주세요.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}`, {
        headers: { 'Authorization': `token ${githubConfig.token}` }
      });
      
      if (res.ok) {
        setTestResult({ success: true, message: '연결 성공! 저장소에 접근 가능합니다.' });
      } else {
        const err = await res.json();
        setTestResult({ success: false, message: `연결 실패: ${err.message}` });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setIsTesting(false);
    }
  };

  const autoDetectConfig = () => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname.includes('github.io')) {
      const owner = hostname.split('.')[0];
      const repo = pathname.split('/')[1] || '';
      setGithubConfig({ ...githubConfig, owner, repo: repo.replace(/\/$/, '') });
      setTestResult(null);
      alert('접속하신 주소에서 정보를 가져왔습니다. 토큰만 입력하고 연결 테스트를 눌러주세요.');
    } else {
      alert('GitHub Pages 환경에서만 자동 감지가 가능합니다. 수동으로 입력해주세요.');
    }
  };

  const handleGlobalSave = () => {
    onSaveAll({ projects, inquiries }, githubConfig);
  };

  const handleProjectSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      const exists = projects.find(p => p.id === editingProject.id);
      if (exists) {
        setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
      } else {
        setProjects([editingProject, ...projects]);
      }
      setEditingProject(null);
    }
  };

  const handleNewProject = () => {
    const maxOrder = Math.max(0, ...projects.map(p => p.order));
    setEditingProject({
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      category: 'Apartment',
      location: '',
      area: '',
      description: '',
      mainImage: '',
      gallery: [],
      createdAt: Date.now(),
      status: 'published',
      order: maxOrder + 1
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;
    
    const temp = newProjects[index].order;
    newProjects[index].order = newProjects[targetIndex].order;
    newProjects[targetIndex].order = temp;
    
    setProjects([...newProjects].sort((a, b) => a.order - b.order));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProject) return;
    
    setIsUploading(true);
    const readAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    };

    try {
      if (isGallery) {
        const fileList = Array.from(files) as File[];
        const base64Images = await Promise.all(fileList.map(file => readAsDataURL(file)));
        setEditingProject({ ...editingProject, gallery: [...editingProject.gallery, ...base64Images] });
      } else {
        const base64 = await readAsDataURL(files[0]);
        setEditingProject({ ...editingProject, mainImage: base64 });
      }
    } catch (err) {
      alert("이미지 처리 오류");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col md:flex-row h-screen overflow-hidden text-gray-900 animate-in fade-in duration-300">
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <span className="font-bold text-xl flex items-center gap-2">
            <span className="text-[#ff8a3d]">🥕</span> 관리자
          </span>
          <button onClick={onClose} className="md:hidden text-gray-400"><ChevronLeft size={24} /></button>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => setActiveTab('portfolio')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'portfolio' ? 'bg-[#ff8a3d] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}><Layout size={20} /> 포트폴리오</button>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'inquiries' ? 'bg-[#ff8a3d] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}><FileText size={20} /> 상담 내역</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'settings' ? 'bg-[#ff8a3d] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}><Settings size={20} /> GitHub 설정</button>
        </nav>

        <div className="p-4 space-y-2 border-t border-gray-800">
          <button 
            onClick={handleGlobalSave}
            disabled={isSaving}
            className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            GitHub에 배포
          </button>
          <button onClick={onClose} className="w-full py-2 text-gray-500 font-bold text-sm">홈페이지로</button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto bg-gray-50 p-6 md:p-10">
        {activeTab === 'portfolio' && !editingProject && (
          <div className="max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black">포트폴리오 관리</h2>
                <button onClick={handleNewProject} className="bg-[#ff8a3d] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-100 hover:scale-105 transition-all flex items-center gap-2"><Plus size={20} /> 새 포트폴리오</button>
             </div>
             <div className="grid gap-4">
                {projects.map((p, idx) => (
                  <div key={p.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                         <button onClick={() => handleMove(idx, 'up')} className="p-1 text-gray-300 hover:text-[#ff8a3d]"><ChevronUp size={18} /></button>
                         <button onClick={() => handleMove(idx, 'down')} className="p-1 text-gray-300 hover:text-[#ff8a3d]"><ChevronDown size={18} /></button>
                      </div>
                      <img src={p.mainImage} className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shadow-inner" />
                      <div>
                        <h3 className="font-black text-gray-900 text-lg">{p.title || '제목 없음'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#ff8a3d] font-black px-2 py-0.5 bg-orange-50 rounded-full uppercase">{p.category}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{p.area} | {p.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setEditingProject(p)} className="p-4 text-gray-400 hover:text-[#ff8a3d] hover:bg-orange-50 rounded-2xl transition-all"><Edit3 size={20} /></button>
                       <button onClick={() => setProjects(projects.filter(pj => pj.id !== p.id))} className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {editingProject && (
          <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
               <button onClick={() => setEditingProject(null)} className="p-3 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
               <button onClick={handleProjectSave} className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all">변경사항 저장</button>
             </div>
             <div className="flex-grow overflow-y-auto p-10 space-y-10">
                <div className="space-y-4">
                   <label className="text-sm font-black text-gray-400 uppercase tracking-widest">대표 이미지</label>
                   <div className="relative group cursor-pointer h-[400px] bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#ff8a3d] transition-all">
                      {editingProject.mainImage ? <img src={editingProject.mainImage} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="text-gray-300 mx-auto mb-2" size={48} /><p className="text-gray-400 font-bold">이미지 업로드</p></div>}
                      <input type="file" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      {isUploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-[#ff8a3d]" size={40} /></div>}
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">제목</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#ff8a3d]" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">카테고리</label>
                    <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#ff8a3d]" value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value as any})}>
                      <option value="Apartment">아파트</option><option value="Villa">빌라/주택</option><option value="Commercial">상가</option><option value="Office">오피스</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">면적</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="예: 32평 (105㎡)" value={editingProject.area} onChange={e => setEditingProject({...editingProject, area: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">위치</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#ff8a3d]" placeholder="예: 서울시 강남구" value={editingProject.location} onChange={e => setEditingProject({...editingProject, location: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">상세 설명</label>
                  <textarea className="w-full p-6 h-64 bg-gray-50 border border-gray-100 rounded-3xl font-medium resize-none outline-none focus:ring-2 focus:ring-[#ff8a3d]" value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} />
                </div>
                <div className="space-y-4">
                   <label className="text-sm font-black text-gray-400 uppercase">갤러리 사진</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editingProject.gallery.map((img, i) => (
                        <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden shadow-inner bg-gray-100">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => setEditingProject({...editingProject, gallery: editingProject.gallery.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#ff8a3d] transition-all">
                        <Plus className="text-gray-300" />
                        <span className="text-[10px] text-gray-400 font-bold mt-1">사진 추가</span>
                        <input type="file" multiple onChange={(e) => handleImageUpload(e, true)} className="hidden" accept="image/*" />
                      </label>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="max-w-5xl mx-auto">
             <h2 className="text-3xl font-black mb-10">상담 문의 내역</h2>
             <div className="space-y-4">
                {inquiries.length === 0 && <p className="text-center py-20 text-gray-400 font-bold">문의 내역이 없습니다.</p>}
                {inquiries.map(i => (
                  <div key={i.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{i.name} 고객님</h3>
                        <p className="text-[#ff8a3d] font-bold text-sm">{i.phone}</p>
                      </div>
                      <span className="text-xs text-gray-400 font-bold">{new Date(i.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap font-medium">{i.message}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black px-3 py-1 bg-gray-100 text-gray-500 rounded-full">{i.projectTitle || '일반 상담'}</span>
                      <button onClick={() => setInquiries(inquiries.filter(iq => iq.id !== i.id))} className="text-red-500 text-sm font-bold flex items-center gap-1"><Trash2 size={16} /> 내역 삭제</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-[40px] shadow-sm border border-gray-50 animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-gray-900 text-white rounded-2xl"><Github size={24} /></div>
                 <h2 className="text-2xl font-black">GitHub 설정</h2>
               </div>
               <button 
                onClick={autoDetectConfig}
                className="text-xs font-bold text-[#ff8a3d] bg-orange-50 px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-orange-100 transition-all"
               >
                 <Globe size={14} /> 현재 페이지에서 자동 감지
               </button>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">GitHub 아이디 (Owner)</label>
                  <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="예: gildong" value={githubConfig.owner} onChange={e => {setGithubConfig({...githubConfig, owner: e.target.value}); setTestResult(null);}} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">저장소 이름 (Repo)</label>
                  <input className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="예: interior-portfolio" value={githubConfig.repo} onChange={e => {setGithubConfig({...githubConfig, repo: e.target.value}); setTestResult(null);}} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Personal Access Token</label>
                  <input type="password" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="ghp_..." value={githubConfig.token} onChange={e => {setGithubConfig({...githubConfig, token: e.target.value}); setTestResult(null);}} />
                </div>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={testConnection}
                    disabled={isTesting}
                    className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw size={20} className="animate-spin text-gray-400" /> : <Github size={20} />}
                    연결 상태 테스트
                  </button>
                  
                  {testResult && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300 ${testResult.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {testResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                      <span className="text-sm font-bold">{testResult.message}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                  <p className="text-xs text-orange-700 font-bold leading-relaxed">
                    * 설정 후 상단 'GitHub에 배포'를 누르면 즉시 저장소에 파일이 생성됩니다.<br/>
                    * 토큰은 반드시 'repo' 권한이 포함된 Classic Token을 사용하세요.
                  </p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
