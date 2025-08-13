import React from 'react';
import { Church } from 'lucide-react';

interface ChurchLogoProps {
  logoUrl?: string;
  churchName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ChurchLogo: React.FC<ChurchLogoProps> = ({
  logoUrl,
  churchName,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  if (logoUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img 
          src={logoUrl}
          alt={churchName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // 이미지 로드 실패 시 기본 아이콘으로 폴백
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.className = `${sizeClasses[size]} bg-primary-100 rounded-full flex items-center justify-center ${className}`;
              parent.innerHTML = `<svg class="${iconSizes[size]} text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-primary-100 rounded-full flex items-center justify-center ${className}`}>
      <Church className={`${iconSizes[size]} text-primary-600`} />
    </div>
  );
};

export default ChurchLogo;