import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Helmet>
        <title>Numerology Destiny - Sign In or Join Us</title>
        <meta name="description" content="Sign in or join to unlock your cosmic career path." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#111119]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-sm bg-[#1C162D] border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-900/20"
        >
          <Link to="/" className="absolute top-5 left-5 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                <h2>Welcome</h2>
                <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm mt-1">Sign in or join to unlock your numerology insights</p>
          </div>

          <AuthForm onAuthSuccess={() => navigate('/')} />
          
           <p className="text-center text-sm mt-6">
                <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium">Forgot your password?</Link>
            </p>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;