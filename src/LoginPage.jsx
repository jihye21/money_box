// src/LoginPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

import './Login.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      navigate('/', { replace: true });
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <span className="login-badge">money_box</span>
        
        <h2 className="login-title">
          반가워요!<br />시작하려면 로그인이 필요해요
        </h2>
        
        <p className="login-description">
          간편하게 로그인하고 머니박스를 시작해보세요.
        </p>

        <button 
          onClick={handleGoogleLogin}
          className="login-button"
        >
          구글로 시작하기
        </button>
      </div>
    </div>
  );
}