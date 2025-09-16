import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignInForm = ({ onAuthSuccess, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (!error) {
      onAuthSuccess?.();
    }
  };

  return (
    <div>
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400">Email</label>
            <Input type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500" />
            </div>
            <div className="relative space-y-2">
            <label className="text-xs font-bold text-gray-400">Password</label>
            <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            </div>
            
            <Button type="submit" className="w-full font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-400 hover:shadow-lg hover:shadow-yellow-500/20" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <><LogIn className="h-4 w-4 mr-2" /> Sign In</>}
            </Button>
        </form>
         <p className="text-xs text-gray-500 mt-3 text-center">
            By signing in / using our services you agree to our <Link to="/privacy-policy" className="underline">Privacy Policy</Link> and <Link to="/terms-of-use" className="underline">Terms of Use</Link>.
        </p>
    </div>
  );
};

export default SignInForm;