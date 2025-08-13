// ============================================
// 교회 헌금관리시스템 타입 정의
// ============================================

// 교회 정보
export interface Church {
  church_id: string;
  church_name: string;
  admin_id: string;
  login_id: string;
  password: string;
  email: string;
  church_address?: string;
  church_phone?: string;
  kakao_id?: string;  // 카카오톡 ID 추가
  status: string;
  created_at: string;
  updated_at: string;
}

// 사용자 정보
export interface User {
  user_id: string;
  church_id: string;
  login_id: string;
  user_name: string;
  email: string;
  role: string;
  last_login?: string;
  login_count: number;
  created_at: string;
}

// 교인 정보
export interface Member {
  member_id: string;
  church_id: string;
  member_name: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  register_date: string;
  status: string;
  notes?: string;
  position_id?: string;  // 직분 ID
  position_status_id?: string;  // 직분 상태 ID (예: "church123_status_002")
  created_at: string;
  updated_at: string;
}

// 헌금 종류
export interface DonationType {
  type_id: string;
  church_id: string;
  type_name: string;
  type_code?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 헌금 정보
export interface Donation {
  donation_id: string;
  member_id?: string;
  donor_name?: string;
  donation_type_id: string;
  amount: number;
  donation_date: string;
  payment_method: string;
  notes?: string;
  description?: string;
  status: string;
  church_id: string;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  member?: Member;
  donation_type?: DonationType;
}

// 순번 관리
export interface IDSequence {
  church_id: string;
  sequence_type: string;
  current_number: number;
  date_prefix: string;
  updated_at: string;
}

// 로그인 세션 데이터
export interface ChurchSession {
  churchId: string;
  churchName: string;
  churchLogo?: string;
  loginId: string;
  email: string;
  userName: string;
}

// 폼 데이터 타입들
export interface MemberFormData {
  member_name: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  position_id?: string;
  position_status_id?: string;  // 예: "church123_status_002" (청년)
  notes?: string;
}

export interface DonationFormData {
  member_id?: string;
  donor_name?: string;
  donation_type_id: string;
  amount: number;
  donation_date: string;
  payment_method: string;
  notes?: string;
}

// 통계 데이터
export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  byType: {
    type_name: string;
    amount: number;
    count: number;
  }[];
  byMonth: {
    month: string;
    amount: number;
    count: number;
  }[];
  byPaymentMethod: {
    method: string;
    amount: number;
    count: number;
  }[];
}

// 검색/필터 조건
export interface DonationFilters {
  dateFrom?: string;
  dateTo?: string;
  donationTypeId?: string;
  memberName?: string;
  paymentMethod?: string;
  amountMin?: number;
  amountMax?: number;
  memberOnly?: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// 페이지네이션
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 기본 직분 정보 (교인 등록시 선택용)
export interface Position {
  position_id: string;
  church_id: string;
  position_name: string;
  position_code: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 직분 상태 (시무/청년/은퇴/협동/원로/직원)
// status_id 형식: 교회ID_status_001~006
export interface PositionStatus {
  status_id: string;  // 예: "church123_status_001" (시무)
  church_id: string;
  status_name: string;
  status_code: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 확장된 교인 정보 (직분 포함)
export interface ExtendedMember extends Member {
  position_id?: string;
  position_status_id?: string;  // 예: "church123_status_002" (청년)
  position?: Position;
  position_status?: PositionStatus;
}

// 교회 설정
export interface ChurchSettings {
  setting_id: string;
  church_id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json';
  description?: string;
  created_at: string;
  updated_at: string;
}

// 백업 데이터 구조
export interface BackupData {
  backup_date: string;
  church_id: string;
  data: {
    church_info: Church;
    members: Member[];
    donation_types: DonationType[];
    donations: Donation[];
    sequences: IDSequence[];
    positions: Position[];
    position_statuses: PositionStatus[];
    church_settings: ChurchSettings[];
  };
}