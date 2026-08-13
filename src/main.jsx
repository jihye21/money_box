// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import LoginPage from './LoginPage.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/money_box">
      <Routes>
        {/* 로그인 페이지 경로 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 기존 메인 저축 페이지 경로 */}
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);