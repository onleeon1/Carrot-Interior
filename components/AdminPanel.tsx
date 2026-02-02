
import React, { useState, useRef } from 'react';
import { Project, Inquiry } from '../types';
import { Plus, Edit3, Trash2, Eye, Layout, FileText, ChevronLeft, Upload, Download, Database, RefreshCw, Phone, Calendar, ArrowRight, User, Wallet, Home } from 'lucide-react';

interface AdminPanelProps {
  projects: Project[];
  inquiries: Inquiry[];
  onAdd: (project: Project) => void;
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
  onImport: (projects: Project[]) => void;
  onDeleteInquiry: (id: string) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ projects, inquiries, onAdd, onUpdate, onDelete, onImport, onDeleteInquiry, onClose }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'inquiries'>('portfolio');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      if (projects.find(p => p.id === editingProject.id)) {
        onUpdate(editingProject);
      } else {
        onAdd(editingProject);
      }
      setEditingProject(null);
    }
  };

  const handleNew = () => {
    const newProj: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      category: 'Apartment',
      location: '',
      area: '',
      description: '',
      mainImage: '',
      gallery: [],
      createdAt: Date.now(),
      status: 'draft'
    };
    setEditingProject(newProj);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const file = e.target.files?.[0];
    if (file && editingProject) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isGallery) {
          setEditingProject({ ...editingProject, gallery: [...editingProject.gallery, base64] });
        } else {
          setEditingProject({ ...editingProject, mainImage: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify({ projects, inquiries }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFromJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json && Array.isArray(json.projects)) {
            if (confirm('서버 데이터를 JSON 파일 내용으로 덮어쓰시겠습니까?')) {
              onImport(json.projects);
              alert('데이터를 성공적으로 불러왔습니다.');
            }
          } else {
            alert('올바른 JSON 형식이 아닙니다.');
          }
        } catch (err) {
          alert('파일을 읽는 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col md:flex-row h-screen overflow-hidden text-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <span className="font-bold text-xl flex items-center gap-2">
            <span className="text-[#ff8a3d]">🥕</span> 관리자
          </span>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <div className="text-xs font-bold text-gray-500 px-4 mb-2 uppercase tracking-widest">Main</div>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'portfolio' ? 'bg-[#ff8a3d] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Layout size={20} /> 포트폴리오 관리
          </button>
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'inquiries' ? 'bg-[#ff8a3d] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <FileText size={20} /> 상담 문의 내역
            {inquiries.length > 0 && (
              <span className="ml-auto bg-white text-[#ff8a3d] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {inquiries.length}
              </span>
            )}
          </button>

          <div className="pt-6">
            <div className="text-xs font-bold text-gray-500 px-4 mb-2 uppercase tracking-widest">Database (JSON)</div>
            <button 
              onClick={exportToJson}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors text-sm"
            >
              <Download size={18} /> 백업 내보내기
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-colors text-sm"
            >
              <RefreshCw size={18} /> 백업 가져오기
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={importFromJson} 
              className="hidden" 
              accept=".json"
            />
          </div>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-800 text-gray-300 rounded-xl hover:text-white transition-colors text-sm font-medium"
          >
            대시보드 나가기
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto bg-gray-50 p-6 md:p-10">
        {!editingProject ? (
          <div className="max-w-5xl mx-auto">
            {activeTab === 'portfolio' ? (
              <>
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">포트폴리오 리스트</h2>
                    <p className="text-gray-500 mt-1">총 {projects.length}개의 프로젝트가 서버에 저장되어 있습니다.</p>
                  </div>
                  <button 
                    onClick={handleNew}
                    className="flex items-center gap-2 bg-[#ff8a3d] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus size={20} /> 새 프로젝트 작성
                  </button>
                </div>

                <div className="grid gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-gray-100 transition-all">
                      <div className="flex items-center gap-4">
                        <img src={p.mainImage || 'https://picsum.photos/100/100'} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-[#ff8a3d] transition-colors">{p.title || '제목 없음'}</h3>
                          <div className="flex gap-2 text-xs font-medium mt-1">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">{p.category}</span>
                            <span className={`px-2 py-0.5 rounded-md ${p.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                              {p.status === 'published' ? '게시됨' : '초안'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingProject(p)} className="p-3 text-gray-400 hover:text-[#ff8a3d] hover:bg-orange-50 rounded-xl transition-all">
                          <Edit3 size={20} />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-gray-900">상담 문의 내역</h2>
                  <p className="text-gray-500 mt-1">고객님들이 남겨주신 소중한 상담 신청 정보입니다.</p>
                </div>
                
                <div className="space-y-8">
                  {inquiries.map(inquiry => (
                    <div key={inquiry.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff8a3d]">
                            <User size={28} />
                          </div>
                          <div>
                            <h4 className="font-black text-2xl text-gray-900">{inquiry.name} <span className="text-sm font-bold text-gray-400 ml-1">고객님</span></h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-bold">
                              <span className="flex items-center gap-1"><Phone size={14} className="text-gray-300" /> {inquiry.phone}</span>
                              <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-300" /> {new Date(inquiry.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => onDeleteInquiry(inquiry.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                             <Home size={10} /> 공간 유형
                          </div>
                          <div className="font-bold text-gray-800">{inquiry.category === 'Apartment' ? '아파트' : inquiry.category === 'Villa' ? '빌라/주택' : inquiry.category === 'Commercial' ? '상가' : inquiry.category === 'Office' ? '오피스' : inquiry.category || '미지정'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                             <Wallet size={10} /> 예상 예산
                          </div>
                          <div className="font-bold text-gray-800">{inquiry.budget || '미지정'}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                             <Calendar size={10} /> 시공 희망일
                          </div>
                          <div className="font-bold text-gray-800">{inquiry.desiredDate || '미지정'}</div>
                        </div>
                      </div>

                      <div className="bg-orange-50/20 p-6 rounded-3xl mb-4 border border-orange-50/50">
                        <div className="text-[10px] font-black text-[#ff8a3d] mb-3 uppercase tracking-widest flex items-center gap-1">
                           <ArrowRight size={10} /> 상담 요청 내용
                        </div>
                        <div className="font-bold text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {inquiry.message || '남겨주신 메시지가 없습니다.'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest pl-2">
                        접수 경로: <span className="text-gray-400">{inquiry.projectTitle || '전역 상담 신청'}</span>
                      </div>
                    </div>
                  ))}
                  {inquiries.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-gray-300 font-bold">
                      아직 접수된 상담 내역이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <h3 className="text-xl font-bold text-gray-900">프로젝트 {editingProject.id.includes('.') ? '추가' : '편집'}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${isPreviewMode ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <Eye size={18} /> {isPreviewMode ? '편집으로 돌아가기' : '미리보기'}
                </button>
                {!isPreviewMode && (
                  <button onClick={handleSave} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all">
                    저장하기
                  </button>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto">
              {isPreviewMode ? (
                <div className="p-10 animate-in fade-in duration-500">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm font-bold mb-4">{editingProject.category}</span>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">{editingProject.title || '제목을 입력해주세요'}</h1>
                  <img src={editingProject.mainImage || 'https://picsum.photos/1200/600'} className="w-full h-[400px] object-cover rounded-3xl mb-10 shadow-lg" />
                  <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">{editingProject.description}</p>
                </div>
              ) : (
                <form className="p-10 space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700">대표 이미지 설정</label>
                    <div className="relative group cursor-pointer h-[300px] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-[#ff8a3d] transition-colors">
                      {editingProject.mainImage ? (
                        <>
                          <img src={editingProject.mainImage} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">이미지 변경</div>
                        </>
                      ) : (
                        <>
                          <Upload className="text-gray-300 mb-2" size={40} />
                          <span className="text-gray-400 font-medium">대표 이미지를 업로드하세요</span>
                        </>
                      )}
                      <input type="file" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">프로젝트 제목</label>
                      <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none text-gray-900 font-bold" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">카테고리</label>
                      <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none text-gray-900 font-bold" value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value as any})}>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Office">Office</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">상세 설명</label>
                    <textarea className="w-full p-4 h-64 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none text-gray-900 font-medium" value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700">갤러리 이미지 추가</label>
                    <div className="grid grid-cols-4 gap-4">
                      {editingProject.gallery.map((img, idx) => (
                        <div key={idx} className="relative aspect-square group">
                          <img src={img} className="w-full h-full object-cover rounded-xl border border-gray-100" />
                          <button type="button" onClick={() => {
                            const newGal = [...editingProject.gallery];
                            newGal.splice(idx, 1);
                            setEditingProject({...editingProject, gallery: newGal});
                          }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <div className="relative aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer">
                        <Plus className="text-gray-300" />
                        <input type="file" onChange={(e) => handleImageUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-4 pb-10">
                     <label className="flex items-center gap-2 cursor-pointer text-gray-900 font-bold">
                        <input type="radio" className="w-5 h-5 accent-[#ff8a3d]" checked={editingProject.status === 'published'} onChange={() => setEditingProject({...editingProject, status: 'published'})} />
                        게시하기
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer text-gray-900 font-bold">
                        <input type="radio" className="w-5 h-5 accent-[#ff8a3d]" checked={editingProject.status === 'draft'} onChange={() => setEditingProject({...editingProject, status: 'draft'})} />
                        초안 저장
                     </label>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
