// src/LoginPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("로그인 성공:", result.user);
      
      // 로그인 성공 시 메인 화면('/')으로 이동
      navigate('/');
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span className="subtitle">money_box</span>
      <p>시작하려면 로그인이 필요합니다.</p>
      <button 
        onClick={handleGoogleLogin}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        구글로 로그인하기
      </button>
    </div>
  );
}