import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 管理后台全局样式
const style = document.createElement('style');
style.textContent = `
  :root {
    --color-primary: #1F5FA8;
    --color-primary-dark: #0E3D75;
    --color-primary-light: #E8F1FB;
    --color-orange: #E85D2F;
    --color-text-primary: #1A1A1A;
    --color-text-secondary: #595959;
    --color-text-tertiary: #8C8C8C;
    --color-bg-secondary: #F7F8FA;
    --color-border-primary: #E5E5E5;
  }
  body { margin: 0; font-family: 'PingFang SC','Microsoft YaHei',sans-serif; }
  #root { height: 100vh; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
