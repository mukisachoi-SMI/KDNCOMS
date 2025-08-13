import React, { useState, useEffect } from 'react';
import { Plus, Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // PWA 설치 상태 확인
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    // iOS 확인
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isInStandaloneMode = (window.navigator as any).standalone;
      setIsIOS(isIOSDevice && !isInStandaloneMode);
    };

    checkStandalone();
    checkIOS();

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  const handleIOSInstall = () => {
    setShowIOSGuide(true);
  };

  // 이미 설치되었거나 스탠드얼론 모드면 표시하지 않음
  if (isInstalled || isStandalone) {
    return null;
  }

  // iOS 설치 가이드
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">iOS 앱 설치 방법</h3>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>Safari 브라우저 하단의 공유 버튼 
                <span className="inline-block mx-1">
                  <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                  </svg>
                </span>
                을 탭하세요
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>"홈 화면에 추가" 옵션을 선택하세요</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>오른쪽 상단의 "추가"를 탭하세요</span>
            </li>
          </ol>
          
          <button
            onClick={() => setShowIOSGuide(false)}
            className="mt-4 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  // Android/Desktop 설치 프롬프트
  if (isInstallable && !isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">앱으로 설치하기</h3>
            <p className="text-xs text-gray-600 mt-1">
              홈 화면에 추가하여 더 빠르게 접속하세요
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700"
              >
                설치
              </button>
              <button
                onClick={() => setIsInstallable(false)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS 설치 안내
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">iOS 앱 설치</h3>
            <p className="text-xs text-gray-600 mt-1">
              Safari의 공유 버튼을 통해 홈 화면에 추가하세요
            </p>
            <button
              onClick={handleIOSInstall}
              className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
            >
              설치 방법 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;
