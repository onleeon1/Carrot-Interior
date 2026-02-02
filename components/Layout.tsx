
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onAdminClick: () => void;
  onInquiryClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onAdminClick, onInquiryClick }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff8a3d] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🥕</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">당근 인테리어</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm font-bold text-gray-600 hover:text-[#ff8a3d] transition-colors"
            >
              홈
            </button>
            <button 
              onClick={() => document.getElementById('portfolio-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-bold text-gray-600 hover:text-[#ff8a3d] transition-colors"
            >
              포트폴리오
            </button>
            <button 
              onClick={onInquiryClick}
              className="text-sm font-bold text-[#ff8a3d] hover:text-[#e67e35] transition-colors"
            >
              상담예약
            </button>
            <button 
              onClick={onAdminClick}
              className="text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors"
            >
              관리자 모드
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-medium">© 2024 당근 인테리어. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
