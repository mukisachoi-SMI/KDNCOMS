import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChurchSession } from '../types';
import ChurchLogo from './ChurchLogo';
import { 
  Church, 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Plus,
  ChevronRight,
  User,
  HelpCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  session: ChurchSession;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, session, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: Home, color: 'text-blue-600' },
    { name: '교인 관리', href: '/members', icon: Users, color: 'text-green-600' },
    { name: '헌금 관리', href: '/donations', icon: DollarSign, color: 'text-purple-600' },
    { name: '보고서', href: '/reports', icon: FileText, color: 'text-orange-600' },
    { name: '설정', href: '/settings', icon: Settings, color: 'text-gray-600' },
    { name: '도움말', href: '/help', icon: HelpCircle, color: 'text-indigo-600' },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      onLogout();
    }
  };

  // 데스크톱 사이드바
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
        {/* 로고 영역 */}
        <div className="flex items-center h-16 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
          <Church className="w-8 h-8 text-white" />
          <span className="ml-3 text-lg font-bold text-white">헌금관리시스템</span>
        </div>

        {/* 교회 정보 */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <ChurchLogo 
              logoUrl={session.churchLogo}
              churchName={session.churchName}
              size="md"
            />
            <div className="ml-3">
              <div className="text-sm font-semibold text-gray-900">{session.churchName}</div>
              <div className="text-xs text-gray-500">{session.userName}</div>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const current = isCurrentPath(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl
                  transition-all duration-200
                  ${current 
                    ? 'bg-primary-50 text-primary-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`
                  mr-3 h-5 w-5 transition-colors duration-200
                  ${current ? 'text-primary-600' : item.color}
                `} />
                {item.name}
                {current && (
                  <ChevronRight className="ml-auto h-4 w-4 text-primary-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );

  // 모바일 사이드바
  const MobileSidebar = () => (
    <>
      {/* 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* 헤더 */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center">
            <Church className="w-7 h-7 text-white" />
            <span className="ml-2 text-white font-bold">헌금관리</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 교회 정보 */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <ChurchLogo 
              logoUrl={session.churchLogo}
              churchName={session.churchName}
              size="lg"
            />
            <div className="ml-3">
              <div className="font-semibold text-gray-900">{session.churchName}</div>
              <div className="text-sm text-gray-500">{session.userName}</div>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const current = isCurrentPath(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-base font-medium rounded-xl
                  transition-all duration-200
                  ${current 
                    ? 'bg-primary-50 text-primary-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className={`mr-3 h-5 w-5 ${current ? 'text-primary-600' : item.color}`} />
                {item.name}
                {current && (
                  <ChevronRight className="ml-auto h-4 w-4 text-primary-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="mr-2 h-5 w-5" />
            로그아웃
          </button>
        </div>
      </div>
    </>
  );

  // 모바일 하단 네비게이션
  const MobileBottomNav = () => (
    <nav className="bottom-nav lg:hidden">
      <div className="grid grid-cols-5 relative">
        {/* 홈 */}
        <Link
          to="/dashboard"
          className={`bottom-nav-item ${isCurrentPath('/dashboard') ? 'active' : ''}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">홈</span>
        </Link>
        
        {/* 교인 */}
        <Link
          to="/members"
          className={`bottom-nav-item ${isCurrentPath('/members') ? 'active' : ''}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">교인</span>
        </Link>
        
        {/* 빈 공간 - 중앙 버튼을 위한 자리 */}
        <div></div>
        
        {/* 보고서 */}
        <Link
          to="/reports"
          className={`bottom-nav-item ${isCurrentPath('/reports') ? 'active' : ''}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">보고서</span>
        </Link>
        
        {/* 설정 */}
        <Link
          to="/settings"
          className={`bottom-nav-item ${isCurrentPath('/settings') ? 'active' : ''}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">설정</span>
        </Link>
        
        {/* 헌금 등록 (중앙 버튼 - 절대 위치) */}
        <div className="bottom-nav-center">
          <Link
            to="/donations/quick"
            className="bottom-nav-center-button"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데스크톱 사이드바 */}
      <DesktopSidebar />
      
      {/* 모바일 사이드바 */}
      <MobileSidebar />

      {/* 메인 콘텐츠 */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {/* 페이지 제목 */}
              <div className="flex-1 lg:flex-none ml-4 lg:ml-0">
                <h1 className="text-xl font-bold text-gray-900">
                  {navigation.find(item => isCurrentPath(item.href))?.name || '대시보드'}
                </h1>
              </div>

              {/* 헤더 액션 */}
              <div className="flex items-center space-x-2">
                {/* 알림 버튼 */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* 사용자 정보 (데스크톱) */}
                <div className="hidden sm:flex items-center ml-3">
                  <ChurchLogo 
                    logoUrl={session.churchLogo}
                    churchName={session.churchName}
                    size="sm"
                  />
                  <div className="ml-2 hidden lg:block">
                    <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                    <div className="text-xs text-gray-500">관리자</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* 푸터 (데스크톱) */}
        <footer className="hidden lg:block bg-white border-t border-gray-200 py-4 mt-auto">
          <div className="px-8 text-center text-sm text-gray-500">
            <p>© 2025 교회 헌금관리시스템. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* 모바일 하단 네비게이션 */}
      <MobileBottomNav />

      {/* 빠른 액션 버튼 (플로팅) - 태블릿 사이즈에서만 */}
      {isMobile && !isCurrentPath('/donations/quick') && window.innerWidth >= 640 && window.innerWidth < 1024 && (
        <Link
          to="/donations/quick"
          className="fab"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
};

export default Layout;