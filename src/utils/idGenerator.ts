import { supabase } from './supabase';

export class IDGenerator {
  /**
   * 다음 순번을 가져오고 업데이트 (간소화된 버전)
   */
  static async getNextSequence(
    churchId: string, 
    sequenceType: string, 
    datePrefix: string = ''
  ): Promise<number> {
    try {
      // 1. 트랜잭션 없이 간단하게 처리
      // 현재 순번 조회
      const { data: existingData } = await supabase
        .from('id_sequences')
        .select('current_number')
        .eq('church_id', churchId)
        .eq('sequence_type', sequenceType)
        .eq('date_prefix', datePrefix)
        .single();

      let currentNumber = 0;
      if (existingData) {
        currentNumber = existingData.current_number;
      }

      const nextNumber = currentNumber + 1;

      // 2. 순번 업데이트 또는 생성
      const { error: upsertError } = await supabase
        .from('id_sequences')
        .upsert({
          church_id: churchId,
          sequence_type: sequenceType,
          date_prefix: datePrefix,
          current_number: nextNumber,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.warn('Sequence update error:', upsertError);
        // 에러가 있어도 기본값 반환 (시스템이 멈추지 않도록)
        return currentNumber + 1;
      }

      return nextNumber;
    } catch (error) {
      console.warn('Sequence generation error:', error);
      // 에러 발생 시 타임스탬프 기반 대체 방법
      return Math.floor(Date.now() / 1000) % 10000; // 간단한 대체 ID
    }
  }

  /**
   * 교인 ID 생성: ch2025001_m0001 (간소화된 버전)
   */
  static async generateMemberId(churchId: string): Promise<string> {
    try {
      // 기존 교인 수를 확인하여 순번 결정
      const { count, error } = await supabase
        .from('members')
        .select('member_id', { count: 'exact' })
        .eq('church_id', churchId);

      if (error) {
        console.warn('Member count error:', error);
      }

      const sequence = (count || 0) + 1;
      return `${churchId}_m${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
      console.warn('Member ID generation error:', error);
      // 대체 방법: 타임스탬프 기반
      const timestamp = Date.now().toString().slice(-4);
      return `${churchId}_m${timestamp}`;
    }
  }

  /**
   * 헌금 ID 생성: ch2025001_20250806_0001 (간소화된 버전)
   */
  static async generateDonationId(churchId: string, date: string): Promise<string> {
    try {
      const dateStr = date.replace(/-/g, ''); // YYYY-MM-DD -> YYYYMMDD
      
      // 해당 날짜의 기존 헌금 건수 확인
      const { count, error } = await supabase
        .from('donations')
        .select('donation_id', { count: 'exact' })
        .eq('church_id', churchId)
        .eq('donation_date', date);

      if (error) {
        console.warn('Donation count error:', error);
      }

      const sequence = (count || 0) + 1;
      return `${churchId}_${dateStr}_${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
      console.warn('Donation ID generation error:', error);
      // 대체 방법: 타임스탬프 기반
      const dateStr = date.replace(/-/g, '');
      const timestamp = Date.now().toString().slice(-4);
      return `${churchId}_${dateStr}_${timestamp}`;
    }
  }

  /**
   * 설정 ID 생성: ch2025001_c001 (간소화된 버전)
   */
  static async generateConfigId(churchId: string): Promise<string> {
    try {
      // 기존 설정 수를 확인하여 순번 결정
      const { count, error } = await supabase
        .from('donation_types')
        .select('type_id', { count: 'exact' })
        .eq('church_id', churchId);

      if (error) {
        console.warn('Config count error:', error);
      }

      const sequence = (count || 0) + 1;
      return `${churchId}_c${sequence.toString().padStart(3, '0')}`;
    } catch (error) {
      console.warn('Config ID generation error:', error);
      // 대체 방법: 타임스탬프 기반
      const timestamp = Date.now().toString().slice(-3);
      return `${churchId}_c${timestamp}`;
    }
  }

  /**
   * ID에서 교회 코드 추출
   */
  static extractChurchId(id: string): string {
    const parts = id.split('_');
    return parts[0]; // ch2025001
  }

  /**
   * ID에서 순번 추출
   */
  static extractSequence(id: string): number {
    const parts = id.split('_');
    if (parts.length >= 2) {
      // 교인: ch2025001_m0001 -> m0001 -> 1
      // 헌금: ch2025001_20250806_0001 -> 0001 -> 1
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart.replace(/[^0-9]/g, ''), 10);
    }
    return 0;
  }

  /**
   * 헌금 ID에서 날짜 추출
   */
  static extractDateFromDonationId(donationId: string): string {
    const parts = donationId.split('_');
    if (parts.length >= 3) {
      const dateStr = parts[1]; // 20250806
      return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
    }
    return '';
  }

  /**
   * ID 유효성 검사
   */
  static validateMemberId(memberId: string): boolean {
    const pattern = /^ch\d{7}_m\d{4}$/;
    return pattern.test(memberId);
  }

  static validateDonationId(donationId: string): boolean {
    const pattern = /^ch\d{7}_\d{8}_\d{4}$/;
    return pattern.test(donationId);
  }

  static validateConfigId(configId: string): boolean {
    const pattern = /^ch\d{7}_c\d{3}$/;
    return pattern.test(configId);
  }

  /**
   * 특정 날짜의 헌금 건수 조회
   */
  static async getDonationCountForDate(churchId: string, date: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('donations')
        .select('donation_id', { count: 'exact' })
        .eq('church_id', churchId)
        .eq('donation_date', date);

      if (error) {
        console.warn('Donation count query error:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.warn('Error getting donation count:', error);
      return 0;
    }
  }

  /**
   * 중복 ID 체크 (안전장치)
   */
  static async checkMemberIdExists(memberId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('member_id')
        .eq('member_id', memberId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }

  static async checkDonationIdExists(donationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('donation_id')
        .eq('donation_id', donationId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }
}