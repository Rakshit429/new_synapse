import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/UI/Loader';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleLogin(code);
    } else {
      navigate('/');
    }
  }, []);

  const handleLogin = async (code) => {
    try {
      const res = await api.post('/auth/login/microsoft', { code });
      login(res.data.access_token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error("Login failed. Please use IITD Email.");
      navigate('/');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <Loader />
        <p className="mt-3 text-white">Verifying with Microsoft...</p>
      </div>
    </div>
  );
};

export default AuthCallback;