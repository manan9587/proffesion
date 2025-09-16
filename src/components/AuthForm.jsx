import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SignInForm from '@/components/SignInForm';

const AuthForm = ({ onAuthSuccess }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const [mode, setMode] = useState('login'); // 'login' or 'register'

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    if (!error) {
        setShowSignInModal(true);
    }
    setLoading(false);
  };

  const handleLoginSuccess = () => {
    setShowSignInModal(false);
    onAuthSuccess?.();
  };


  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.div
            key="login"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <SignInForm onAuthSuccess={onAuthSuccess} initialEmail={email} />
            
            <div className="text-center text-sm mt-4">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button onClick={() => setMode('register')} className="font-semibold text-yellow-400 hover:text-yellow-300">
                  Sign up
                </button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">Email</label>
                <Input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500" />
                <p className="text-xs text-gray-500">Temporary emails are not allowed.</p>
              </div>
              <div className="relative space-y-2">
                <label className="text-xs font-bold text-gray-400">Password</label>
                <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 pr-10" />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
               <div className="relative space-y-2">
                <label className="text-xs font-bold text-gray-400">Confirm Password</label>
                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 pr-10" />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-white">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              <Button type="submit" className="w-full font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-400 hover:shadow-lg hover:shadow-yellow-500/20" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <><UserPlus className="h-4 w-4 mr-2" /> Create Account</>}
              </Button>
            </form>
            
            <p className="text-center text-sm mt-4 text-gray-400">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="font-semibold text-purple-400 hover:text-purple-300">
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
          <DialogContent className="bg-[#1C162D] border-purple-500/20 text-white">
              <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold">Verify your email to continue</DialogTitle>
              </DialogHeader>
              <p className="text-center text-gray-400">A verification link has been sent to your email address. Please check your inbox (and spam folder) to complete your registration.</p>
              <SignInForm onAuthSuccess={handleLoginSuccess} initialEmail={email}/>
          </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthForm;