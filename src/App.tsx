import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import DashboardEnhanced from './components/DashboardEnhanced';
import Members from './components/Members';
import Donations from './components/Donation';
import MobileDonation from './components/MobileDonation';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Help from './components/Help';
import Layout from './components/Layout';
import ConnectionTest from './components/ConnectionTest';
import { ChurchSession } from './types';
import { getCurrentSession, setupAutoLogout, refreshSession } from './utils/auth';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  const [session, setSession] = useState<ChurchSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트 마운트 시 세션 확인
    const initializeSession = async () => {
      try {
        const currentSession = getCurrentSession();
        if (currentSession) {
          // 세션 갱신 시도
          const refreshedSession = await refreshSession();
          if (refreshedSession) {
            setSession(refreshedSession);
            setupAutoLogout();
          }
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  const handleLogin = (newSession: ChurchSession) => {
    setSession(newSession);
    setupAutoLogout();
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('church_session');
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">시스템을 초기화하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우
  if (!session) {
    return (
      <>
        <LoginForm onLogin={handleLogin} />
        {/* 개발/디버깅용 연결 테스트 */}
        {process.env.NODE_ENV === 'development' && <ConnectionTest />}
      </>
    );
  }

  // 로그인된 경우 - 메인 애플리케이션
  return (
    <Router>
      <PWAInstallPrompt />
      <Layout session={session} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardEnhanced session={session} />} />
          <Route path="/dashboard" element={<DashboardEnhanced session={session} />} />

          <Route path="/members" element={<Members session={session} />} />
          <Route path="/donations" element={<Donations session={session} />} />
          <Route path="/donations/quick" element={
            <MobileDonation 
              session={session} 
              onClose={() => window.history.back()}
              onSuccess={() => window.location.href = '/donations'}
            />
          } />
          <Route path="/reports" element={<Reports session={session} />} />
          <Route path="/settings" element={<Settings session={session} />} />
          <Route path="/help" element={<Help />} />
          
          {/* 잘못된 경로는 대시보드로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;