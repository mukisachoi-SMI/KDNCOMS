import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StorageTestUpload: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testResults, setTestResults] = useState<string[]>([]);

  const runStorageTest = async () => {
    setTestStatus('testing');
    setTestResults([]);
    const results: string[] = [];

    try {
      // Step 1: 버킷 목록 확인
      results.push('📋 버킷 목록 확인 중...');
      setTestResults([...results]);
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        results.push(`❌ 버킷 목록 조회 실패: ${bucketsError.message}`);
        setTestResults([...results]);
        setTestStatus('failed');
        return;
      }
      
      const churchLogosBucket = buckets?.find(b => b.name === 'church-logos');
      
      if (!churchLogosBucket) {
        results.push('❌ church-logos 버킷이 없습니다!');
        results.push('💡 해결방법: Supabase 대시보드 > Storage에서 "church-logos" 버킷을 생성하세요');
        setTestResults([...results]);
        setTestStatus('failed');
        return;
      }
      
      results.push(`✅ church-logos 버킷 발견 (Public: ${churchLogosBucket.public ? 'Yes' : 'No'})`);
      
      if (!churchLogosBucket.public) {
        results.push('⚠️ 경고: 버킷이 Private입니다. Public으로 변경해야 합니다!');
      }
      
      // Step 2: 테스트 이미지 생성
      results.push('🖼️ 테스트 이미지 생성 중...');
      setTestResults([...results]);
      
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        results.push('❌ Canvas 생성 실패');
        setTestResults([...results]);
        setTestStatus('failed');
        return;
      }
      
      // 간단한 테스트 이미지 그리기
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TEST', 50, 50);
      
      // Canvas를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob 생성 실패'));
        }, 'image/jpeg', 0.9);
      });
      
      results.push(`✅ 테스트 이미지 생성 완료 (크기: ${(blob.size / 1024).toFixed(2)}KB)`);
      
      // Step 3: 업로드 테스트
      results.push('📤 업로드 테스트 중...');
      setTestResults([...results]);
      
      const testFileName = `test/test_${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('church-logos')
        .upload(testFileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (uploadError) {
        results.push(`❌ 업로드 실패: ${uploadError.message}`);
        
        // 에러 타입별 해결방법 제시
        if (uploadError.message.includes('policy')) {
          results.push('💡 해결방법: Storage 정책(RLS)을 설정해야 합니다');
          results.push('   SQL Editor에서 다음 쿼리 실행:');
          results.push('   CREATE POLICY "Anyone can upload" ON storage.objects');
          results.push('   FOR INSERT WITH CHECK (bucket_id = \'church-logos\');');
        } else if (uploadError.message.includes('bucket')) {
          results.push('💡 해결방법: 버킷을 생성하거나 이름을 확인하세요');
        }
        
        setTestResults([...results]);
        setTestStatus('failed');
        return;
      }
      
      results.push(`✅ 업로드 성공: ${testFileName}`);
      
      // Step 4: Public URL 확인
      results.push('🔗 Public URL 생성 중...');
      setTestResults([...results]);
      
      const { data: { publicUrl } } = supabase.storage
        .from('church-logos')
        .getPublicUrl(testFileName);
      
      results.push(`✅ Public URL 생성 완료`);
      results.push(`   URL: ${publicUrl.substring(0, 50)}...`);
      
      // Step 5: 삭제 테스트
      results.push('🗑️ 삭제 테스트 중...');
      setTestResults([...results]);
      
      const { error: deleteError } = await supabase.storage
        .from('church-logos')
        .remove([testFileName]);
      
      if (deleteError) {
        results.push(`⚠️ 삭제 실패: ${deleteError.message}`);
        results.push('   (테스트 파일이 남아있을 수 있습니다)');
      } else {
        results.push('✅ 삭제 성공');
      }
      
      // 최종 결과
      results.push('');
      results.push('🎉 모든 테스트 통과! Storage가 정상 작동합니다.');
      setTestResults([...results]);
      setTestStatus('success');
      
    } catch (error: any) {
      results.push(`❌ 예상치 못한 오류: ${error.message}`);
      setTestResults([...results]);
      setTestStatus('failed');
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium text-blue-900">Storage 연결 테스트</h4>
          <p className="text-xs text-blue-700 mt-1">
            버킷 설정이 올바른지 테스트합니다
          </p>
        </div>
        <button
          onClick={runStorageTest}
          disabled={testStatus === 'testing'}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {testStatus === 'testing' ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              테스트 중...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3 mr-2" />
              테스트 실행
            </>
          )}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-white rounded p-3 max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {testResults.join('\n')}
          </pre>
        </div>
      )}

      {testStatus === 'success' && (
        <div className="mt-3 flex items-center text-green-700 bg-green-100 p-2 rounded">
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium">Storage가 정상적으로 작동합니다!</span>
        </div>
      )}

      {testStatus === 'failed' && (
        <div className="mt-3 flex items-center text-red-700 bg-red-100 p-2 rounded">
          <XCircle className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium">설정을 확인해주세요</span>
        </div>
      )}
    </div>
  );
};

export default StorageTestUpload;
