import React, { useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { Camera, Upload, X, Loader } from 'lucide-react';

interface ChurchLogoUploadProps {
  churchId: string;
  currentLogoUrl?: string;
  onUploadSuccess: (url: string) => void;
}

const ChurchLogoUpload: React.FC<ChurchLogoUploadProps> = ({
  churchId,
  currentLogoUrl,
  onUploadSuccess
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentLogoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 500 * 1024) { // 500KB
      alert('파일 크기는 500KB 이하여야 합니다.');
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 이미지 리사이징 및 업로드
    await uploadLogo(file);
  };

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          // 최대 200x200 크기로 리사이징
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.9);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const uploadLogo = async (file: File) => {
    try {
      setIsUploading(true);

      // 이미지 리사이징
      const resizedBlob = await resizeImage(file);
      
      // 파일명 생성 (church_id_timestamp.jpg)
      const fileName = `${churchId}_${Date.now()}.jpg`;
      const filePath = `${churchId}/${fileName}`;

      // 기존 로고 삭제 (있는 경우)
      if (currentLogoUrl) {
        try {
          // URL에서 파일 경로 추출
          const urlParts = currentLogoUrl.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          const oldPath = `${churchId}/${oldFileName}`;
          
          const { error: deleteError } = await supabase.storage
            .from('church-logos')
            .remove([oldPath]);
          
          if (deleteError) {
            console.error('Failed to delete old logo:', deleteError);
          }
        } catch (err) {
          console.error('Error deleting old logo:', err);
        }
      }

      // 새 로고 업로드
      const { data, error } = await supabase.storage
        .from('church-logos')
        .upload(filePath, resizedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (error) {
        if (error.message?.includes('not found')) {
          throw new Error('Storage 버킷이 생성되지 않았습니다. Supabase Storage에서 "church-logos" 버킷을 생성해주세요.');
        } else if (error.message?.includes('policy')) {
          throw new Error('Storage 권한이 설정되지 않았습니다. 버킷을 Public으로 설정해주세요.');
        }
        throw error;
      }

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('church-logos')
        .getPublicUrl(filePath);

      // churches 테이블 업데이트
      const { error: updateError } = await supabase
        .from('churches')
        .update({ 
          logo_url: publicUrl,
          logo_updated_at: new Date().toISOString()
        })
        .eq('church_id', churchId);

      if (updateError) throw updateError;

      // 로컬 스토리지의 세션 정보도 업데이트
      const sessionData = localStorage.getItem('church_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.churchLogo = publicUrl;
        localStorage.setItem('church_session', JSON.stringify(session));
      }

      onUploadSuccess(publicUrl);
      alert('로고가 성공적으로 업로드되었습니다.');

    } catch (error: any) {
      console.error('Logo upload error:', error);
      const errorMessage = error.message || '로고 업로드에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = async () => {
    if (!window.confirm('로고를 삭제하시겠습니까?')) return;

    try {
      setIsUploading(true);

      if (currentLogoUrl) {
        try {
          // URL에서 파일 경로 추출
          const urlParts = currentLogoUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `${churchId}/${fileName}`;
          
          const { error: deleteError } = await supabase.storage
            .from('church-logos')
            .remove([filePath]);
          
          if (deleteError) {
            console.error('Failed to delete logo file:', deleteError);
          }
        } catch (err) {
          console.error('Error deleting logo file:', err);
        }
      }

      // churches 테이블 업데이트
      const { error: updateError } = await supabase
        .from('churches')
        .update({ 
          logo_url: null,
          logo_updated_at: new Date().toISOString()
        })
        .eq('church_id', churchId);

      if (updateError) throw updateError;

      // 로컬 스토리지의 세션 정보도 업데이트
      const sessionData = localStorage.getItem('church_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        delete session.churchLogo;
        localStorage.setItem('church_session', JSON.stringify(session));
      }

      setPreview('');
      onUploadSuccess('');
      alert('로고가 삭제되었습니다.');

    } catch (error) {
      console.error('Logo removal error:', error);
      alert('로고 삭제에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">교회 로고</label>
      
      <div className="flex items-center space-x-4">
        {/* 로고 미리보기 */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
            {preview ? (
              <img 
                src={preview} 
                alt="Church Logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {preview && !isUploading && (
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              title="로고 삭제"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 업로드 버튼 */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn btn-secondary"
          >
            {isUploading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                로고 {preview ? '변경' : '업로드'}
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, WebP (최대 500KB)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            권장 크기: 200x200px 정사각형
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChurchLogoUpload;