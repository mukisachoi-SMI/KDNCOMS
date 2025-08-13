import { supabase } from './supabase';
import { ChurchSession } from '../types';

// 간단한 패스워드 검증 (평문 비교)
export const verifyPassword = (inputPassword: string, storedPassword: string): boolean => {
  return inputPassword === storedPassword;
};

// 로그인 처리
export const login = async (loginId: string, password: string): Promise<ChurchSession> => {
  try {
    // 교회 정보 조회
    const { data: churchData, error: churchError } = await supabase
      .from('churches')
      .select('church_id, church_name, login_id, email, password, logo_url')
      .eq('login_id', loginId)
      .eq('status', 'active')
      .single();

    if (churchError || !churchData) {
      throw new Error('로그인 ID를 찾을 수 없습니다.');
    }

    // 간단한 패스워드 검증
    if (!verifyPassword(password, churchData.password)) {
      throw new Error('패스워드가 올바르지 않습니다.');
    }

    // 사용자 정보 조회
    const { data: userData } = await supabase
      .from('users')
      .select('user_name')
      .eq('church_id', churchData.church_id)
      .single();

    // 로그인 기록 업데이트
    await updateLoginRecord(churchData.church_id);

    // 세션 데이터 생성
    const sessionData: ChurchSession = {
      churchId: churchData.church_id,
      churchName: churchData.church_name,
      churchLogo: churchData.logo_url || undefined,
      loginId: churchData.login_id,
      email: churchData.email,
      userName: userData?.user_name || '관리자'
    };

    // 로컬 스토리지에 저장
    localStorage.setItem('church_session', JSON.stringify(sessionData));

    return sessionData;
  } catch (error: any) {
    throw new Error(error.message || '로그인에 실패했습니다.');
  }
};

// 로그인 기록 업데이트
export const updateLoginRecord = async (churchId: string): Promise<void> => {
  const userId = `${churchId}_u1`;
  
  try {
    // 현재 로그인 횟수 조회
    const { data: currentUser } = await supabase
      .from('users')
      .select('login_count')
      .eq('user_id', userId)
      .single();

    const newLoginCount = (currentUser?.login_count || 0) + 1;

    // 로그인 기록 업데이트
    await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        login_count: newLoginCount
      })
      .eq('user_id', userId);
  } catch (error) {
    console.warn('로그인 기록 업데이트 실패:', error);
    // 실패해도 로그인은 계속 진행
  }
};

// 현재 세션 가져오기
export const getCurrentSession = (): ChurchSession | null => {
  try {
    const session = localStorage.getItem('church_session');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('세션 정보 조회 실패:', error);
    return null;
  }
};

// 로그아웃
export const logout = (): void => {
  localStorage.removeItem('church_session');
  window.location.href = '/';
};

// 세션 유효성 검사
export const isSessionValid = (): boolean => {
  const session = getCurrentSession();
  return session !== null && !!session.churchId;
};

// 자동 로그아웃 설정 (30분)
export const setupAutoLogout = (): void => {
  let timeoutId: NodeJS.Timeout;

  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      logout();
    }, 30 * 60 * 1000); // 30분
  };

  // 사용자 활동 감지
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimeout, { passive: true });
  });

  // 초기 타이머 설정
  resetTimeout();
};

// 세션 갱신
export const refreshSession = async (): Promise<ChurchSession | null> => {
  const currentSession = getCurrentSession();
  if (!currentSession) return null;

  try {
    // 교회 정보 재조회로 세션 갱신
    const { data: churchData, error } = await supabase
      .from('churches')
      .select('church_id, church_name, login_id, email, logo_url')
      .eq('church_id', currentSession.churchId)
      .eq('status', 'active')
      .single();

    if (error || !churchData) {
      logout();
      return null;
    }

    const updatedSession: ChurchSession = {
      ...currentSession,
      churchName: churchData.church_name,
      churchLogo: churchData.logo_url || undefined,
      email: churchData.email
    };

    localStorage.setItem('church_session', JSON.stringify(updatedSession));
    return updatedSession;
  } catch (error) {
    console.error('세션 갱신 실패:', error);
    logout();
    return null;
  }
};

// 패스워드 변경 (관리자용)
export const changePassword = async (churchId: string, newPassword: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('churches')
      .update({ 
        password: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('church_id', churchId);

    if (error) throw error;
  } catch (error) {
    throw new Error('패스워드 변경에 실패했습니다.');
  }
};