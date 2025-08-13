import React, { useState, useEffect } from 'react';
import { ChurchSession, Donation, Member, DonationType, DonationFormData } from '../types';
import { supabase } from '../utils/supabase';
import { IDGenerator } from '../utils/idGenerator';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Users,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';

interface DonationsProps {
  session: ChurchSession;
}

interface DonationFilters {
  dateFrom: string;
  dateTo: string;
  donationTypeId: string;
  memberName: string;
  paymentMethod: string;
  amountMin: string;
  amountMax: string;
}

const Donations: React.FC<DonationsProps> = ({ session }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState<DonationFormData>({
    member_id: '',
    donor_name: '',
    donation_type_id: '',
    amount: 0,
    donation_date: new Date().toISOString().split('T')[0],
    payment_method: '현금',
    notes: ''
  });

  const [filters, setFilters] = useState<DonationFilters>({
    dateFrom: '',
    dateTo: '',
    donationTypeId: '',
    memberName: '',
    paymentMethod: '',
    amountMin: '',
    amountMax: ''
  });

  const paymentMethods = ['현금', '온라인'];

  useEffect(() => {
    loadInitialData();
  }, [session.churchId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadDonations(),
        loadMembers(),
        loadDonationTypes()
      ]);
    } catch (err) {
      console.error('Initial data loading error:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDonations = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('donations')
        .select(`
          *,
          member:members (member_name),
          donation_type:donation_types (type_name)
        `)
        .eq('church_id', session.churchId)
        .eq('status', 'active')
        .order('donation_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setDonations(data || []);
    } catch (err: any) {
      console.error('Donations loading error:', err);
      throw err;
    }
  };

  const loadMembers = async () => {
    try {
        const { data, error: queryError } = await supabase
            .from('members')
            .select('*')
            .eq('church_id', session.churchId)
            .eq('status', 'active')
            .order('member_name');

      if (queryError) throw queryError;
         setMembers(data || []);
    } catch (err: any) {
      console.error('Members loading error:', err);
      throw err;
    }
  };

  const loadDonationTypes = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('donation_types')
        .select('*')
        .eq('church_id', session.churchId)
        .eq('is_active', true)
        .order('sort_order');

      if (queryError) throw queryError;

      setDonationTypes(data || []);
    } catch (err: any) {
      console.error('Donation types loading error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.donation_type_id || formData.amount <= 0) {
      alert('헌금 종류와 금액은 필수 입력 항목입니다.');
      return;
    }

    if (!formData.member_id && (!formData.donor_name || !formData.donor_name.trim())) {
      alert('교인을 선택하거나 헌금자명을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      if (editingDonation) {
        // 수정
        const { error } = await supabase
          .from('donations')
          .update({
            member_id: formData.member_id || null,
            donor_name: formData.member_id ? null : formData.donor_name,
            donation_type_id: formData.donation_type_id,
            amount: formData.amount,
            donation_date: formData.donation_date,
            payment_method: formData.payment_method,
            notes: formData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('donation_id', editingDonation.donation_id)
          .eq('church_id', session.churchId);

        if (error) throw error;
      } else {
        // 신규 등록
        const donationId = await IDGenerator.generateDonationId(
          session.churchId, 
          formData.donation_date
        );
        
        const { error } = await supabase
          .from('donations')
          .insert({
            donation_id: donationId,
            church_id: session.churchId,
            member_id: formData.member_id || null,
            donor_name: formData.member_id ? null : formData.donor_name,
            donation_type_id: formData.donation_type_id,
            amount: formData.amount,
            donation_date: formData.donation_date,
            payment_method: formData.payment_method,
            notes: formData.notes || null,
            status: 'active'
          });

        if (error) throw error;
      }

      // 폼 초기화 및 목록 새로고침
      resetForm();
      await loadDonations();
      
    } catch (err: any) {
      console.error('Donation save error:', err);
      alert('저장에 실패했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({
      member_id: donation.member_id || '',
      donor_name: donation.donor_name || '',
      donation_type_id: donation.donation_type_id,
      amount: donation.amount,
      donation_date: donation.donation_date,
      payment_method: donation.payment_method,
      notes: donation.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (donation: Donation) => {
    if (!window.confirm(`${formatCurrency(donation.amount)} 헌금을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('donations')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('donation_id', donation.donation_id)
        .eq('church_id', session.churchId);

      if (error) throw error;

      await loadDonations();
    } catch (err: any) {
      console.error('Donation delete error:', err);
      alert('삭제에 실패했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      donor_name: '',
      donation_type_id: '',
      amount: 0,
      donation_date: new Date().toISOString().split('T')[0],
      payment_method: '현금',
      notes: ''
    });
    setEditingDonation(null);
    setShowAddForm(false);
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case '온라인': return <DollarSign className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />; // 현금
    }
  };

  // 필터링된 헌금 목록
  const filteredDonations = donations.filter(donation => {
    // 날짜 필터
    if (filters.dateFrom && donation.donation_date < filters.dateFrom) return false;
    if (filters.dateTo && donation.donation_date > filters.dateTo) return false;
    
    // 헌금 종류 필터
    if (filters.donationTypeId && donation.donation_type_id !== filters.donationTypeId) return false;
    
    // 헌금자명 필터
    if (filters.memberName) {
      const donorName = donation.member?.member_name || donation.donor_name || '';
      if (!donorName.toLowerCase().includes(filters.memberName.toLowerCase())) return false;
    }
    
    // 헌금방법 필터
    if (filters.paymentMethod && donation.payment_method !== filters.paymentMethod) return false;
    
    // 금액 필터
    if (filters.amountMin && donation.amount < parseInt(filters.amountMin)) return false;
    if (filters.amountMax && donation.amount > parseInt(filters.amountMax)) return false;
    
    return true;
  });

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">헌금 관리</h2>
            <p className="text-gray-600">헌금 내역을 등록하고 관리합니다</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            필터
          </button>
          <button
            onClick={loadDonations}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            헌금 등록
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <Receipt className="w-8 h-8 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">조회된 헌금 건수</p>
              <p className="text-2xl font-bold text-gray-900">{filteredDonations.length}건</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">조회된 헌금 총액</p>
              <p className="text-2xl font-bold text-gray-900 currency">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">평균 헌금액</p>
              <p className="text-2xl font-bold text-gray-900 currency">
                {formatCurrency(filteredDonations.length > 0 ? totalAmount / filteredDonations.length : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">헌금 내역 필터</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">헌금 종류</label>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">헌금방법</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                className="input"
              >
                <option value="">전체</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setFilters({
                dateFrom: '', dateTo: '', donationTypeId: '',
                memberName: '', paymentMethod: '', amountMin: '', amountMax: ''
              })}
              className="btn btn-secondary"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* 헌금 등록/수정 폼 */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">
              {editingDonation ? '헌금 내역 수정' : '새 헌금 등록'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 교인 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  교인 선택
                </label>
                <select
                  value={formData.member_id}
                  onChange={(e) => {
                    setFormData({
                      ...formData, 
                      member_id: e.target.value,
                      donor_name: e.target.value ? '' : formData.donor_name
                    });
                  }}
                  className="input"
                >
                  <option value="">교인 선택 (비교인의 경우 공란)</option>
                  {members.map(member => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.member_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 비교인 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비교인 이름 (교인 미선택시)
                </label>
                <input
                  type="text"
                  value={formData.donor_name}
                  onChange={(e) => setFormData({...formData, donor_name: e.target.value})}
                  className="input"
                  placeholder="김방문자"
                  disabled={!!formData.member_id}
                />
              </div>

              {/* 헌금 종류 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  헌금 종류 *
                </label>
                <select
                  value={formData.donation_type_id}
                  onChange={(e) => setFormData({...formData, donation_type_id: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">헌금 종류 선택</option>
                  {donationTypes.map(type => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 헌금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  헌금액 * (원)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.amount ? formData.amount.toLocaleString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({...formData, amount: parseInt(value) || 0});
                    }}
                    className="input pr-12"
                    placeholder="100,000"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">원</span>
                  </div>
                </div>
                {formData.amount > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCurrency(formData.amount)}
                  </p>
                )}
              </div>

              {/* 헌금 날짜 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  헌금 날짜 *
                </label>
                <input
                  type="date"
                  value={formData.donation_date}
                  onChange={(e) => setFormData({...formData, donation_date: e.target.value})}
                  className="input"
                  required
                />
              </div>

              {/* 헌금방법 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  헌금방법
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="input"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* 메모 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input"
                  rows={2}
                  placeholder="추가 정보나 메모를 입력하세요..."
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : (editingDonation ? '수정' : '등록')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 헌금 목록 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">
            헌금 내역 ({filteredDonations.length}건)
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">헌금 내역을 불러오는 중...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 헌금이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>헌금자</th>
                  <th>종류</th>
                  <th>금액</th>
                  <th>헌금방법</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) => (
                  <tr key={donation.donation_id}>
                    <td className="font-medium">
                      {formatDate(donation.donation_date)}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">
                          {donation.member?.member_name || donation.donor_name || '익명'}
                        </span>
                        {!donation.member_id && donation.donor_name && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                            비교인
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                        {donation.donation_type?.type_name || '기타'}
                      </span>
                    </td>
                    <td className="font-bold text-green-600 currency">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td>
                      <div className="flex items-center text-gray-600">
                        {getPaymentMethodIcon(donation.payment_method)}
                        <span className="ml-2">{donation.payment_method}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(donation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(donation)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;