import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// PWA Service Worker 등록
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // 새 버전이 사용 가능할 때 사용자에게 알림
    const shouldUpdate = window.confirm(
      '새로운 버전이 사용 가능합니다. 업데이트하시겠습니까?'
    );
    if (shouldUpdate) {
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('앱이 오프라인 사용을 위해 캐시되었습니다.');
  },
});
