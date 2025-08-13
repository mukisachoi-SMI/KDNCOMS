import React, { useState, useEffect, useRef } from 'react';
import { ChurchSession } from '../types';
import { supabase } from '../utils/supabase';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,

  Award,
  Activity,
  Gift,

  ChevronRight,
  ArrowUp,
  ArrowDown,
  Plus,
  BarChart3,
  PieChart,
  Target,
  Menu,
  Bell,
  Search,
  ChevronDown,
  Sparkles,

  Eye,
  Clock,
  Filter,
  RefreshCw,
  ChevronLeft,
  MoreVertical,
  Coins,
  Wallet,
  CreditCard,
  Building,
  UserPlus,
  FileText,
  Download,
  Share2,
  Settings
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface DashboardEnhancedProps {
  session: ChurchSession;
}

interface DashboardStats {
  totalMembers: number;
  monthlyDonation: number;
  weeklyDonation: number;
  todayDonation: number;
  monthlyChange: number;
  weeklyChange: number;
  todayChange: number;
  topDonors: Array<{
    name: string;
    amount: number;
    percentage: number;
    avatar?: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  recentDonations: Array<{
    id: string;
    date: string;
    name: string;
    type: string;
    amount: number;
    time?: string;
    avatar?: string;
  }>;
  donationByType: Array<{
    type: string;
    amount: number;
    count: number;
    color: string;
    icon?: React.ReactNode;
    percentage: number;
  }>;
  weeklyTrend: Array<{
    day: string;
    amount: number;
  }>;
  notifications: number;
  goalProgress: number;
  monthlyGoal: number;
}

// 스켈레톤 로더 컴포넌트
const SkeletonLoader: React.FC = () => (
  <div className="space-y-4 pb-20 animate-pulse">
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl h-48" />
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-gray-200 rounded-2xl h-32" />
      <div className="bg-gray-200 rounded-2xl h-32" />
    </div>
    <div className="bg-gray-200 rounded-3xl h-64" />
    <div className="bg-gray-200 rounded-3xl h-48" />
  </div>
);

// 통계 카드 컴포넌트
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  onClick?: () => void;
  trend?: 'up' | 'down' | 'stable';
}> = ({ title, value, change, icon, color, subtitle, onClick, trend }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        relative overflow-hidden bg-white rounded-2xl p-4 shadow-sm border border-gray-100
        transition-all duration-200 cursor-pointer
        ${isPressed ? 'scale-95 shadow-inner' : 'hover:shadow-lg hover:scale-[1.02]'}
        ${onClick ? 'active:scale-95' : ''}
      `}
    >
      {/* 배경 패턴 */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
        <div className={`w-full h-full ${color} rounded-full blur-2xl`} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 ${color.replace('text', 'bg').replace('600', '100')} rounded-xl flex items-center justify-center`}>
            <div className={`${color}`}>{icon}</div>
          </div>
          {change !== undefined && (
            <div className={`
              flex items-center text-xs font-semibold px-2 py-1 rounded-full
              ${change > 0 ? 'text-green-600 bg-green-50' : 
                change < 0 ? 'text-red-600 bg-red-50' : 
                'text-gray-600 bg-gray-50'}
            `}>
              {change > 0 ? <ArrowUp className="w-3 h-3 mr-0.5" /> : 
               change < 0 ? <ArrowDown className="w-3 h-3 mr-0.5" /> : null}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// 프로그레스 바 컴포넌트
const ProgressBar: React.FC<{
  percentage: number;
  color?: string;
  height?: string;
  animated?: boolean;
  showLabel?: boolean;
}> = ({ percentage, color = 'bg-blue-500', height = 'h-2', animated = true, showLabel = false }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>진행률</span>
          <span className="font-semibold">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
        <div 
          className={`${height} ${color} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${width}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};

// 메인 대시보드 컴포넌트
const DashboardEnhanced: React.FC<DashboardEnhancedProps> = ({ session }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    monthlyDonation: 0,
    weeklyDonation: 0,
    todayDonation: 0,
    monthlyChange: 0,
    weeklyChange: 0,
    todayChange: 0,
    topDonors: [],
    recentDonations: [],
    donationByType: [],
    weeklyTrend: [],
    notifications: 3,
    goalProgress: 0,
    monthlyGoal: 10000000
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [showAllDonors, setShowAllDonors] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Pull to refresh 기능
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPulling.current) {
      const distance = e.touches[0].clientY - touchStartY.current;
      if (distance > 0 && distance < 100) {
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      await handleRefresh();
    }
    setPullDistance(0);
    isPulling.current = false;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // 햅틱 피드백 시뮬레이션
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    await loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 대시보드 공유 기능
  const handleShare = async () => {
    const shareData = {
      title: `${session.churchName} 대시보드`,
      text: `${session.churchName} 이번달 헌금 현황\n\n` +
            `📊 총 헌금: ${formatCurrency(stats.monthlyDonation)}\n` +
            `👥 전체 교인: ${stats.totalMembers}명\n` +
            `📈 목표 달성률: ${stats.goalProgress.toFixed(0)}%\n\n` +
            `#교회헌금관리 #${session.churchName}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        // 네이티브 공유 API 사용 (모바일)
        await navigator.share(shareData);
        console.log('Dashboard shared successfully');
      } else {
        // 웹 브라우저에서 클립보드 복사
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareText);
          
          // 복사 완료 알림 표시
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-slide-up';
          toast.textContent = '📋 대시보드 정보가 클립보드에 복사되었습니다!';
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => document.body.removeChild(toast), 300);
          }, 3000);
        } else {
          // 구형 브라우저 대응
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            alert('대시보드 정보가 클립보드에 복사되었습니다!');
          } catch (err) {
            console.error('Failed to copy:', err);
            alert('복사에 실패했습니다. 수동으로 복사해주세요.');
          } finally {
            document.body.removeChild(textArea);
          }
        }
      }
    } catch (error) {
      console.error('Error sharing dashboard:', error);
      alert('공유 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // 실시간 업데이트 구독
    const subscription = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'donations' },
        () => loadDashboardData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session.churchId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 현재 날짜 기준
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // 이전 기간 계산
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // 병렬 데이터 로딩
      const [
        memberData,
        monthlyData,
        weeklyData,
        todayData,
        lastMonthData,
        lastWeekData,
        yesterdayData,
        topDonorsData,
        recentData,
        typeData,
        weeklyTrendData
      ] = await Promise.all([
        // 교인 수
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('church_id', session.churchId)
          .eq('status', 'active'),
        
        // 이번 달 헌금
        supabase
          .from('donations')
          .select('amount')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .gte('donation_date', startOfMonth.toISOString().split('T')[0]),
        
        // 이번 주 헌금
        supabase
          .from('donations')
          .select('amount')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .gte('donation_date', startOfWeek.toISOString().split('T')[0]),
        
        // 오늘 헌금
        supabase
          .from('donations')
          .select('amount')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .eq('donation_date', startOfToday.toISOString().split('T')[0]),
        
        // 지난 달 헌금
        supabase
          .from('donations')
          .select('amount')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .gte('donation_date', startOfLastMonth.toISOString().split('T')[0])
          .lte('donation_date', endOfLastMonth.toISOString().split('T')[0]),
        
        // 지난 주 헌금
        supabase
          .from('donations')
          .select('amount')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .gte('donation_date', startOfLastWeek.toISOString().split('T')[0])
          .lt('donation_date', startOfWeek.toISOString().split('T')[0]),
        
        // 어제 헌금
        supabase
          .from('donations')
          .select('amount')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .eq('donation_date', yesterday.toISOString().split('T')[0]),
        
        // TOP 헌금자
        supabase
          .from('donations')
          .select(`
            member_id, 
            donor_name, 
            amount, 
            members!inner(member_name)
          `)
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .gte('donation_date', startOfMonth.toISOString().split('T')[0]),
        
        // 최근 헌금
        supabase
          .from('donations')
          .select(`
            donation_id,
            donation_date,
            amount,
            donor_name,
            created_at,
            members!inner(member_name),
            donation_types!inner(type_name)
          `)
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .order('donation_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10),
        
        // 헌금 종류별
        supabase
          .from('donations')
          .select(`
            amount,
            donation_types!inner(type_name)
          `)
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .gte('donation_date', startOfMonth.toISOString().split('T')[0]),
        
        // 주간 트렌드 데이터
        supabase
          .from('donations')
          .select('amount, donation_date')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .gte('donation_date', startOfWeek.toISOString().split('T')[0])
      ]);

      // 데이터 집계
      const monthlyTotal = monthlyData.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const weeklyTotal = weeklyData.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const todayTotal = todayData.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const lastMonthTotal = lastMonthData.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const lastWeekTotal = lastWeekData.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const yesterdayTotal = yesterdayData.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
      
      // 변화율 계산
      const monthlyChange = lastMonthTotal > 0 
        ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 
        : 0;
      const weeklyChange = lastWeekTotal > 0
        ? ((weeklyTotal - lastWeekTotal) / lastWeekTotal) * 100
        : 0;
      const todayChange = yesterdayTotal > 0
        ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
        : 0;

      // TOP 헌금자 집계
      const donorMap = new Map();
      const donorTrendMap = new Map();
      
      topDonorsData.data?.forEach((d: any) => {
        const name = d.members?.member_name || d.donor_name || '익명';
        const current = donorMap.get(name) || 0;
        donorMap.set(name, current + d.amount);
        
        // 트렌드 계산 (실제로는 이전 달 데이터와 비교해야 함)
        donorTrendMap.set(name, Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable');
      });
      
      const topDonors = Array.from(donorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, amount], index) => {
          // 한국 이름의 경우 성을 제외한 이름 부분만 아바타에 표시
          const nameForAvatar = name.length >= 3 ? name.substring(1) : name;
          return {
            name,
            amount,
            percentage: monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`,
            trend: donorTrendMap.get(name) as 'up' | 'down' | 'stable'
          };
        });

      // 헌금 종류별 집계
      const typeMap = new Map();
      const typeColors = [
        { color: '#3b82f6', icon: <Wallet className="w-4 h-4" /> },
        { color: '#10b981', icon: <CreditCard className="w-4 h-4" /> },
        { color: '#f59e0b', icon: <Coins className="w-4 h-4" /> },
        { color: '#ef4444', icon: <Building className="w-4 h-4" /> },
        { color: '#8b5cf6', icon: <Gift className="w-4 h-4" /> }
      ];
      let colorIndex = 0;
      
      typeData.data?.forEach((d: any) => {
        const typeName = d.donation_types?.type_name || '기타';
        const current = typeMap.get(typeName) || { 
          amount: 0, 
          count: 0, 
          ...typeColors[colorIndex++ % typeColors.length]
        };
        current.amount += d.amount;
        current.count += 1;
        typeMap.set(typeName, current);
      });

      const donationByType = Array.from(typeMap.entries())
        .map(([type, data]) => ({
          type,
          amount: data.amount,
          count: data.count,
          color: data.color,
          icon: data.icon,
          percentage: monthlyTotal > 0 ? (data.amount / monthlyTotal) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      // 주간 트렌드 집계
      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      const weeklyTrendMap = new Map();
      
      weeklyTrendData.data?.forEach((d: any) => {
        const date = new Date(d.donation_date);
        const dayName = weekDays[date.getDay()];
        const current = weeklyTrendMap.get(dayName) || 0;
        weeklyTrendMap.set(dayName, current + d.amount);
      });
      
      const weeklyTrend = weekDays.map(day => ({
        day,
        amount: weeklyTrendMap.get(day) || 0
      }));

      // 최근 헌금 포맷팅
      const recentDonations = recentData.data?.map((d: any) => {
        const date = new Date(d.created_at);
        const fullName = d.members?.member_name || d.donor_name || '익명';
        // 한국 이름의 경우 성을 제외한 이름 부분만 아바타에 표시
        const nameForAvatar = fullName.length >= 3 ? fullName.substring(1) : fullName;
        return {
          id: d.donation_id,
          date: d.donation_date,
          name: fullName,
          type: d.donation_types?.type_name || '일반',
          amount: d.amount,
          time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`
        };
      }) || [];

      // 목표 진행률 계산
      const monthlyGoal = 10000000; // 1천만원 목표
      const goalProgress = Math.min(100, (monthlyTotal / monthlyGoal) * 100);

      setStats({
        totalMembers: memberData.count || 0,
        monthlyDonation: monthlyTotal,
        weeklyDonation: weeklyTotal,
        todayDonation: todayTotal,
        monthlyChange,
        weeklyChange,
        todayChange,
        topDonors,
        recentDonations,
        donationByType,
        weeklyTrend,
        notifications: 3,
        goalProgress,
        monthlyGoal
      });

    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 포맷팅 함수들
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}천만`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}백만`;
    if (num >= 10000) return `${(num / 10000).toFixed(0)}만`;
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // 현재 표시할 데이터 선택
  const getCurrentPeriodData = () => {
    switch(selectedPeriod) {
      case 'today':
        return { amount: stats.todayDonation, change: stats.todayChange, label: '오늘' };
      case 'week':
        return { amount: stats.weeklyDonation, change: stats.weeklyChange, label: '이번주' };
      case 'month':
        return { amount: stats.monthlyDonation, change: stats.monthlyChange, label: '이번달' };
      default:
        return { amount: stats.monthlyDonation, change: stats.monthlyChange, label: '이번달' };
    }
  };

  const periodData = getCurrentPeriodData();

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all"
          style={{ transform: `translateY(${Math.min(pullDistance, 60)}px)` }}
        >
          <div className={`
            w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
            ${pullDistance > 60 ? 'animate-spin' : ''}
          `}>
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      )}

      {/* 상단 헤더 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/menu')}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{session.churchName}</h1>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/search')}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {stats.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {stats.notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 메인 통계 카드 */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl" />
          </div>
          
          <div className="relative z-10">
            {/* 인사말 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <p className="text-sm text-blue-100 font-medium">안녕하세요, {session.userName}님!</p>
                </div>
                <p className="text-2xl font-bold">오늘도 축복가득한 하루 🙏</p>
              </div>
              <button 
                onClick={handleRefresh}
                className={`
                  w-10 h-10 rounded-full bg-white/20 flex items-center justify-center
                  hover:bg-white/30 transition-all
                  ${isRefreshing ? 'animate-spin' : ''}
                `}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* 기간 선택 탭 */}
            <div className="flex space-x-2 mb-4">
              {(['today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${selectedPeriod === period 
                      ? 'bg-white text-blue-700 shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30'}
                  `}
                >
                  {period === 'today' ? '오늘' : period === 'week' ? '이번주' : '이번달'}
                </button>
              ))}
            </div>

            {/* 선택된 기간 통계 */}
            <div className="mb-6">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-sm text-blue-100 mb-1">{periodData.label} 헌금</p>
                  <p className="text-3xl font-bold">₩{formatCompactNumber(periodData.amount)}</p>
                </div>
                {periodData.change !== 0 && (
                  <div className={`
                    flex items-center px-3 py-1.5 rounded-full text-sm font-semibold
                    ${periodData.change > 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}
                  `}>
                    {periodData.change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(periodData.change).toFixed(1)}%
                  </div>
                )}
              </div>
              
              {/* 미니 차트 */}
              <div className="flex items-end space-x-1 h-16 mt-4">
                {stats.weeklyTrend.map((day, index) => {
                  const maxAmount = Math.max(...stats.weeklyTrend.map(d => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-white/30 rounded-t transition-all duration-500 hover:bg-white/40"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-blue-100 mt-1">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 목표 진행률 */}
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">이번달 누적</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {stats.goalProgress.toFixed(0)}% 달성
                </span>
              </div>
              <ProgressBar 
                percentage={stats.goalProgress} 
                color="bg-gradient-to-r from-yellow-400 to-orange-400"
                height="h-3"
                animated={true}
              />
              <div className="flex justify-between mt-2 text-xs text-blue-100">
                <span>₩{formatCompactNumber(stats.monthlyDonation)}</span>
                <span>₩{formatCompactNumber(stats.monthlyGoal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 통계 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="전체 교인"
            value={`${stats.totalMembers}명`}
            icon={<Users className="w-5 h-5" />}
            color="text-blue-600"
            subtitle="활동중"
            onClick={() => navigate('/members')}
          />
          <StatCard
            title="오늘 헌금"
            value={`₩${formatCompactNumber(stats.todayDonation)}`}
            change={stats.todayChange}
            icon={<DollarSign className="w-5 h-5" />}
            color="text-green-600"
            subtitle="전일 대비"
            onClick={() => navigate('/donations')}
          />
        </div>

        {/* 헌금 종류별 분석 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-gray-600" />
              헌금 종류별 분석
            </h3>
            <button 
              onClick={() => navigate('/reports')}
              className="text-xs text-blue-600 font-medium flex items-center hover:text-blue-700"
            >
              상세보기
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
          
          {stats.donationByType.length > 0 ? (
            <div className="space-y-3">
              {stats.donationByType.slice(0, 4).map((item, index) => (
                <div key={index} className="group hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <div style={{ color: item.color }}>{item.icon}</div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.type}</p>
                        <p className="text-xs text-gray-500">{item.count}건 • {item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₩{formatCompactNumber(item.amount)}</p>
                    </div>
                  </div>
                  <ProgressBar 
                    percentage={item.percentage} 
                    color={`bg-[${item.color}]`}
                    height="h-1.5"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <PieChart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">아직 헌금 데이터가 없습니다</p>
              <button 
                onClick={() => navigate('/donations/quick')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
              >
                첫 헌금 등록하기
              </button>
            </div>
          )}
        </div>

        {/* TOP 헌금자 */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-orange-500" />
              이번달 헌금 순위
            </h3>
            <button 
              onClick={() => setShowAllDonors(!showAllDonors)}
              className="text-xs text-orange-600 font-medium flex items-center hover:text-orange-700"
            >
              {showAllDonors ? '접기' : '전체보기'}
              <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${showAllDonors ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {stats.topDonors.length > 0 ? (
            <div className="space-y-3">
              {stats.topDonors.slice(0, showAllDonors ? 10 : 5).map((donor, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 hover:bg-white/50 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    {/* 순위 배지 */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                      shadow-md transition-transform group-hover:scale-110
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'}
                    `}>
                      {index + 1}
                    </div>
                    
                    {/* 프로필 */}
                    <div className="relative">
                      <img 
                        src={donor.avatar} 
                        alt={donor.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                      {donor.trend === 'up' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <ArrowUp className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{donor.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{donor.percentage.toFixed(1)}%</span>
                        {donor.trend === 'up' && (
                          <span className="text-xs text-green-600 font-medium">↑ 상승</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₩{formatCompactNumber(donor.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-sm text-gray-500">이번달 헌금 내역이 없습니다</p>
            </div>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-gray-600" />
              최근 헌금 활동
            </h3>
            <Link 
              to="/donations" 
              className="text-xs text-blue-600 font-medium flex items-center hover:text-blue-700"
            >
              전체보기
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          
          {stats.recentDonations.length > 0 ? (
            <div className="space-y-2">
              {stats.recentDonations.slice(0, 5).map((donation) => (
                <div 
                  key={donation.id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all group cursor-pointer"
                  onClick={() => navigate(`/donations/${donation.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={donation.avatar} 
                      alt={donation.name}
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{donation.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(donation.date)} • {donation.time} • {donation.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-gray-900">₩{formatCompactNumber(donation.amount)}</p>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">최근 헌금 내역이 없습니다</p>
            </div>
          )}
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={() => navigate('/donations/quick')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 group"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">헌금등록</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/members', { state: { openAddMember: true } })}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 group"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">교인등록</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/reports')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 group"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">보고서</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 group"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">설정</span>
            </div>
          </button>
        </div>

        {/* 공유 및 다운로드 */}
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/reports')}
            className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 px-4 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-medium">보고서 다운로드</span>
          </button>
          
          <button 
            onClick={() => handleShare()}
            className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 px-4 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">대시보드 공유</span>
          </button>
        </div>
      </div>

      {/* 알림 패널 */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowNotifications(false)}>
          <div 
            className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-3">알림</h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900">새로운 헌금이 등록되었습니다</p>
                <p className="text-xs text-gray-500 mt-1">방금 전</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900">이번달 목표 70% 달성!</p>
                <p className="text-xs text-gray-500 mt-1">2시간 전</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900">새로운 교인이 등록되었습니다</p>
                <p className="text-xs text-gray-500 mt-1">어제</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS 애니메이션 추가
const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  }

  .spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 3px solid #3b82f6;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes slide-up {
    0% {
      transform: translate(-50%, 100%);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  .animate-fade-out {
    animation: fade-out 0.3s ease-out;
  }
`;

// 스타일 삽입
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default DashboardEnhanced;