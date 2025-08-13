import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChurchSession, Member, MemberFormData, Position, PositionStatus } from '../types';
import { supabase } from '../utils/supabase';
import { IDGenerator } from '../utils/idGenerator';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  User,
  Mail,
  MoreVertical,
  ChevronRight,
  Save,
  UserPlus,
  Briefcase,
  Home,
  FileText,
  CheckCircle,
  UserCheck,
  Activity
} from 'lucide-react';

interface MembersProps {
  session: ChurchSession;
}

interface MemberFilters {
  searchTerm: string;
  positionId: string;
  positionStatusId: string;
  hasPhone: string;
  hasAddress: string;
}

const Members: React.FC<MembersProps> = ({ session }) => {
  const location = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionStatuses, setPositionStatuses] = useState<PositionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<MemberFormData>({
    member_name: '',
    phone: '',
    address: '',
    birth_date: '',
    position_id: '',
    position_status_id: '',
    notes: ''
  });

  const [filters, setFilters] = useState<MemberFilters>({
    searchTerm: '',
    positionId: '',
    positionStatusId: '',
    hasPhone: '',
    hasAddress: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          loadMembers(),
          loadPositions(),
          loadPositionStatuses()
        ]);
      } catch (err) {
        console.error('Initial data loading error:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [session.churchId]);

  // 대시보드에서 교인등록 버튼을 통해 왔을 경우 자동으로 폼 열기
  useEffect(() => {
    if (location.state && (location.state as any).openAddMember) {
      setShowAddForm(true);
      // state 초기화 (다시 돌아왔을 때 자동으로 열리지 않도록)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadMembers(),
        loadPositions(),
        loadPositionStatuses()
      ]);
    } catch (err) {
      console.error('Initial data loading error:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('church_id', session.churchId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPositions(data || []);
    } catch (err) {
      console.error('Failed to load positions:', err);
      setPositions([]);
    }
  };

  const loadPositionStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('position_statuses')
        .select('*')
        .eq('church_id', session.churchId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPositionStatuses(data || []);
    } catch (err) {
      console.error('Failed to load position statuses:', err);
      setPositionStatuses([]);
    }
  };

  const loadMembers = async () => {
    try {
      setError('');
      const { data, error: queryError } = await supabase
        .from('members')
        .select(`
          *,
          position:positions(position_name),
          position_status:position_statuses(status_name)
        `)
        .eq('church_id', session.churchId)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setMembers(data || []);
    } catch (err: any) {
      console.error('Members loading error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.member_name.trim()) {
      alert('교인명은 필수 입력 항목입니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const cleanFormData = {
        ...formData,
        position_id: formData.position_id || null,
        position_status_id: formData.position_status_id || null,
        phone: formData.phone || null,
        address: formData.address || null,
        birth_date: formData.birth_date || null,
        notes: formData.notes || null
      };

      if (editingMember) {
        const { error } = await supabase
          .from('members')
          .update({
            ...cleanFormData,
            updated_at: new Date().toISOString()
          })
          .eq('member_id', editingMember.member_id)
          .eq('church_id', session.churchId);

        if (error) throw error;
      } else {
        const memberId = await IDGenerator.generateMemberId(session.churchId);
        
        const { error } = await supabase
          .from('members')
          .insert({
            member_id: memberId,
            church_id: session.churchId,
            ...cleanFormData,
            register_date: new Date().toISOString().split('T')[0],
            status: 'active'
          });

        if (error) throw error;
      }

      resetForm();
      await loadMembers();
      
    } catch (err: any) {
      console.error('Member save error:', err);
      alert('저장에 실패했습니다: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      member_name: member.member_name,
      phone: member.phone || '',
      address: member.address || '',
      birth_date: member.birth_date || '',
      position_id: (member as any).position_id || '',
      position_status_id: (member as any).position_status_id || '',
      notes: member.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (member: Member) => {
    if (!window.confirm(`${member.member_name}님을 정말 삭제하시겠습니까?`)) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('members')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('member_id', member.member_id)
        .eq('church_id', session.churchId);

      if (error) throw error;
      await loadMembers();
    } catch (err: any) {
      console.error('Member delete error:', err);
      alert('삭제에 실패했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      member_name: '',
      phone: '',
      address: '',
      birth_date: '',
      position_id: '',
      position_status_id: '',
      notes: ''
    });
    setEditingMember(null);
    setShowAddForm(false);
  };

  // 필터링된 교인 목록
  const filteredMembers = members.filter(member => {
    if (member.status !== 'active') return false;
    
    // 검색어 필터
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const nameMatch = member.member_name.toLowerCase().includes(searchLower);
      const phoneMatch = member.phone && member.phone.includes(filters.searchTerm);
      if (!nameMatch && !phoneMatch) return false;
    }
    
    // 직분 필터
    if (filters.positionId && (member as any).position_id !== filters.positionId) return false;
    
    // 직분 상태 필터
    if (filters.positionStatusId && (member as any).position_status_id !== filters.positionStatusId) return false;
    
    // 전화번호 유무 필터
    if (filters.hasPhone === 'yes' && !member.phone) return false;
    if (filters.hasPhone === 'no' && member.phone) return false;
    
    // 주소 유무 필터
    if (filters.hasAddress === 'yes' && !member.address) return false;
    if (filters.hasAddress === 'no' && member.address) return false;
    
    return true;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  const getPositionName = (member: any) => {
    if (member.position && member.position.position_name) {
      return member.position.position_name;
    }
    const position = positions.find(p => p.position_id === member.position_id);
    return position ? position.position_name : '';
  };

  const getPositionStatusName = (member: any) => {
    if (member.position_status && member.position_status.status_name) {
      return member.position_status.status_name;
    }
    const status = positionStatuses.find(s => s.status_id === member.position_status_id);
    return status ? status.status_name : '';
  };

  // 통계 계산
  const stats = {
    totalMembers: filteredMembers.length,
    // 항존직: 장로, 권사, 안수집사
    permanentPositions: filteredMembers.filter(m => {
      const positionName = getPositionName(m);
      return positionName === '장로' || positionName === '권사' || positionName === '안수집사';
    }).length,
    // 다음세대: 직분상태가 '청년'인 경우
    nextGeneration: filteredMembers.filter(m => {
      const statusName = getPositionStatusName(m);
      return statusName === '청년';
    }).length
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">교인 관리</h2>
            <p className="text-gray-600">교인 정보를 등록하고 관리합니다</p>
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
            onClick={loadMembers}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            교인 등록
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
            <Users className="w-8 h-8 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">전체 교인</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}명</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">항존직</p>
              <p className="text-2xl font-bold text-gray-900">{stats.permanentPositions}명</p>
              <p className="text-xs text-gray-400 mt-1">장로, 권사, 안수집사</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">다음세대</p>
              <p className="text-2xl font-bold text-gray-900">{stats.nextGeneration}명</p>
              <p className="text-xs text-gray-400 mt-1">청년</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">교인 검색 필터</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색어</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="input"
                placeholder="이름, 전화번호"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직분</label>
              <select
                value={filters.positionId}
                onChange={(e) => setFilters({...filters, positionId: e.target.value})}
                className="input"
              >
                <option value="">전체</option>
                {positions.map(position => (
                  <option key={position.position_id} value={position.position_id}>
                    {position.position_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직분 상태</label>
              <select
                value={filters.positionStatusId}
                onChange={(e) => setFilters({...filters, positionStatusId: e.target.value})}
                className="input"
              >
                <option value="">전체</option>
                {positionStatuses.map(status => (
                  <option key={status.status_id} value={status.status_id}>
                    {status.status_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
              <select
                value={filters.hasPhone}
                onChange={(e) => setFilters({...filters, hasPhone: e.target.value})}
                className="input"
              >
                <option value="">전체</option>
                <option value="yes">있음</option>
                <option value="no">없음</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
              <select
                value={filters.hasAddress}
                onChange={(e) => setFilters({...filters, hasAddress: e.target.value})}
                className="input"
              >
                <option value="">전체</option>
                <option value="yes">있음</option>
                <option value="no">없음</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setFilters({
                searchTerm: '',
                positionId: '',
                positionStatusId: '',
                hasPhone: '',
                hasAddress: ''
              })}
              className="btn btn-secondary"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* 교인 등록/수정 폼 */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">
              {editingMember ? '교인 정보 수정' : '새 교인 등록'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 교인명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  교인명 *
                </label>
                <input
                  type="text"
                  value={formData.member_name}
                  onChange={(e) => setFormData({...formData, member_name: e.target.value})}
                  className="input"
                  placeholder="홍길동"
                  required
                />
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input"
                  placeholder="010-1234-5678"
                />
              </div>

              {/* 생년월일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="input"
                />
              </div>

              {/* 직분 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직분
                </label>
                <select
                  value={formData.position_id}
                  onChange={(e) => setFormData({...formData, position_id: e.target.value})}
                  className="input"
                >
                  <option value="">직분 선택</option>
                  {positions.map((position) => (
                    <option key={position.position_id} value={position.position_id}>
                      {position.position_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 직분 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직분 상태
                </label>
                <select
                  value={formData.position_status_id}
                  onChange={(e) => setFormData({...formData, position_status_id: e.target.value})}
                  className="input"
                >
                  <option value="">직분 상태 선택</option>
                  {positionStatuses.map((status) => (
                    <option key={status.status_id} value={status.status_id}>
                      {status.status_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input"
                  placeholder="서울시 중구..."
                />
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
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : (editingMember ? '수정' : '등록')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 교인 목록 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">
            교인 목록 ({filteredMembers.length}명)
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">교인 목록을 불러오는 중...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filters.searchTerm || filters.positionId || filters.positionStatusId ? 
              '검색 조건에 맞는 교인이 없습니다.' : 
              '등록된 교인이 없습니다.'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>교인명</th>
                  <th>직분</th>
                  <th>직분상태</th>
                  <th>전화번호</th>
                  <th>주소</th>
                  <th>생년월일</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.member_id}>
                    <td>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.member_name}
                          </div>
                          {member.notes && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {member.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {getPositionName(member) && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                          {getPositionName(member)}
                        </span>
                      )}
                    </td>
                    <td>
                      {getPositionStatusName(member) && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {getPositionStatusName(member)}
                        </span>
                      )}
                    </td>
                    <td>
                      {member.phone && (
                        <a 
                          href={`tel:${member.phone}`}
                          className="flex items-center text-gray-600 hover:text-primary-600"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {formatPhone(member.phone)}
                        </a>
                      )}
                    </td>
                    <td>
                      {member.address && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-xs">{member.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="text-gray-600">
                      {member.birth_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(member.birth_date)}
                        </div>
                      )}
                    </td>
                    <td className="text-gray-500">
                      {formatDate(member.register_date)}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
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

export default Members;