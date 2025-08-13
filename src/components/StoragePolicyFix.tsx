import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';

const StoragePolicyFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const sqlQuery = `-- RLS 정책 설정
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-logos');

CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'church-logos');

CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'church-logos')
WITH CHECK (bucket_id = 'church-logos');

CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'church-logos');`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery);
    alert('SQL이 클립보드에 복사되었습니다!');
  };

  const testUpload = async () => {
    setIsFixing(true);
    setResult('idle');
    setErrorMessage('');

    try {
      // 테스트 이미지 생성
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 생성 실패');
      
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 10, 10);
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob 생성 실패'));
        }, 'image/jpeg', 0.9);
      });

      // 업로드 테스트
      const testFileName = `test/permission_test_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('church-logos')
        .upload(testFileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // 성공하면 삭제
      await supabase.storage
        .from('church-logos')
        .remove([testFileName]);

      setResult('success');
    } catch (error: any) {
      setErrorMessage(error.message || '권한 테스트 실패');
      setResult('error');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-900">Storage 권한 설정 필요</h4>
          <p className="text-xs text-amber-700 mt-1">
            버킷은 Public이지만 RLS 정책이 필요합니다.
          </p>

          <div className="mt-3 space-y-3">
            {/* SQL 복사 */}
            <div className="bg-white p-3 rounded border border-amber-300">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-xs font-semibold text-gray-900">1. 아래 SQL을 복사하세요</h5>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  복사
                </button>
              </div>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {sqlQuery}
              </pre>
            </div>

            {/* 실행 방법 */}
            <div className="bg-white p-3 rounded border border-amber-300">
              <h5 className="text-xs font-semibold text-gray-900 mb-2">2. Supabase SQL Editor에서 실행</h5>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Supabase 대시보드 접속</li>
                <li>SQL Editor 메뉴 클릭</li>
                <li>복사한 SQL 붙여넣기</li>
                <li>"Run" 버튼 클릭</li>
              </ol>
            </div>

            {/* 테스트 */}
            <div className="bg-white p-3 rounded border border-amber-300">
              <h5 className="text-xs font-semibold text-gray-900 mb-2">3. 권한 테스트</h5>
              <button
                onClick={testUpload}
                disabled={isFixing}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isFixing ? '테스트 중...' : '권한 테스트'}
              </button>

              {result === 'success' && (
                <div className="mt-2 flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs">권한이 정상 설정되었습니다!</span>
                </div>
              )}

              {result === 'error' && (
                <div className="mt-2">
                  <p className="text-xs text-red-700">❌ {errorMessage}</p>
                  <p className="text-xs text-gray-600 mt-1">위의 SQL을 실행했는지 확인하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoragePolicyFix;
