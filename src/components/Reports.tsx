import React, { useState, useEffect } from 'react';
import { ChurchSession } from '../types';
import { supabase } from '../utils/supabase';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  DollarSign,
  Printer,
  Search,
  Filter,
  ChevronRight,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  CheckCircle,
  CreditCard,
  Award,
  FileCheck,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Gift
} from 'lucide-react';

interface ReportsProps {
  session: ChurchSession;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  memberId: string;
  donationTypeId: string;
  reportType: 'donation_receipt' | 'monthly' | 'yearly' | 'member' | 'type';
  selectedMonth?: string;
  selectedYear?: number;
}

interface MemberReportData {
  memberId: string;
  memberName: string;
  phone?: string;
  address?: string;
  email?: string;
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  firstDonationDate?: string;
  lastDonationDate?: string;
  monthlyAverage: number;
  donations: any[];
  donationsByType: {
    [key: string]: {
      typeName: string;
      count: number;
      total: number;
      percentage: number;
    }
  };
  monthlyTrend: {
    month: string;
    amount: number;
    count: number;
  }[];
  yearComparison?: {
    currentYear: number;
    previousYear: number;
    changePercent: number;
  };
  donationFrequency: 'regular' | 'irregular' | 'rare';
  topDonationType: string;
  preferredPaymentMethod: string;
}

interface WeeklyData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  total: number;
  count: number;
  donations: any[];
  dailyBreakdown: { [key: string]: number };
}

interface MonthlyReportData {
  month: string;
  count: number;
  total: number;
  weeklyData: WeeklyData[];
  donations: any[];
}

interface MonthlyDataForYear {
  month: number;
  monthName: string;
  count: number;
  total: number;
  donations: any[];
  weeklyAverage: number;
}

interface YearlyReportData {
  year: number;
  count: number;
  total: number;
  monthlyData: MonthlyDataForYear[];
  donations: any[];
  monthlyAverage: number;
}

interface DonationReceiptData {
  memberId: string;
  memberName: string;
  phone?: string;
  address?: string;
  totalAmount: number;
  period: string;
  donations: any[];
  donationCount: number;
}

const Reports: React.FC<ReportsProps> = ({ session }) => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    memberId: '',
    donationTypeId: '',
    reportType: 'donation_receipt',
    selectedMonth: new Date().toISOString().split('T')[0].substring(0, 7),
    selectedYear: new Date().getFullYear()
  });
  
  const [members, setMembers] = useState<any[]>([]);
  const [donationTypes, setDonationTypes] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<DonationReceiptData[]>([]);
  const [memberReportData, setMemberReportData] = useState<MemberReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showWeeklyDetails, setShowWeeklyDetails] = useState<string | null>(null);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState<number | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [session.churchId]);

  useEffect(() => {
    if (filters.reportType === 'donation_receipt') {
      setFilters(prev => ({
        ...prev,
        startDate: `${selectedYear}-01-01`,
        endDate: `${selectedYear}-12-31`,
        donationTypeId: '' // 기부금 영수증은 전체 헌금 집계
      }));
    }
  }, [selectedYear, filters.reportType]);

  useEffect(() => {
    if (filters.reportType === 'yearly' && filters.selectedYear) {
      setFilters(prev => ({
        ...prev,
        startDate: `${filters.selectedYear}-01-01`,
        endDate: `${filters.selectedYear}-12-31`
      }));
    }
  }, [filters.selectedYear, filters.reportType]);

  useEffect(() => {
    if (filters.reportType === 'monthly' && filters.selectedMonth) {
      const [year, month] = filters.selectedMonth.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      const formatDateString = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      setFilters(prev => ({
        ...prev,
        startDate: formatDateString(firstDay),
        endDate: formatDateString(lastDay)
      }));
    }
  }, [filters.selectedMonth, filters.reportType]);

  const loadInitialData = async () => {
    try {
      const [membersResult, typesResult] = await Promise.all([
        supabase
          .from('members')
          .select('member_id, member_name, phone, address')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .order('member_name'),
        
        supabase
          .from('donation_types')
          .select('type_id, type_name')
          .eq('church_id', session.churchId)
          .eq('is_active', true)
          .order('sort_order')
      ]);

      setMembers(membersResult.data || []);
      setDonationTypes(typesResult.data || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('donations')
        .select(`
          *,
          members (member_name, phone, address),
          donation_types (type_name)
        `)
        .eq('church_id', session.churchId)
        .eq('status', 'active')
        .gte('donation_date', filters.startDate)
        .lte('donation_date', filters.endDate);

      if (filters.memberId) {
        query = query.eq('member_id', filters.memberId);
      }

      // 기부금 영수증은 전체 헌금을 집계하므로 헌금종류 필터를 사용하지 않음
      if (filters.donationTypeId && filters.reportType !== 'donation_receipt') {
        query = query.eq('donation_type_id', filters.donationTypeId);
      }

      const { data, error } = await query.order('donation_date', { ascending: false });

      if (error) throw error;

      // 리포트 데이터 처리
      if (filters.reportType === 'donation_receipt') {
        const processedData = processDonationReceipts(data || []);
        setReceiptData(processedData);
      } else if (filters.reportType === 'member') {
        const processedData = await processMemberDetailReport(data || []);
        setMemberReportData(processedData);
      } else {
        const processedData = processReportData(data || [], filters.reportType);
        setReportData(processedData);
      }

    } catch (error) {
      console.error('Report generation error:', error);
      alert('보고서 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const processDonationReceipts = (data: any[]): DonationReceiptData[] => {
    const memberMap = new Map<string, DonationReceiptData>();
    
    data.forEach(donation => {
      const memberKey = donation.member_id || donation.donor_name || '익명';
      const memberName = donation.members?.member_name || donation.donor_name || '익명';
      
      if (!memberMap.has(memberKey)) {
        memberMap.set(memberKey, {
          memberId: donation.member_id || memberKey,
          memberName,
          phone: donation.members?.phone,
          address: donation.members?.address,
          totalAmount: 0,
          period: `${selectedYear}년 1월 1일 ~ ${selectedYear}년 12월 31일`,
          donations: [],
          donationCount: 0
        });
      }
      
      const member = memberMap.get(memberKey)!;
      member.totalAmount += donation.amount;
      member.donationCount += 1;
      member.donations.push(donation);
    });

    return Array.from(memberMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // 교인별 상세 보고서 처리 (개선된 버전)
  const processMemberDetailReport = async (data: any[]): Promise<MemberReportData[]> => {
    const memberMap = new Map<string, MemberReportData>();
    
    // 작년 같은 기간 데이터도 가져오기 (전년 대비 분석용)
    const currentYear = new Date(filters.startDate).getFullYear();
    const previousYearStart = `${currentYear - 1}-01-01`;
    const previousYearEnd = `${currentYear - 1}-12-31`;
    
    const { data: previousYearData } = await supabase
      .from('donations')
      .select('member_id, donor_name, amount')
      .eq('church_id', session.churchId)
      .eq('status', 'active')
      .gte('donation_date', previousYearStart)
      .lte('donation_date', previousYearEnd);
    
    // 전년도 데이터 집계
    const previousYearTotals = new Map<string, number>();
    previousYearData?.forEach(donation => {
      const memberKey = donation.member_id || donation.donor_name || '익명';
      const current = previousYearTotals.get(memberKey) || 0;
      previousYearTotals.set(memberKey, current + donation.amount);
    });
    
    // 현재 기간 데이터 처리
    data.forEach(donation => {
      const memberKey = donation.member_id || donation.donor_name || '익명';
      const memberName = donation.members?.member_name || donation.donor_name || '익명';
      
      if (!memberMap.has(memberKey)) {
        memberMap.set(memberKey, {
          memberId: donation.member_id || memberKey,
          memberName,
          phone: donation.members?.phone,
          address: donation.members?.address,
          email: donation.members?.email,
          totalAmount: 0,
          totalCount: 0,
          averageAmount: 0,
          firstDonationDate: donation.donation_date,
          lastDonationDate: donation.donation_date,
          monthlyAverage: 0,
          donations: [],
          donationsByType: {},
          monthlyTrend: [],
          donationFrequency: 'rare',
          topDonationType: '',
          preferredPaymentMethod: ''
        });
      }
      
      const member = memberMap.get(memberKey)!;
      member.totalAmount += donation.amount;
      member.totalCount += 1;
      member.donations.push(donation);
      
      // 첫 헌금일과 마지막 헌금일 업데이트
      if (donation.donation_date < member.firstDonationDate!) {
        member.firstDonationDate = donation.donation_date;
      }
      if (donation.donation_date > member.lastDonationDate!) {
        member.lastDonationDate = donation.donation_date;
      }
      
      // 헌금 종류별 집계
      const typeKey = donation.donation_type_id;
      const typeName = donation.donation_types?.type_name || '기타';
      if (!member.donationsByType[typeKey]) {
        member.donationsByType[typeKey] = {
          typeName,
          count: 0,
          total: 0,
          percentage: 0
        };
      }
      member.donationsByType[typeKey].count++;
      member.donationsByType[typeKey].total += donation.amount;
    });
    
    // 각 교인별 통계 계산
    memberMap.forEach((member, memberKey) => {
      // 평균 헌금액
      member.averageAmount = member.totalCount > 0 ? member.totalAmount / member.totalCount : 0;
      
      // 헌금 종류별 비율 계산
      Object.values(member.donationsByType).forEach(type => {
        type.percentage = (type.total / member.totalAmount) * 100;
      });
      
      // 가장 많이 한 헌금 종류
      const topType = Object.values(member.donationsByType).reduce((max, type) => 
        type.total > (max?.total || 0) ? type : max, 
        Object.values(member.donationsByType)[0]
      );
      member.topDonationType = topType?.typeName || '';
      
      // 선호 헌금 방법
      const paymentMethods = member.donations.reduce((acc: any, d: any) => {
        acc[d.payment_method] = (acc[d.payment_method] || 0) + 1;
        return acc;
      }, {});
      member.preferredPaymentMethod = Object.keys(paymentMethods).reduce((a, b) => 
        paymentMethods[a] > paymentMethods[b] ? a : b, '현금'
      );
      
      // 월별 트렌드 계산
      const monthlyMap = new Map<string, { amount: number; count: number }>();
      member.donations.forEach((donation: any) => {
        const monthKey = donation.donation_date.substring(0, 7);
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { amount: 0, count: 0 });
        }
        const monthData = monthlyMap.get(monthKey)!;
        monthData.amount += donation.amount;
        monthData.count++;
      });
      
      member.monthlyTrend = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          amount: data.amount,
          count: data.count
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      // 월 평균 계산
      const monthCount = member.monthlyTrend.length;
      member.monthlyAverage = monthCount > 0 ? member.totalAmount / monthCount : 0;
      
      // 헌금 빈도 분석
      if (member.totalCount >= 12) {
        member.donationFrequency = 'regular'; // 정기적
      } else if (member.totalCount >= 4) {
        member.donationFrequency = 'irregular'; // 비정기적
      } else {
        member.donationFrequency = 'rare'; // 드물게
      }
      
      // 전년 대비 분석
      const previousAmount = previousYearTotals.get(memberKey) || 0;
      if (previousAmount > 0) {
        member.yearComparison = {
          currentYear: member.totalAmount,
          previousYear: previousAmount,
          changePercent: ((member.totalAmount - previousAmount) / previousAmount) * 100
        };
      }
    });
    
    return Array.from(memberMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const processReportData = (data: any[], reportType: string) => {
    switch (reportType) {
      case 'monthly':
        return processMonthlyReport(data);
      case 'yearly':
        return processYearlyReport(data);
      case 'type':
        return processTypeReport(data);
      default:
        return data;
    }
  };

  const getWeekNumber = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return Math.ceil((dayOfMonth + startingDayOfWeek) / 7);
  };

  const getWeekDateRange = (year: number, month: number, weekNumber: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    let weekStart = new Date(year, month - 1, (weekNumber - 1) * 7 - startingDayOfWeek + 1);
    let weekEnd = new Date(year, month - 1, weekNumber * 7 - startingDayOfWeek);
    
    if (weekStart.getTime() < firstDay.getTime()) {
      weekStart = new Date(firstDay);
    }
    if (weekEnd.getTime() > lastDay.getTime()) {
      weekEnd = new Date(lastDay);
    }
    
    const formatDateString = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    return {
      start: formatDateString(weekStart),
      end: formatDateString(weekEnd)
    };
  };

  const processMonthlyReport = (data: any[]): MonthlyReportData => {
    if (!filters.selectedMonth) return { month: '', count: 0, total: 0, weeklyData: [], donations: [] };
    
    const [year, month] = filters.selectedMonth.split('-').map(Number);
    
    const monthlyData: MonthlyReportData = {
      month: filters.selectedMonth,
      count: 0,
      total: 0,
      weeklyData: [],
      donations: data
    };
    
    const weeksInMonth = 5;
    const weeklyMap = new Map<number, WeeklyData>();
    
    for (let week = 1; week <= weeksInMonth; week++) {
      const weekRange = getWeekDateRange(year, month, week);
      weeklyMap.set(week, {
        weekNumber: week,
        startDate: weekRange.start,
        endDate: weekRange.end,
        total: 0,
        count: 0,
        donations: [],
        dailyBreakdown: {}
      });
    }
    
    data.forEach(donation => {
      const donationDate = new Date(donation.donation_date);
      const weekNum = getWeekNumber(donationDate);
      const weekData = weeklyMap.get(weekNum);
      
      if (weekData) {
        weekData.count++;
        weekData.total += donation.amount;
        weekData.donations.push(donation);
        
        const dateKey = donation.donation_date;
        if (!weekData.dailyBreakdown[dateKey]) {
          weekData.dailyBreakdown[dateKey] = 0;
        }
        weekData.dailyBreakdown[dateKey] += donation.amount;
      }
      
      monthlyData.count++;
      monthlyData.total += donation.amount;
    });
    
    monthlyData.weeklyData = Array.from(weeklyMap.values())
      .filter(week => week.count > 0)
      .sort((a, b) => a.weekNumber - b.weekNumber);
    
    return monthlyData;
  };

  const processYearlyReport = (data: any[]): YearlyReportData => {
    if (!filters.selectedYear) return { year: 0, count: 0, total: 0, monthlyData: [], donations: [], monthlyAverage: 0 };
    
    const yearlyData: YearlyReportData = {
      year: filters.selectedYear,
      count: 0,
      total: 0,
      monthlyData: [],
      donations: data,
      monthlyAverage: 0
    };
    
    const monthlyMap = new Map<number, MonthlyDataForYear>();
    const monthNames = [
      '작년', '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    for (let month = 1; month <= 12; month++) {
      monthlyMap.set(month, {
        month,
        monthName: monthNames[month],
        count: 0,
        total: 0,
        donations: [],
        weeklyAverage: 0
      });
    }
    
    data.forEach(donation => {
      const donationDate = new Date(donation.donation_date);
      const month = donationDate.getMonth() + 1;
      const monthData = monthlyMap.get(month);
      
      if (monthData) {
        monthData.count++;
        monthData.total += donation.amount;
        monthData.donations.push(donation);
      }
      
      yearlyData.count++;
      yearlyData.total += donation.amount;
    });
    
    yearlyData.monthlyData = Array.from(monthlyMap.values())
      .map(month => {
        month.weeklyAverage = month.total / 4;
        return month;
      })
      .sort((a, b) => a.month - b.month);
    
    const monthsWithData = yearlyData.monthlyData.filter(m => m.count > 0).length;
    yearlyData.monthlyAverage = monthsWithData > 0 ? yearlyData.total / monthsWithData : 0;
    
    return yearlyData;
  };

  const processTypeReport = (data: any[]) => {
    const typeData: { [key: string]: any } = {};
    
    data.forEach(donation => {
      const typeId = donation.donation_type_id;
      const typeName = donation.donation_types?.type_name || '기타';
      
      if (!typeData[typeId]) {
        typeData[typeId] = {
          typeId,
          typeName,
          count: 0,
          total: 0,
          donations: []
        };
      }
      typeData[typeId].count++;
      typeData[typeId].total += donation.amount;
      typeData[typeId].donations.push(donation);
    });

    return Object.values(typeData).sort((a, b) => b.total - a.total);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 교인별 개인 보고서 출력
  const printMemberReport = (member: MemberReportData) => {
    const printWindow = window.open('', '', 'width=800,height=1000');
    if (!printWindow) return;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${member.memberName} - 헌금 보고서</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Malgun Gothic', sans-serif; 
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px double #333;
          }
          .title { 
            font-size: 24px; 
            font-weight: bold;
            margin: 10px 0;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
          }
          .section {
            margin: 25px 0;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #333;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }
          .info-item {
            padding: 10px;
            background: #f9f9f9;
            border-radius: 5px;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
          .highlight {
            background: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th {
            background: #f0f0f0;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #ddd;
          }
          td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          .chart-bar {
            display: inline-block;
            height: 20px;
            background: linear-gradient(to right, #4CAF50, #45a049);
            margin-right: 10px;
            vertical-align: middle;
          }
          .trend-up { color: #4CAF50; }
          .trend-down { color: #f44336; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">개인 헌금 보고서</div>
          <div class="subtitle">${session.churchName}</div>
          <div class="subtitle">기간: ${filters.startDate} ~ ${filters.endDate}</div>
        </div>

        <div class="section">
          <div class="section-title">교인 정보</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">성명</div>
              <div class="info-value">${member.memberName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">연락처</div>
              <div class="info-value">${member.phone || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">주소</div>
              <div class="info-value">${member.address || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">헌금 시작일</div>
              <div class="info-value">${member.firstDonationDate ? formatDate(member.firstDonationDate) : '-'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">헌금 요약</div>
          <div class="highlight">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
              <div>
                <div class="info-label">총 헌금액</div>
                <div class="info-value" style="color: #4CAF50; font-size: 20px;">
                  ${formatCurrency(member.totalAmount)}
                </div>
              </div>
              <div>
                <div class="info-label">헌금 횟수</div>
                <div class="info-value">${member.totalCount}회</div>
              </div>
              <div>
                <div class="info-label">평균 헌금액</div>
                <div class="info-value">${formatCurrency(member.averageAmount)}</div>
              </div>
            </div>
          </div>
          ${member.yearComparison ? `
            <div style="margin-top: 15px; padding: 10px; background: #f0f8ff; border-radius: 5px;">
              <strong>전년 대비:</strong>
              <span class="${member.yearComparison.changePercent >= 0 ? 'trend-up' : 'trend-down'}">
                ${member.yearComparison.changePercent >= 0 ? '▲' : '▼'}
                ${Math.abs(member.yearComparison.changePercent).toFixed(1)}%
              </span>
              (작년: ${formatCurrency(member.yearComparison.previousYear)})
            </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">헌금 종류별 분석</div>
          <table>
            <thead>
              <tr>
                <th>헌금 종류</th>
                <th style="text-align: center;">횟수</th>
                <th style="text-align: right;">금액</th>
                <th style="text-align: center;">비율</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(member.donationsByType)
                .sort((a, b) => b.total - a.total)
                .map(type => `
                  <tr>
                    <td>${type.typeName}</td>
                    <td style="text-align: center;">${type.count}회</td>
                    <td style="text-align: right;">${formatCurrency(type.total)}</td>
                    <td style="text-align: center;">
                      <div style="display: flex; align-items: center;">
                        <div class="chart-bar" style="width: ${type.percentage}%;"></div>
                        ${type.percentage.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">월별 헌금 추이</div>
          <table>
            <thead>
              <tr>
                <th>월</th>
                <th style="text-align: center;">횟수</th>
                <th style="text-align: right;">금액</th>
              </tr>
            </thead>
            <tbody>
              ${member.monthlyTrend.map(month => `
                <tr>
                  <td>${month.month}</td>
                  <td style="text-align: center;">${month.count}회</td>
                  <td style="text-align: right;">${formatCurrency(month.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">헌금 패턴 분석</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">헌금 빈도</div>
              <div class="info-value">
                ${member.donationFrequency === 'regular' ? '정기적' : 
                  member.donationFrequency === 'irregular' ? '비정기적' : '드물게'}
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">주요 헌금 종류</div>
              <div class="info-value">${member.topDonationType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">선호 헌금 방법</div>
              <div class="info-value">${member.preferredPaymentMethod}</div>
            </div>
            <div class="info-item">
              <div class="info-label">월 평균 헌금액</div>
              <div class="info-value">${formatCurrency(member.monthlyAverage)}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>발행일: ${new Date().toLocaleDateString('ko-KR')}</p>
          <p>${session.churchName} | 이 보고서는 교회 내부용으로만 사용됩니다.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // 기부금 영수증 출력
  const printDonationReceipt = (receipt: DonationReceiptData) => {
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>기부금 영수증</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Malgun Gothic', sans-serif; 
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px double #000;
          }
          .title { 
            font-size: 28px; 
            font-weight: bold;
            margin: 20px 0;
            letter-spacing: 10px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          .info-table td {
            padding: 12px;
            border: 1px solid #333;
            font-size: 14px;
          }
          .info-table .label {
            width: 30%;
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
          }
          .amount-box {
            margin: 40px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border: 2px solid #333;
            text-align: center;
          }
          .amount-value {
            font-size: 24px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">기 부 금 영 수 증</div>
          <div>${session.churchName}</div>
        </div>
        
        <table class="info-table">
          <tr>
            <td class="label">성명</td>
            <td>${receipt.memberName}</td>
          </tr>
          <tr>
            <td class="label">기부 기간</td>
            <td>${receipt.period}</td>
          </tr>
        </table>
        
        <div class="amount-box">
          <div>기부금 총액</div>
          <div class="amount-value">${formatCurrency(receipt.totalAmount)}</div>
        </div>
        
        <div style="text-align: center; margin-top: 50px;">
          <p>위와 같이 기부금을 영수하였음을 증명합니다.</p>
          <p style="margin-top: 30px;">${new Date().toLocaleDateString('ko-KR')}</p>
          <p style="margin-top: 30px; font-weight: bold;">${session.churchName}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const printAllReceipts = () => {
    receiptData.forEach((receipt, index) => {
      setTimeout(() => printDonationReceipt(receipt), 500 * (index + 1));
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">보고서</h2>
            <p className="text-gray-600">헌금 보고서 생성 및 기부금 영수증 발급</p>
          </div>
        </div>
      </div>

      {/* 보고서 종류 선택 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">보고서 종류 선택</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { value: 'donation_receipt', label: '기부금 영수증', icon: CreditCard },
            { value: 'monthly', label: '월별 보고서', icon: Calendar },
            { value: 'yearly', label: '연간 보고서', icon: BarChart3 },
            { value: 'member', label: '교인별 보고서', icon: Users },
            { value: 'type', label: '헌금종류별', icon: FileSpreadsheet }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setFilters({...filters, reportType: type.value as any})}
              className={`p-4 border rounded-lg transition-all ${
                filters.reportType === type.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <type.icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{type.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 필터 설정 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">조건 설정</h3>
        </div>
        
        {/* 보고서 타입별 조건 설정 */}
        {filters.reportType === 'yearly' && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              조회할 연도 선택
            </label>
            <select
              value={filters.selectedYear}
              onChange={(e) => setFilters({...filters, selectedYear: Number(e.target.value)})}
              className="input max-w-xs"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                );
              })}
            </select>
          </div>
        )}
        
        {filters.reportType === 'monthly' && (
          <>
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                조회할 연월 선택
              </label>
              <input
                type="month"
                value={filters.selectedMonth}
                onChange={(e) => setFilters({...filters, selectedMonth: e.target.value})}
                className="input max-w-xs"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특정 교인 선택 (선택사항)
                </label>
                <select
                  value={filters.memberId}
                  onChange={(e) => setFilters({...filters, memberId: e.target.value})}
                  className="input"
                >
                  <option value="">전체 교인</option>
                  {members.map(member => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.member_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  헌금 종류 (선택사항)
                </label>
                <select
                  value={filters.donationTypeId}
                  onChange={(e) => setFilters({...filters, donationTypeId: e.target.value})}
                  className="input"
                >
                  <option value="">전체</option>
                  {donationTypes.map(type => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
        
        {filters.reportType === 'donation_receipt' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              영수증 발급 연도
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input max-w-xs"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                );
              })}
            </select>
          </div>
        )}
        
        {(filters.reportType === 'member' || filters.reportType === 'type') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="input"
              />
            </div>
          </div>
        )}
        
        {/* 교인별 보고서와 헌금종류별 보고서 필터 */}
        {(filters.reportType === 'member' || filters.reportType === 'type') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filters.reportType === 'member' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특정 교인 선택 (선택사항)
                </label>
                <select
                  value={filters.memberId}
                  onChange={(e) => setFilters({...filters, memberId: e.target.value})}
                  className="input"
                >
                  <option value="">전체 교인</option>
                  {members.map(member => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.member_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                헌금 종류 (선택사항)
              </label>
              <select
                value={filters.donationTypeId}
                onChange={(e) => setFilters({...filters, donationTypeId: e.target.value})}
                className="input"
              >
                <option value="">전체</option>
                {donationTypes.map(type => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={generateReport}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner mr-2"></div>
                생성 중...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                보고서 생성
              </>
            )}
          </button>
        </div>
      </div>

      {/* 교인별 보고서 결과 (개선된 버전) */}
      {filters.reportType === 'member' && memberReportData.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-medium">
              교인별 상세 보고서 ({memberReportData.length}명)
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // CSV 다운로드
                  let csvContent = '\uFEFF';
                  csvContent += '교인명,총헌금액,헌금횟수,평균헌금액,월평균,주요헌금종류,헌금빈도,전년대비\n';
                  memberReportData.forEach(member => {
                    csvContent += `${member.memberName},`;
                    csvContent += `${member.totalAmount},`;
                    csvContent += `${member.totalCount},`;
                    csvContent += `${member.averageAmount},`;
                    csvContent += `${member.monthlyAverage},`;
                    csvContent += `${member.topDonationType},`;
                    csvContent += `${member.donationFrequency === 'regular' ? '정기적' : 
                                   member.donationFrequency === 'irregular' ? '비정기적' : '드물게'},`;
                    csvContent += `${member.yearComparison ? 
                                   member.yearComparison.changePercent.toFixed(1) + '%' : '-'}\n`;
                  });
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `교인별보고서_${filters.startDate}_${filters.endDate}.csv`);
                  link.click();
                }}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 다운로드
              </button>
            </div>
          </div>

          {/* 전체 요약 통계 */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">총 헌금액</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(memberReportData.reduce((sum, m) => sum + m.totalAmount, 0))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">평균 헌금액</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    memberReportData.reduce((sum, m) => sum + m.totalAmount, 0) / 
                    Math.max(memberReportData.length, 1)
                  )}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">정기 헌금자</div>
                <div className="text-2xl font-bold text-purple-600">
                  {memberReportData.filter(m => m.donationFrequency === 'regular').length}명
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">전년 대비 상승</div>
                <div className="text-2xl font-bold text-orange-600">
                  {memberReportData.filter(m => 
                    m.yearComparison && m.yearComparison.changePercent > 0
                  ).length}명
                </div>
              </div>
            </div>
          </div>

          {/* 교인별 상세 정보 */}
          <div className="p-4 space-y-4">
            {memberReportData.map((member, index) => (
              <div key={member.memberId} className="border rounded-lg overflow-hidden bg-white">
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedMember(
                    expandedMember === member.memberId ? null : member.memberId
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-bold">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-lg">{member.memberName}</span>
                          {member.donationFrequency === 'regular' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              정기헌금자
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          {member.phone && (
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {member.phone}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Gift className="w-3 h-3 mr-1" />
                            {member.topDonationType}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {member.totalCount}회
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(member.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          평균 {formatCurrency(member.averageAmount)}
                        </div>
                      </div>
                      {member.yearComparison && (
                        <div className={`flex items-center ${
                          member.yearComparison.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {member.yearComparison.changePercent >= 0 ? 
                            <TrendingUp className="w-5 h-5 mr-1" /> : 
                            <TrendingDown className="w-5 h-5 mr-1" />
                          }
                          <span className="font-bold">
                            {Math.abs(member.yearComparison.changePercent).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printMemberReport(member);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-md"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedMember === member.memberId ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 확장된 상세 정보 */}
                {expandedMember === member.memberId && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 헌금 종류별 분석 */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <PieChart className="w-4 h-4 mr-2" />
                          헌금 종류별 분석
                        </h4>
                        <div className="bg-white rounded-lg p-4">
                          {Object.values(member.donationsByType)
                            .sort((a, b) => b.total - a.total)
                            .map(type => (
                              <div key={type.typeName} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)` }}
                                  />
                                  <span className="text-sm">{type.typeName}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold">{formatCurrency(type.total)}</div>
                                  <div className="text-xs text-gray-500">{type.percentage.toFixed(1)}%</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* 월별 헌금 추이 */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <Activity className="w-4 h-4 mr-2" />
                          월별 헌금 추이
                        </h4>
                        <div className="bg-white rounded-lg p-4">
                          <div className="h-32 flex items-end justify-between gap-1">
                            {member.monthlyTrend.slice(-6).map(month => {
                              const maxAmount = Math.max(...member.monthlyTrend.map(m => m.amount));
                              const heightPercent = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                              
                              return (
                                <div key={month.month} className="flex-1 flex flex-col items-center">
                                  <div className="text-xs text-gray-600 mb-1">
                                    {formatCurrency(month.amount).replace('₩', '').replace(',000', 'k')}
                                  </div>
                                  <div 
                                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                                    style={{ height: `${heightPercent}%` }}
                                    title={`${month.month}: ${formatCurrency(month.amount)}`}
                                  />
                                  <div className="text-xs mt-1 text-gray-700">
                                    {month.month.substring(5)}월
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 헌금 패턴 정보 */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-500">헌금 빈도</div>
                        <div className="text-sm font-bold text-gray-900">
                          {member.donationFrequency === 'regular' ? '정기적' : 
                           member.donationFrequency === 'irregular' ? '비정기적' : '드물게'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-500">선호 방법</div>
                        <div className="text-sm font-bold text-gray-900">
                          {member.preferredPaymentMethod}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-500">월 평균</div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(member.monthlyAverage)}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs text-gray-500">최근 헌금일</div>
                        <div className="text-sm font-bold text-gray-900">
                          {member.lastDonationDate ? formatDate(member.lastDonationDate) : '-'}
                        </div>
                      </div>
                    </div>

                    {/* 최근 헌금 내역 */}
                    <div className="mt-6">
                      <h4 className="font-bold text-gray-900 mb-3">최근 헌금 내역 (최근 5건)</h4>
                      <div className="bg-white rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">날짜</th>
                              <th className="px-4 py-2 text-left">헌금종류</th>
                              <th className="px-4 py-2 text-right">금액</th>
                              <th className="px-4 py-2 text-center">방법</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {member.donations.slice(0, 5).map((donation: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-2">{formatDate(donation.donation_date)}</td>
                                <td className="px-4 py-2">{donation.donation_types?.type_name || '기타'}</td>
                                <td className="px-4 py-2 text-right font-medium">
                                  {formatCurrency(donation.amount)}
                                </td>
                                <td className="px-4 py-2 text-center">{donation.payment_method}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기부금 영수증 결과 (간단한 형태) */}
      {filters.reportType === 'donation_receipt' && receiptData.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-medium">
              기부금 영수증 ({receiptData.length}명)
            </h3>
            <button
              onClick={printAllReceipts}
              className="btn btn-secondary"
            >
              <Printer className="w-4 h-4 mr-2" />
              전체 출력
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>순번</th>
                  <th>성명</th>
                  <th>기부 기간</th>
                  <th className="text-right">총 헌금액</th>
                  <th className="text-center">영수증</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.map((receipt, index) => (
                  <tr key={receipt.memberId}>
                    <td>{index + 1}</td>
                    <td className="font-medium">{receipt.memberName}</td>
                    <td>{receipt.period}</td>
                    <td className="text-right font-bold">{formatCurrency(receipt.totalAmount)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => printDonationReceipt(receipt)}
                        className="btn btn-sm btn-primary"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="font-bold">합계</td>
                  <td className="text-right font-bold text-lg">
                    {formatCurrency(receiptData.reduce((sum, r) => sum + r.totalAmount, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 월별 보고서 결과 (간단한 형태) */}
      {filters.reportType === 'monthly' && reportData && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">
              {reportData.month} 월별 보고서
            </h3>
          </div>
          
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">총 헌금액</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.total || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">헌금 건수</p>
                <p className="text-2xl font-bold">{reportData.count || 0}건</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">평균 헌금액</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.count > 0 ? reportData.total / reportData.count : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* 주차별 요약 */}
          {reportData.weeklyData && reportData.weeklyData.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">주차별 헌금 현황</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>주차</th>
                    <th>기간</th>
                    <th className="text-center">건수</th>
                    <th className="text-right">헌금액</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.weeklyData.map((week: any) => (
                    <tr key={week.weekNumber}>
                      <td>{week.weekNumber}주차</td>
                      <td className="text-sm text-gray-600">
                        {week.startDate} ~ {week.endDate}
                      </td>
                      <td className="text-center">{week.count}건</td>
                      <td className="text-right font-medium">
                        {formatCurrency(week.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 연간 보고서 결과 (간단한 형태) */}
      {filters.reportType === 'yearly' && reportData && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">
              {reportData.year}년 연간 보고서
            </h3>
          </div>
          
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">총 헌금액</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.total || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">헌금 건수</p>
                <p className="text-2xl font-bold">{reportData.count || 0}건</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">월 평균</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.monthlyAverage || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">건당 평균</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.count > 0 ? reportData.total / reportData.count : 0)}
                </p>
              </div>
            </div>
          </div>

          {/* 월별 요약 */}
          {reportData.monthlyData && reportData.monthlyData.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">월별 헌금 현황</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>월</th>
                    <th className="text-center">건수</th>
                    <th className="text-right">헌금액</th>
                    <th className="text-right">주 평균</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyData.map((month: any) => (
                    <tr key={month.month} className={month.count === 0 ? 'text-gray-400' : ''}>
                      <td>{month.monthName}</td>
                      <td className="text-center">{month.count}건</td>
                      <td className="text-right font-medium">
                        {formatCurrency(month.total)}
                      </td>
                      <td className="text-right text-sm text-gray-600">
                        {formatCurrency(month.weeklyAverage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="font-bold">합계</td>
                    <td className="text-center font-bold">{reportData.count}건</td>
                    <td className="text-right font-bold text-lg">
                      {formatCurrency(reportData.total)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 헌금 종류별 보고서 결과 (간단한 형태) */}
      {filters.reportType === 'type' && reportData && Array.isArray(reportData) && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">
              헌금 종류별 보고서
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>헌금 종류</th>
                  <th className="text-center">건수</th>
                  <th className="text-right">총액</th>
                  <th className="text-right">평균</th>
                  <th className="text-center">비율</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((type: any, index: number) => {
                  const totalAmount = reportData.reduce((sum: number, t: any) => sum + t.total, 0);
                  const percentage = totalAmount > 0 ? (type.total / totalAmount) * 100 : 0;
                  
                  return (
                    <tr key={type.typeId}>
                      <td className="text-center">{index + 1}</td>
                      <td className="font-medium">{type.typeName}</td>
                      <td className="text-center">{type.count}건</td>
                      <td className="text-right font-bold">{formatCurrency(type.total)}</td>
                      <td className="text-right">{formatCurrency(type.total / type.count)}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="font-bold">합계</td>
                  <td className="text-center font-bold">
                    {reportData.reduce((sum: number, t: any) => sum + t.count, 0)}건
                  </td>
                  <td className="text-right font-bold text-lg">
                    {formatCurrency(reportData.reduce((sum: number, t: any) => sum + t.total, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;