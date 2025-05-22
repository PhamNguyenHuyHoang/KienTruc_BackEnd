import React from 'react';
import LoginForm from '../components/LoginForm';
// Bỏ import VantaBackground
// import VantaBackground from '../components/VantaBackground';
import ParticlesBackground from '../components/ParticlesBackground'; // Import component Particles
import '../App.css';

const LoginPage = () => {
  return (
    <div className="auth-page">
      {/* Sử dụng component nền Particles
      <ParticlesBackground /> */}

      {/* Component form đăng nhập */}
      <LoginForm />
    </div>
  );
};

export default LoginPage;