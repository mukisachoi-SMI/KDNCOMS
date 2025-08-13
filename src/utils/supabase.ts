import { createClient } from '@supabase/supabase-js';

// 환경변수에서 읽기 (Netlify 배포용)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://udmnzwpnwunbxfkbcjop.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbW56d3Bud3VuYnhma2Jjam9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTMyNDUsImV4cCI6MjA3MDE4OTI0NX0.Q9dx_KONwgmVO3ON_GZ028-KtQfZTkHap0JFB63dLss';

// 디버깅용 콘솔 (프로덕션에서는 제거)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);
console.log('Environment:', process.env.NODE_ENV);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 연결 테스트 함수
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connected successfully');
    return { success: true, data };
  } catch (err) {
    console.error('Connection test failed:', err);
    return { success: false, error: err };
  }
};

// 헬퍼 함수들
export const withChurchFilter = (query: any, churchId: string) => {
  return query.eq('church_id', churchId);
};

// 데이터 조회 헬퍼 함수들
export const getChurchData = async (table: string, churchId: string) => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('church_id', churchId);
  
  if (error) throw error;
  return data;
};

// CSV 내보내기 헬퍼
export const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 쉼표나 따옴표가 있는 경우 처리
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// JSON 백업 헬퍼
export const exportToJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};