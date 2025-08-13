import React, { useState, useEffect } from 'react';
import { ChurchSession, Member, DonationType } from '../types';
import { supabase } from '../utils/supabase';
import { IDGenerator } from '../utils/idGenerator';
import { 
  Plus, 
  X,
  Check,
  Calendar,
  Users,
  DollarSign,
  Banknote,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MobileDonationProps {
  session: ChurchSession;
  onClose?: () => void;
  onSuccess?: () => void;
}

const MobileDonation: React.FC<MobileDonationProps> = ({ session, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: 헌금종류, 2: 헌금자, 3: 금액, 4: 확인
  const [members, setMembers] = useState<{member_id: string, member_name: string}[]>([]);
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    donation_type_id: '',
    donation_type_name: '',
    member_id: '',
    member_name: '',
    donor_name: '',
    amount: 0,
    donation_date: new Date().toISOString().split('T')[0],
    payment_method: '현금',
    notes: ''
  });

  // 자주 사용하는 금액
  const quickAmounts = [10000, 30000, 50000, 100000, 200000, 500000];

  useEffect(() => {
    loadInitialData();
  }, [session.churchId]);

  const loadInitialData = async () => {
    try {
      const [membersResult, typesResult] = await Promise.all([
        supabase
          .from('members')
          .select('member_id, member_name')
          .eq('church_id', session.churchId)
          .eq('status', 'active')
          .order('member_name') as any,
        
        supabase
          .from('donation_types')
          .select('*')
          .eq('church_id', session.churchId)
          .eq('is_active', true)
          .order('sort_order')
      ]);

      setMembers(membersResult.data || []);
      setDonationTypes(typesResult.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.donation_type_id || formData.amount <= 0) {
      alert('헌금 종류와 금액을 확인해주세요.');
      return;
    }

    if (!formData.member_id && !formData.donor_name.trim()) {
      alert('헌금자를 선택하거나 이름을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
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

      alert('헌금이 등록되었습니다.');
      onSuccess?.();
      handleReset();
      
    } catch (err: any) {
      console.error('Donation save error:', err);
      alert('저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      donation_type_id: '',
      donation_type_name: '',
      member_id: '',
      member_name: '',
      donor_name: '',
      amount: 0,
      donation_date: new Date().toISOString().split('T')[0],
      payment_method: '현금',
      notes: ''
    });
    setStep(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-center">헌금 종류 선택</h3>
      <div className="grid grid-cols-2 gap-3">
        {donationTypes.map(type => (
          <button
            key={type.type_id}
            onClick={() => {
              setFormData({
                ...formData,
                donation_type_id: type.type_id,
                donation_type_name: type.type_name
              });
              setStep(2);
            }}
            className={`p-4 border-2 rounded-lg transition-all ${
              formData.donation_type_id === type.type_id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-sm font-medium">{type.type_name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-center">헌금자 선택</h3>
      
      {/* 교인 검색 */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="교인 이름 검색..."
          className="w-full px-4 py-3 text-lg border rounded-lg"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = members.filter(m => 
              m.member_name.toLowerCase().includes(searchTerm)
            );
            // 검색 결과 표시 로직
          }}
        />
        
        {/* 자주 선택되는 교인 (최근 헌금자) */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {members.slice(0, 10).map(member => (
            <button
              key={member.member_id}
              onClick={() => {
                setFormData({
                  ...formData,
                  member_id: member.member_id,
                  member_name: member.member_name,
                  donor_name: ''
                });
                setStep(3);
              }}
              className="w-full p-3 text-left border rounded-lg hover:bg-gray-50"
            >
              <Users className="inline w-4 h-4 mr-2 text-gray-400" />
              {member.member_name}
            </button>
          ))}
        </div>

        {/* 비교인 */}
        <div className="pt-3 border-t">
          <p className="text-sm text-gray-600 mb-2">비교인인 경우 이름 직접 입력</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="헌금자 이름"
              value={formData.donor_name}
              onChange={(e) => setFormData({
                ...formData,
                donor_name: e.target.value,
                member_id: '',
                member_name: ''
              })}
              className="flex-1 px-4 py-3 text-lg border rounded-lg"
            />
            <button
              onClick={() => {
                if (formData.donor_name.trim()) {
                  setStep(3);
                }
              }}
              disabled={!formData.donor_name.trim()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-center">헌금 정보 입력</h3>
      
      {/* 금액 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">헌금액</label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={formData.amount ? formData.amount.toLocaleString() : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({...formData, amount: parseInt(value) || 0});
            }}
            className="w-full px-4 py-4 text-2xl font-bold text-center border-2 rounded-lg"
            placeholder="0"
          />
          {formData.amount > 0 && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {formatCurrency(formData.amount)}
            </p>
          )}
        </div>
      </div>

      {/* 빠른 금액 선택 */}
      <div className="grid grid-cols-3 gap-2">
        {quickAmounts.map(amount => (
          <button
            key={amount}
            onClick={() => setFormData({...formData, amount})}
            className="p-3 border rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            {amount >= 10000 ? `${amount/10000}만원` : `${amount.toLocaleString()}원`}
          </button>
        ))}
      </div>

      {/* 헌금방법 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">헌금방법</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormData({...formData, payment_method: '현금'})}
            className={`p-4 border-2 rounded-lg flex items-center justify-center ${
              formData.payment_method === '현금'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300'
            }`}
          >
            <Banknote className="w-5 h-5 mr-2" />
            현금
          </button>
          <button
            onClick={() => setFormData({...formData, payment_method: '온라인'})}
            className={`p-4 border-2 rounded-lg flex items-center justify-center ${
              formData.payment_method === '온라인'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300'
            }`}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            온라인
          </button>
        </div>
      </div>

      {/* 날짜 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">헌금 날짜</label>
        <input
          type="date"
          value={formData.donation_date}
          onChange={(e) => setFormData({...formData, donation_date: e.target.value})}
          className="w-full px-4 py-3 border rounded-lg"
        />
      </div>

      {/* 메모 (선택) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">메모 (선택)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-4 py-3 border rounded-lg"
          rows={2}
          placeholder="추가 정보..."
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-center">헌금 내용 확인</h3>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">헌금 종류</span>
          <span className="font-medium">{formData.donation_type_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">헌금자</span>
          <span className="font-medium">
            {formData.member_name || formData.donor_name || '익명'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">헌금액</span>
          <span className="font-bold text-lg text-green-600">
            {formatCurrency(formData.amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">헌금방법</span>
          <span className="font-medium">{formData.payment_method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">날짜</span>
          <span className="font-medium">{formData.donation_date}</span>
        </div>
        {formData.notes && (
          <div className="pt-2 border-t">
            <span className="text-gray-600 text-sm">메모: {formData.notes}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-4 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        {isLoading ? '저장 중...' : '헌금 등록하기'}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else if (onClose) {
              onClose();
            }
          }}
          className="p-2"
        >
          {step > 1 ? (
            <ChevronLeft className="w-6 h-6" />
          ) : (
            <X className="w-6 h-6" />
          )}
        </button>
        
        <h2 className="text-lg font-bold">헌금 등록</h2>
        
        <button
          onClick={handleReset}
          className="p-2 text-gray-500"
        >
          초기화
        </button>
      </div>

      {/* 진행 표시 */}
      <div className="px-4 py-2 bg-gray-50">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map(num => (
            <div
              key={num}
              className={`flex-1 h-2 mx-1 rounded-full ${
                num <= step ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span className={step === 1 ? 'font-bold' : ''}>종류</span>
          <span className={step === 2 ? 'font-bold' : ''}>헌금자</span>
          <span className={step === 3 ? 'font-bold' : ''}>정보</span>
          <span className={step === 4 ? 'font-bold' : ''}>확인</span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* 하단 버튼 */}
      <div className="p-4 border-t bg-white safe-bottom">
        {step < 4 && step > 1 && (
          <button
            onClick={() => {
              if (step === 3 && formData.amount > 0) {
                setStep(4);
              }
            }}
            disabled={step === 3 && formData.amount === 0}
            className="w-full py-4 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileDonation;