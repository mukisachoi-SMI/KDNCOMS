import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const StorageSetupGuide: React.FC = () => {
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'exists' | 'missing' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      // 버킷 목록 확인
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Bucket list error:', listError);
        setBucketStatus('error');
        setErrorDetails('Storage 접근 권한이 없습니다.');
        return;
      }

      // church-logos 버킷이 있는지 확인
      const churchLogosBucket = buckets?.find(bucket => bucket.name === 'church-logos');
      
      if (churchLogosBucket) {
        // 버킷이 public인지 확인
        if (!churchLogosBucket.public) {
          setBucketStatus('error');
          setErrorDetails('버킷이 Private로 설정되어 있습니다. Public으로 변경해주세요.');
        } else {
          setBucketStatus('exists');
        }
      } else {
        setBucketStatus('missing');
      }
    } catch (error) {
      console.error('Bucket check error:', error);
      setBucketStatus('error');
      setErrorDetails('버킷 상태를 확인할 수 없습니다.');
    }
  };

  const createBucket = async () => {
    try {
      const { data, error } = await supabase.storage.createBucket('church-logos', {
        public: true,
        fileSizeLimit: 524288, // 500KB in bytes
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (error) {
        console.error('Bucket creation error:', error);
        alert(`버킷 생성 실패: ${error.message}`);
      } else {
        alert('버킷이 성공적으로 생성되었습니다!');
        setBucketStatus('exists');
      }
    } catch (error: any) {
      console.error('Bucket creation error:', error);
      alert(`버킷 생성 실패: ${error.message}`);
    }
  };

  if (bucketStatus === 'checking') {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full mr-3"></div>
          <span className="text-sm text-gray-600">Storage 버킷 상태 확인 중...</span>
        </div>
      </div>
    );
  }

  if (bucketStatus === 'exists') {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-green-900">Storage 버킷 준비 완료</h4>
            <p className="text-xs text-green-700 mt-1">
              church-logos 버킷이 정상적으로 설정되어 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (bucketStatus === 'missing') {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-900">Storage 버킷 생성 필요</h4>
            <p className="text-xs text-yellow-700 mt-1">
              church-logos 버킷이 없습니다. 아래 방법 중 하나를 선택하세요:
            </p>
            
            <div className="mt-3 space-y-3">
              {/* 자동 생성 버튼 */}
              <div className="bg-white p-3 rounded border border-yellow-300">
                <h5 className="text-xs font-semibold text-gray-900 mb-2">방법 1: 자동 생성 (권장)</h5>
                <button
                  onClick={createBucket}
                  className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                >
                  버킷 자동 생성
                </button>
              </div>

              {/* 수동 생성 가이드 */}
              <div className="bg-white p-3 rounded border border-yellow-300">
                <h5 className="text-xs font-semibold text-gray-900 mb-2">방법 2: Supabase 대시보드에서 수동 생성</h5>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Supabase 대시보드 &gt; Storage 이동</li>
                  <li>"New bucket" 클릭</li>
                  <li>Name: <code className="bg-gray-100 px-1 py-0.5 rounded">church-logos</code></li>
                  <li>Public bucket: ✅ 체크</li>
                  <li>File size limit: <code className="bg-gray-100 px-1 py-0.5 rounded">500KB</code></li>
                  <li>"Create bucket" 클릭</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <div className="flex items-start">
        <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-red-900">Storage 설정 오류</h4>
          <p className="text-xs text-red-700 mt-1">{errorDetails}</p>
          
          {errorDetails.includes('Private') && (
            <div className="mt-3 bg-white p-3 rounded border border-red-300">
              <h5 className="text-xs font-semibold text-gray-900 mb-2">버킷을 Public으로 변경하는 방법:</h5>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Supabase 대시보드 &gt; Storage 이동</li>
                <li>church-logos 버킷 클릭</li>
                <li>Settings 탭 클릭</li>
                <li>"Public bucket" 토글 활성화</li>
                <li>변경사항 저장</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageSetupGuide;
