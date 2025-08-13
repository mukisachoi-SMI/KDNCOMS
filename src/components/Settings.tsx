import React, { useState, useEffect } from 'react';
import { ChurchSession, Church, DonationType, Position, PositionStatus } from '../types';
import { supabase } from '../utils/supabase';
import ChurchLogoUpload from './ChurchLogoUpload';
import { 
  Church as ChurchIcon, 
  DollarSign, 
  Users, 
  Shield, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Phone,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface SettingsProps {
  session: ChurchSession;
}

interface TabData {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

const Settings: React.FC<SettingsProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState('church');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 교회 정보 상태
  const [churchLogo, setChurchLogo] = useState<string>('');
  const [churchInfo, setChurchInfo] = useState<Partial<Church>>({
    church_name: session.churchName || '',
    email: session.email || '',
    church_address: '',
    church_phone: '',
    kakao_id: ''
  });

  // 헌금 종류 상태
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [newDonationType, setNewDonationType] = useState({ type_name: '', type_code: '' });

  // 직분 상태
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPosition, setNewPosition] = useState({ position_name: '', position_code: '' });

  // 직분 상태 관리
  const [positionStatuses, setPositionStatuses] = useState<PositionStatus[]>([]);
  const [newPositionStatus, setNewPositionStatus] = useState({ 
    status_name: '', 
    status_code: '' 
  });

  const tabs: TabData[] = [
    { id: 'church', name: '교회 정보', icon: ChurchIcon },
    { id: 'donations', name: '헌금 종류', icon: DollarSign },
    { id: 'positions', name: '직분 관리', icon: Users },
    { id: 'statuses', name: '직분 상태', icon: Shield }
  ];

  useEffect(() => {
    console.log('Settings mounted with session:', session);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 교회 정보 로드
      await loadChurchInfo();
      
      // 헌금 종류 로드
      await loadDonationTypes();
      
      // 직분 정보 로드
      await loadPositions();
      
      // 직분 상태 로드
      await loadPositionStatuses();
      
    } catch (error) {
      console.error('Failed to load data:', error);
      showMessage('error', '데이터 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChurchInfo = async () => {
    try {
      console.log('Loading church info for church_id:', session.churchId);
      
      // churches 테이블에서 데이터 가져오기
      const { data, error } = await supabase
        .from('churches')
        .select('*')  // 모든 필드 가져오기
        .eq('church_id', session.churchId)
        .single();

      console.log('Supabase query result:', { data, error });

      if (error) {
        console.error('Error loading church info:', error);
        // 에러 시 기본값 설정
        setChurchInfo({
          church_id: session.churchId,
          church_name: session.churchName || '',
          email: session.email || '',
          church_phone: '',
          church_address: '',
          kakao_id: ''
        });
        showMessage('error', '교회 정보를 불러올 수 없습니다.');
        return;
      }

      if (data) {
        console.log('Church data loaded successfully:', data);
        // 데이터 설정
        setChurchInfo({
          church_id: data.church_id,
          church_name: data.church_name || '',
          email: data.email || '',
          church_phone: data.church_phone || '',
          church_address: data.church_address || '',
          kakao_id: data.kakao_id || ''
        });
        // 로고 URL도 설정
        if (data.logo_url) {
          setChurchLogo(data.logo_url);
        }
      }
    } catch (error) {
      console.error('Exception in loadChurchInfo:', error);
      setChurchInfo({
        church_id: session.churchId,
        church_name: session.churchName || '',
        email: session.email || '',
        church_phone: '',
        church_address: '',
        kakao_id: ''
      });
      showMessage('error', '교회 정보 로드 중 오류가 발생했습니다.');
    }
  };

  const loadDonationTypes = async () => {
    try {
      console.log('Loading donation types for:', session.churchId);
      
      const { data, error } = await supabase
        .from('donation_types')
        .select('*')
        .eq('church_id', session.churchId)
        .order('sort_order', { ascending: true });

      console.log('Donation types query result:', { data, error });

      if (error) {
        console.error('Donation types load error:', error);
        // 에러 시 기본 데이터 사용
        setDefaultDonationTypes();
        return;
      }

      if (data && data.length > 0) {
        setDonationTypes(data);
      } else {
        // 데이터가 없으면 기본 헌금 종류 생성
        console.log('No donation types found, creating defaults');
        await createDefaultDonationTypes();
      }
    } catch (error) {
      console.error('Failed to load donation types:', error);
      setDefaultDonationTypes();
    }
  };

  const loadPositions = async () => {
    try {
      console.log('Loading positions for:', session.churchId);
      
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('church_id', session.churchId)
        .order('sort_order', { ascending: true });

      console.log('Positions query result:', { data, error });

      if (error) {
        console.error('Positions load error:', error);
        setDefaultPositions();
        return;
      }

      if (data && data.length > 0) {
        setPositions(data);
      } else {
        console.log('No positions found, creating defaults');
        await createDefaultPositions();
      }
    } catch (error) {
      console.error('Failed to load positions:', error);
      setDefaultPositions();
    }
  };

  const loadPositionStatuses = async () => {
    try {
      console.log('Loading position statuses for:', session.churchId);
      
      const { data, error } = await supabase
        .from('position_statuses')
        .select('*')
        .eq('church_id', session.churchId)
        .order('sort_order', { ascending: true });

      console.log('Position statuses query result:', { data, error });

      if (error) {
        console.error('Position statuses load error:', error);
        setDefaultPositionStatuses();
        return;
      }

      if (data && data.length > 0) {
        setPositionStatuses(data);
      } else {
        console.log('No position statuses found, creating defaults');
        await createDefaultPositionStatuses();
      }
    } catch (error) {
      console.error('Failed to load position statuses:', error);
      setDefaultPositionStatuses();
    }
  };

  const createDefaultDonationTypes = async () => {
    const defaultTypes = getDefaultDonationTypes();
    
    try {
      console.log('Creating default donation types:', defaultTypes);
      
      const { data, error } = await supabase
        .from('donation_types')
        .insert(defaultTypes)
        .select();
      
      console.log('Create donation types result:', { data, error });
      
      if (error) {
        console.error('Create donation types error:', error);
        setDefaultDonationTypes();
        return;
      }
      
      if (data) {
        setDonationTypes(data);
      }
    } catch (error) {
      console.error('Failed to create default donation types:', error);
      setDefaultDonationTypes();
    }
  };

  const createDefaultPositions = async () => {
    const defaultPositions = getDefaultPositions();
    
    try {
      console.log('Creating default positions:', defaultPositions);
      
      const { data, error } = await supabase
        .from('positions')
        .insert(defaultPositions)
        .select();
      
      console.log('Create positions result:', { data, error });
      
      if (error) {
        console.error('Create positions error:', error);
        setDefaultPositions();
        return;
      }
      
      if (data) {
        setPositions(data);
      }
    } catch (error) {
      console.error('Failed to create default positions:', error);
      setDefaultPositions();
    }
  };

  const createDefaultPositionStatuses = async () => {
    const defaultStatuses = getDefaultPositionStatuses();
    
    try {
      console.log('Creating default position statuses:', defaultStatuses);
      
      const { data, error } = await supabase
        .from('position_statuses')
        .insert(defaultStatuses)
        .select()
        .order('sort_order', { ascending: true });
      
      console.log('Create position statuses result:', { data, error });
      
      if (error) {
        console.error('Create position statuses error:', error);
        setDefaultPositionStatuses();
        return;
      }
      
      if (data) {
        setPositionStatuses(data);
      }
    } catch (error) {
      console.error('Failed to create default position statuses:', error);
      setDefaultPositionStatuses();
    }
  };

  const getDefaultDonationTypes = () => {
    return [
      { church_id: session.churchId, type_name: '주정헌금', type_code: 'WEEKLY_OFFERING', is_active: true, sort_order: 1 },
      { church_id: session.churchId, type_name: '감사헌금', type_code: 'THANKSGIVING', is_active: true, sort_order: 2 },
      { church_id: session.churchId, type_name: '십일조', type_code: 'TITHE', is_active: true, sort_order: 3 },
      { church_id: session.churchId, type_name: '선교헌금', type_code: 'MISSION', is_active: true, sort_order: 4 },
      { church_id: session.churchId, type_name: '절기헌금', type_code: 'SEASONAL', is_active: true, sort_order: 5 },
      { church_id: session.churchId, type_name: '건축헌금', type_code: 'BUILDING', is_active: true, sort_order: 6 },
      { church_id: session.churchId, type_name: '임직헌금', type_code: 'ORDINATION', is_active: true, sort_order: 7 },
      { church_id: session.churchId, type_name: '장학헌금', type_code: 'SCHOLARSHIP', is_active: true, sort_order: 8 },
      { church_id: session.churchId, type_name: '주일헌금', type_code: 'SUNDAY_OFFERING', is_active: true, sort_order: 9 },
      { church_id: session.churchId, type_name: '목적헌금', type_code: 'PURPOSE_OFFERING', is_active: true, sort_order: 10 }
    ];
  };

  const getDefaultPositions = () => {
    return [
      { church_id: session.churchId, position_name: '목사', position_code: 'PASTOR', is_active: true, sort_order: 1 },
      { church_id: session.churchId, position_name: '부목사', position_code: 'ASSOC_PASTOR', is_active: true, sort_order: 2 },
      { church_id: session.churchId, position_name: '전도사', position_code: 'EVANGELIST', is_active: true, sort_order: 3 },
      { church_id: session.churchId, position_name: '장로', position_code: 'ELDER', is_active: true, sort_order: 4 },
      { church_id: session.churchId, position_name: '권사', position_code: 'DEACONESS', is_active: true, sort_order: 5 },
      { church_id: session.churchId, position_name: '안수집사', position_code: 'ORDAINED_DEACON', is_active: true, sort_order: 6 },
      { church_id: session.churchId, position_name: '집사', position_code: 'DEACON', is_active: true, sort_order: 7 },
      { church_id: session.churchId, position_name: '성도', position_code: 'MEMBER', is_active: true, sort_order: 8 }
    ];
  };

  const getDefaultPositionStatuses = () => {
    return [
      { church_id: session.churchId, status_name: '시무', status_code: 'ACTIVE', is_active: true, sort_order: 1 },
      { church_id: session.churchId, status_name: '청년', status_code: 'YOUNG', is_active: true, sort_order: 2 },
      { church_id: session.churchId, status_name: '은퇴', status_code: 'RETIRED', is_active: true, sort_order: 3 },
      { church_id: session.churchId, status_name: '협동', status_code: 'ASSOCIATE', is_active: true, sort_order: 4 },
      { church_id: session.churchId, status_name: '원로', status_code: 'EMERITUS', is_active: true, sort_order: 5 },
      { church_id: session.churchId, status_name: '직원', status_code: 'STAFF', is_active: true, sort_order: 6 }
    ];
  };

  const setDefaultDonationTypes = () => {
    const types = getDefaultDonationTypes().map((type, index) => ({
      ...type,
      type_id: `dt_local_${Date.now()}_${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    setDonationTypes(types);
  };

  const setDefaultPositions = () => {
    const positions = getDefaultPositions().map((pos, index) => ({
      ...pos,
      position_id: `pos_local_${Date.now()}_${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    setPositions(positions);
  };

  const setDefaultPositionStatuses = () => {
    const statuses = getDefaultPositionStatuses().map((status, index) => ({
      ...status,
      status_id: `st_local_${Date.now()}_${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    setPositionStatuses(statuses);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const saveChurchInfo = async () => {
    setIsLoading(true);
    try {
      console.log('Saving church info:', churchInfo);
      console.log('Church ID:', session.churchId);
      
      // 업데이트할 데이터 준비
      const updateData = {
        church_name: churchInfo.church_name || session.churchName,
        email: churchInfo.email || session.email,
        church_phone: churchInfo.church_phone || null,
        church_address: churchInfo.church_address || null,
        kakao_id: churchInfo.kakao_id || null,
        updated_at: new Date().toISOString()
      };

      console.log('Updating with data:', updateData);

      // Supabase에 업데이트
      const { data, error } = await supabase
        .from('churches')
        .update(updateData)
        .eq('church_id', session.churchId)
        .select();

      console.log('Supabase update result:', { data, error });

      if (error) {
        console.error('Update error:', error);
        // 필드가 없다는 에러인 경우 사용자에게 안내
        if (error.message && error.message.includes('column')) {
          showMessage('error', 'DB에 필드가 없습니다. SQL 스크립트를 실행해주세요.');
        } else {
          showMessage('error', `저장 실패: ${error.message}`);
        }
        return;
      }

      // 성공적으로 저장됨
      showMessage('success', '교회 정보가 저장되었습니다.');
      
      // 저장 후 다시 로드하여 화면 업데이트
      await loadChurchInfo();
      
    } catch (error: any) {
      console.error('Exception in saveChurchInfo:', error);
      showMessage('error', `저장 중 오류: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addDonationType = async () => {
    if (!newDonationType.type_name.trim()) {
      showMessage('error', '헌금 종류명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const insertData = {
        church_id: session.churchId,
        type_name: newDonationType.type_name.trim(),
        type_code: newDonationType.type_code.trim() || 
                   newDonationType.type_name.trim().toUpperCase().replace(/\s+/g, '_'),
        is_active: true,
        sort_order: donationTypes.length + 1
      };

      console.log('Inserting donation type:', insertData);

      const { data, error } = await supabase
        .from('donation_types')
        .insert(insertData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      if (data) {
        setDonationTypes([...donationTypes, data]);
        setNewDonationType({ type_name: '', type_code: '' });
        showMessage('success', '헌금 종류가 추가되었습니다.');
      }
    } catch (error: any) {
      console.error('Failed to add donation type:', error);
      showMessage('error', `헌금 종류 추가 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDonationType = async (typeId: string) => {
    // 로컬 데이터인 경우
    if (typeId.startsWith('dt_local_')) {
      setDonationTypes(donationTypes.filter(type => type.type_id !== typeId));
      showMessage('success', '헌금 종류가 삭제되었습니다.');
      return;
    }

    if (!window.confirm('이 헌금 종류를 삭제하시겠습니까?\n관련된 헌금 기록이 있다면 삭제할 수 없습니다.')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('donation_types')
        .delete()
        .eq('type_id', typeId)
        .eq('church_id', session.churchId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setDonationTypes(donationTypes.filter(type => type.type_id !== typeId));
      showMessage('success', '헌금 종류가 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to remove donation type:', error);
      showMessage('error', `헌금 종류 삭제 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addPosition = async () => {
    if (!newPosition.position_name.trim()) {
      showMessage('error', '직분명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const insertData = {
        church_id: session.churchId,
        position_name: newPosition.position_name.trim(),
        position_code: newPosition.position_code.trim() || 
                      newPosition.position_name.trim().toUpperCase().replace(/\s+/g, '_'),
        is_active: true,
        sort_order: positions.length + 1
      };

      console.log('Inserting position:', insertData);

      const { data, error } = await supabase
        .from('positions')
        .insert(insertData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      if (data) {
        setPositions([...positions, data]);
        setNewPosition({ position_name: '', position_code: '' });
        showMessage('success', '직분이 추가되었습니다.');
      }
    } catch (error: any) {
      console.error('Failed to add position:', error);
      showMessage('error', `직분 추가 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removePosition = async (positionId: string) => {
    // 로컬 데이터인 경우
    if (positionId.startsWith('pos_local_')) {
      setPositions(positions.filter(pos => pos.position_id !== positionId));
      showMessage('success', '직분이 삭제되었습니다.');
      return;
    }

    if (!window.confirm('이 직분을 삭제하시겠습니까?\n관련된 교인 정보가 있다면 삭제할 수 없습니다.')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('position_id', positionId)
        .eq('church_id', session.churchId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setPositions(positions.filter(pos => pos.position_id !== positionId));
      showMessage('success', '직분이 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to remove position:', error);
      showMessage('error', `직분 삭제 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addPositionStatus = async () => {
    if (!newPositionStatus.status_name.trim()) {
      showMessage('error', '직분 상태명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const insertData = {
        church_id: session.churchId,
        status_name: newPositionStatus.status_name.trim(),
        status_code: newPositionStatus.status_code.trim() || 
                    newPositionStatus.status_name.trim().toUpperCase().replace(/\s+/g, '_'),
        is_active: true,
        sort_order: positionStatuses.length + 1
      };

      console.log('Inserting position status:', insertData);

      const { data, error } = await supabase
        .from('position_statuses')
        .insert(insertData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      if (data) {
        setPositionStatuses([...positionStatuses, data]);
        setNewPositionStatus({ status_name: '', status_code: '' });
        showMessage('success', '직분 상태가 추가되었습니다.');
      }
    } catch (error: any) {
      console.error('Failed to add position status:', error);
      showMessage('error', `직분 상태 추가 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removePositionStatus = async (statusId: string) => {
    // 로컬 데이터인 경우
    if (statusId.startsWith('st_local_')) {
      setPositionStatuses(positionStatuses.filter(status => status.status_id !== statusId));
      showMessage('success', '직분 상태가 삭제되었습니다.');
      return;
    }

    if (!window.confirm('이 직분 상태를 삭제하시겠습니까?\n관련된 교인 정보가 있다면 삭제할 수 없습니다.')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('position_statuses')
        .delete()
        .eq('status_id', statusId)
        .eq('church_id', session.churchId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setPositionStatuses(positionStatuses.filter(status => status.status_id !== statusId));
      showMessage('success', '직분 상태가 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to remove position status:', error);
      showMessage('error', `직분 상태 삭제 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChurchInfo = () => {
    console.log('Rendering church info with data:', churchInfo);
    
    return (
      <div className="space-y-6">
        {/* 교회 로고 업로드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">교회 로고</h3>
          <ChurchLogoUpload
            churchId={session.churchId}
            currentLogoUrl={churchLogo}
            onUploadSuccess={(url) => {
              setChurchLogo(url);
              // 세션 업데이트는 ChurchLogoUpload 컴포넌트에서 처리됨
            }}
          />
        </div>

        {/* 교회 기본 정보 입력 폼 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">교회 기본 정보</h3>
            <button
              onClick={loadChurchInfo}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* 교회명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                교회명
              </label>
              <input
                type="text"
                value={churchInfo.church_name || ''}
                onChange={(e) => setChurchInfo(prev => ({...prev, church_name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="교회명을 입력하세요"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={churchInfo.email || ''}
                onChange={(e) => setChurchInfo(prev => ({...prev, email: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
              />
            </div>

            {/* 전화번호 - 새로 추가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={churchInfo.church_phone || ''}
                  onChange={(e) => setChurchInfo(prev => ({...prev, church_phone: e.target.value}))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 02-1234-5678"
                />
              </div>
            </div>

            {/* 카카오톡 ID - 새로 추가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카카오톡 ID
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={churchInfo.kakao_id || ''}
                  onChange={(e) => setChurchInfo(prev => ({...prev, kakao_id: e.target.value}))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="카카오톡 오픈채팅 또는 플러스친구 ID"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                오픈채팅방 ID 또는 카카오톡 채널 ID를 입력하세요
              </p>
            </div>

            {/* 주소 - 새로 추가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={churchInfo.church_address || ''}
                  onChange={(e) => setChurchInfo(prev => ({...prev, church_address: e.target.value}))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="교회 주소를 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveChurchInfo}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 저장된 교회 정보 표시 카드 */}
        {(churchInfo.church_phone || churchInfo.kakao_id || churchInfo.church_address) && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-4">저장된 교회 연락처 정보</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {churchInfo.church_phone && (
                <div className="flex items-start">
                  <Phone className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <span className="text-xs text-blue-600 font-medium">전화번호</span>
                    <p className="text-sm text-blue-900">{churchInfo.church_phone}</p>
                  </div>
                </div>
              )}
              {churchInfo.kakao_id && (
                <div className="flex items-start">
                  <MessageCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <span className="text-xs text-blue-600 font-medium">카카오톡</span>
                    <p className="text-sm text-blue-900">{churchInfo.kakao_id}</p>
                  </div>
                </div>
              )}
              {churchInfo.church_address && (
                <div className="flex items-start md:col-span-2">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <span className="text-xs text-blue-600 font-medium">주소</span>
                    <p className="text-sm text-blue-900">{churchInfo.church_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 데이터가 없을 때 안내 메시지 */}
        {!churchInfo.church_phone && !churchInfo.kakao_id && !churchInfo.church_address && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-1">연락처 정보를 입력해주세요</h4>
              <p className="text-xs text-gray-500">
                교회 전화번호, 카카오톡 ID, 주소 등을 입력하여 교인들과 소통하세요.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 직분 상태 순서 수정 함수
  const fixPositionStatusOrder = async () => {
    setIsLoading(true);
    try {
      // 청년 상태 추가 (없으면)
      const hasYoung = positionStatuses.some(s => s.status_code === 'YOUNG');
      if (!hasYoung) {
        await supabase
          .from('position_statuses')
          .insert({
            church_id: session.churchId,
            status_name: '청년',
            status_code: 'YOUNG',
            is_active: true,
            sort_order: 2
          });
      }

      // 순서 업데이트
      const updates = [
        { code: 'ACTIVE', order: 1 },
        { code: 'YOUNG', order: 2 },
        { code: 'RETIRED', order: 3 },
        { code: 'ASSOCIATE', order: 4 },
        { code: 'EMERITUS', order: 5 },
        { code: 'STAFF', order: 6 }
      ];

      for (const update of updates) {
        await supabase
          .from('position_statuses')
          .update({ sort_order: update.order })
          .eq('church_id', session.churchId)
          .eq('status_code', update.code);
      }

      // 다시 로드
      await loadPositionStatuses();
      showMessage('success', '직분 상태 순서가 수정되었습니다.');
    } catch (error: any) {
      console.error('Failed to fix position status order:', error);
      showMessage('error', `순서 수정 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPositionStatuses = () => (
    <div className="space-y-6">
      {/* 순서 수정 버튼 */}
      {/* {positionStatuses.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-yellow-900">직분 상태 순서 확인</h4>
              <p className="text-xs text-yellow-700 mt-1">
                올바른 순서: 시무 → 청년 → 은퇴 → 협동 → 원로 → 직원
              </p>
            </div>
            <button
              onClick={fixPositionStatusOrder}
              disabled={isLoading}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              순서 자동 정렬
            </button>
          </div>
        </div>
      )} */}

      {/* 새 직분 상태 추가 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">직분 상태 추가</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직분 상태명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newPositionStatus.status_name}
              onChange={(e) => setNewPositionStatus({...newPositionStatus, status_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 임시"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코드 (선택)
            </label>
            <input
              type="text"
              value={newPositionStatus.status_code}
              onChange={(e) => setNewPositionStatus({...newPositionStatus, status_code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: TEMPORARY (자동생성)"
            />
          </div>
        </div>

        <button
          onClick={addPositionStatus}
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          추가
        </button>
      </div>

      {/* 기존 직분 상태 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">현재 직분 상태 목록</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직분 상태명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positionStatuses.map((status) => (
                <tr key={status.status_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {status.status_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status.status_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      status.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {status.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removePositionStatus(status.status_id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {positionStatuses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    직분 상태가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDonationTypes = () => (
    <div className="space-y-6">
      {/* 새 헌금 종류 추가 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">헌금 종류 추가</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              헌금 종류명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newDonationType.type_name}
              onChange={(e) => setNewDonationType({...newDonationType, type_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 특별헌금"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코드 (선택)
            </label>
            <input
              type="text"
              value={newDonationType.type_code}
              onChange={(e) => setNewDonationType({...newDonationType, type_code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: SPECIAL (자동생성)"
            />
          </div>
        </div>

        <button
          onClick={addDonationType}
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          추가
        </button>
      </div>

      {/* 기존 헌금 종류 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">현재 헌금 종류</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  헌금 종류명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donationTypes.map((type) => (
                <tr key={type.type_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {type.type_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.type_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      type.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {type.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removeDonationType(type.type_id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {donationTypes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    헌금 종류가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPositions = () => (
    <div className="space-y-6">
      {/* 새 직분 추가 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">직분 추가</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직분명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newPosition.position_name}
              onChange={(e) => setNewPosition({...newPosition, position_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 협동목사"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코드 (선택)
            </label>
            <input
              type="text"
              value={newPosition.position_code}
              onChange={(e) => setNewPosition({...newPosition, position_code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: COOP_PASTOR (자동생성)"
            />
          </div>
        </div>

        <button
          onClick={addPosition}
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          추가
        </button>
      </div>

      {/* 기존 직분 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">현재 직분 목록</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직분명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map((position) => (
                <tr key={position.position_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {position.position_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.position_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      position.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {position.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removePosition(position.position_id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    직분이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* 메시지 알림 */}
      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {isLoading && activeTab === 'church' ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'church' && renderChurchInfo()}
          {activeTab === 'donations' && renderDonationTypes()}
          {activeTab === 'positions' && renderPositions()}
          {activeTab === 'statuses' && renderPositionStatuses()}
        </>
      )}
    </div>
  );
};

export default Settings;