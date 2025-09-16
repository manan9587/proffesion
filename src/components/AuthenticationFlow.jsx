import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ValidationUtils } from '@/lib/validationUtils';

const AuthenticationFlow = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleAuth = async (authAction) => {
    if (!ValidationUtils.isEmailValid(email)) {
      toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
      return;
    }
    if (!ValidationUtils.isPasswordValid(password)) {
      toast({ variant: 'destructive', title: 'Invalid Password', description: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    const { error } = await authAction(email, password);
    setLoading(false);

    if (!error) {
      onAuthSuccess?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input id="auth-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="bg-[#2a2342] border-purple-500/30 text-white"/>
      </div>
      <div className="relative space-y-2">
        <Label htmlFor="auth-password">Password</Label>
        <Input id="auth-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="bg-[#2a2342] border-purple-500/30 text-white pr-10"/>
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-white" disabled={loading}>
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => handleAuth(signIn)} className="flex-1" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
        </Button>
        <Button onClick={() => handleAuth(signUp)} variant="secondary" className="flex-1" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
        </Button>
      </div>
    </motion.div>
  );
};

export default AuthenticationFlow;