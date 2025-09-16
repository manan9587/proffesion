import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, KeyRound, Mail, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('check_email'); // check_email, reset_password, ad_playing
  const [isLoading, setIsLoading] = useState(false);
  const { checkUserExists, updateUserPasswordByEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('ad_playing'); // Show ad while checking
    
    // Simulate ad delay and backend check
    setTimeout(async () => {
      const userExists = await checkUserExists(email);
      setIsLoading(false);
      
      if (userExists) {
        setStep('reset_password');
      } else {
        toast({
          title: "User Not Found",
          description: "This email is not registered. Please create an account.",
          variant: "destructive"
        });
        navigate('/auth', { state: { defaultMode: 'register' } });
      }
    }, 3000); // 3 second ad
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    const { error } = await updateUserPasswordByEmail(email, newPassword);
    setIsLoading(false);
    if (!error) {
      toast({ title: "Password Reset Successful", description: "Please log in with your new password." });
      navigate('/auth');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - Numerology Destiny</title>
        <meta name="description" content="Reset your password to regain access." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4 bg-[#111119]"
      >
        <div className="relative w-full max-w-sm bg-[#1C162D] border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
          <Link to="/auth" className="absolute top-5 left-5 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <AnimatePresence mode="wait">
            {step === 'check_email' && (
              <motion.div
                key="check_email"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-1">Forgot Password</h1>
                  <p className="text-gray-400 text-sm">Enter your email to reset your password.</p>
                </div>
                <form onSubmit={handleCheckEmail} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400">Email</label>
                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"/>
                  </div>
                  <Button type="submit" className="w-full font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-400 hover:shadow-lg hover:shadow-yellow-500/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Continue'}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'ad_playing' && (
              <motion.div
                key="ad_playing"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center"
              >
                  <h2 className="text-xl font-bold text-white mb-4">Ad Placeholder</h2>
                  <p className="text-gray-400 mb-4">An ad would be playing now.</p>
                  <div className="flex justify-center items-center h-24 bg-gray-800/50 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  </div>
                   <p className="text-gray-500 text-sm mt-4">Checking your account status...</p>
              </motion.div>
            )}

            {step === 'reset_password' && (
              <motion.div
                key="reset_password"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="text-center mb-8">
                    <ShieldAlert className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-white mb-1">Reset Your Password</h1>
                    <p className="text-gray-400 text-sm">Enter a new password for <span className="font-bold text-gray-300">{email}</span></p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400">New Password</label>
                    <Input id="new-password" type="password" placeholder="Enter a new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"/>
                  </div>
                  <Button type="submit" className="w-full font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-400 hover:shadow-lg hover:shadow-yellow-500/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Update Password'}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default ForgotPasswordPage;