import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, User, Key, Sun, Moon, Star, Heart, Brain, Briefcase, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import { smartAuth } from '@/lib/smartAuth';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { FallbackCalculations } from '@/lib/fallbackCalculations';

const InterpretationCard = ({ icon, title, number, interpretation, colorClass, delay }) => (
  <motion.div
    className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-500/20 rounded-xl p-6 shadow-xl result-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-black/20 ${colorClass}`}>
          {icon}
        </div>
        <h3 className="font-bold text-xl text-white">{title}</h3>
      </div>
      <span className={`text-4xl font-black ${colorClass}`}>{number}</span>
    </div>
    <div className="card-content">
      <h4 className="font-semibold text-lg text-purple-300 mb-2">{interpretation.title}</h4>
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{interpretation.description}</p>
      {interpretation.profession && (
        <div className="border-t border-purple-500/20 pt-4 mb-4">
          <h5 className="font-bold text-sm text-gray-200 mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Profession Paths:</h5>
          <p className="text-gray-400 text-sm">{interpretation.profession}</p>
        </div>
      )}
      <div className="border-t border-purple-500/20 pt-4">
        <h5 className="font-bold text-sm text-gray-200 mb-2">Keywords:</h5>
        <div className="flex flex-wrap gap-2 mb-4">
          {interpretation.keywords && interpretation.keywords.map(kw => (
            <span key={kw} className="bg-gray-700/50 text-gray-300 px-2.5 py-1 rounded-md text-xs">{kw}</span>
          ))}
        </div>
        <h5 className="font-bold text-sm text-gray-200 mb-2">Advice:</h5>
        <p className="text-gray-400 text-sm italic">{interpretation.advice}</p>
      </div>
    </div>
  </motion.div>
);

const EnhancedNumerology = ({ fullName, birthDate, onComplete }) => {
  const { toast } = useToast();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const getReading = async () => {
    if (!fullName?.trim() || !birthDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide your full name and birth date."
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // If user is authenticated, try database calculation; otherwise use local fallback to avoid server-side RLS insert errors
      let data = null;
      if (user) {
        // Confirm server-side auth user before calling RPC to avoid RLS violations
        const userCheck = await supabase.auth.getUser();
        const rpcUser = userCheck?.data?.user || null;
        if (!rpcUser) {
          // If server doesn't recognize a user session yet, fallback to local calculations
          console.warn('Supabase client has no authenticated user; skipping RPC.');
          data = {};
        } else {
          const { data: rpcData, error: rpcError } = await supabase.rpc('compute_full_profile_all_numbers', {
            p_birth_date: birthDate,
            p_full_name: fullName.trim(),
          });
          if (rpcError) {
            throw rpcError;
          }
          data = rpcData;
        }
      } else {
        // No authenticated user — prepare an empty data object so fallback logic below will run
        data = {};
      }

      if (error) {
        throw error;
      }

      // Validate that we got all the core numbers
      if (!data.life_path?.number || !data.soul_urge?.number) {
        console.log('Database missing core numbers, using fallback for calculations');

        // Calculate missing numbers using fallback
        const fallbackCalc = FallbackCalculations.calculateAllNumbers(fullName.trim(), birthDate);

        // Enhance the database result with fallback calculations
        const enhancedResult = { ...data }; // Start with existing data

        if (!enhancedResult.life_path?.number && fallbackCalc.life_path) {
          enhancedResult.life_path = {
            number: fallbackCalc.life_path,
            title: `Life Path ${fallbackCalc.life_path}`,
            description: 'Your life purpose and direction.',
            keywords: ['purpose', 'direction', 'journey'],
            advice: 'Be authentic while being mindful of the impression you create.'
          };
        }

        if (!enhancedResult.maturity?.number && fallbackCalc.maturity) {
          enhancedResult.maturity = {
            number: fallbackCalc.maturity,
            title: `Maturity ${fallbackCalc.maturity}`,
            description: 'Your potential and goals for later in life.',
            keywords: ['wisdom', 'fulfillment', 'later-life', 'achievement'],
            advice: 'Embrace the wisdom and opportunities that come with maturity.'
          };
        }

        if (!enhancedResult.personal_year?.number && fallbackCalc.personal_year) {
          enhancedResult.personal_year = {
            number: fallbackCalc.personal_year,
            title: 'Personal Year',
            description: 'The energy and opportunities of your current year.',
            keywords: ['current', 'opportunities', 'year', 'energy'],
            advice: 'Align with this year\'s energy to maximize opportunities.'
          };
        }

        if (!enhancedResult.personal_month?.number && fallbackCalc.personal_month) {
          enhancedResult.personal_month = {
            number: fallbackCalc.personal_month,
            title: 'Personal Month',
            description: 'The focus and energy of your current month.',
            keywords: ['current', 'monthly', 'focus', 'rhythm'],
            advice: 'Use this month\'s energy to guide your actions and decisions.'
          };
        }

        if (!enhancedResult.soul_urge?.number && fallbackCalc.soul_urge) {
          enhancedResult.soul_urge = {
            number: fallbackCalc.soul_urge,
            title: `Soul Urge ${fallbackCalc.soul_urge}`,
            description: 'Your inner desires and motivations.',
            keywords: ['desires', 'motivation', 'inner-self'],
            advice: 'Listen to your heart and honor your true desires.'
          };
        }

        if (!enhancedResult.expression?.number && fallbackCalc.expression) {
          enhancedResult.expression = {
            number: fallbackCalc.expression,
            title: `Expression ${fallbackCalc.expression}`,
            description: 'Your talents and abilities.',
            keywords: ['talents', 'abilities', 'potential'],
            advice: 'Develop and share your natural talents with the world.'
          };
        }

        if (!enhancedResult.personality?.number && fallbackCalc.personality) {
          enhancedResult.personality = {
            number: fallbackCalc.personality,
            title: `Personality ${fallbackCalc.personality}`,
            description: 'How others perceive you.',
            keywords: ['impression', 'image', 'first-meeting'],
            advice: 'Be authentic while being mindful of how you present yourself.'
          };
        }

        setResult(enhancedResult);

        toast({
          title: 'Calculations Complete',
          description: "Using local calculations - your enhanced profile is ready!",
          variant: "default"
        });

      } else {
        // If database returned full data, use it directly
        setResult(data);
        onComplete?.();
      }

    } catch (error) {
      console.error('Enhanced calculation failed, using fallback:', error);

      try {
        // Full fallback mode
        const fallbackCalc = FallbackCalculations.calculateAllNumbers(fullName.trim(), birthDate);

        // Create a complete enhanced result structure
        const enhancedResult = {
          life_path: {
            number: fallbackCalc.life_path,
            title: `Life Path ${fallbackCalc.life_path}`,
            description: 'Your life purpose and the path you are meant to walk.',
            keywords: ['purpose', 'direction', 'journey', 'destiny'],
            advice: 'Trust your path and follow your authentic purpose in life.'
          },
          soul_urge: {
            number: fallbackCalc.soul_urge,
            title: `Soul Urge ${fallbackCalc.soul_urge}`,
            description: 'Your innermost desires and what truly motivates you.',
            keywords: ['desires', 'motivation', 'inner-self', 'heart'],
            advice: 'Listen to your heart and honor what truly drives you.'
          },
          expression: {
            number: fallbackCalc.expression,
            title: `Expression ${fallbackCalc.expression}`,
            description: 'Your natural talents and how you express yourself.',
            keywords: ['talents', 'abilities', 'potential', 'gifts'],
            advice: 'Develop and share your unique talents with confidence.'
          },
          personality: {
            number: fallbackCalc.personality,
            title: `Personality ${fallbackCalc.personality}`,
            description: 'The impression you make and how others see you.',
            keywords: ['impression', 'image', 'first-meeting', 'outer-self'],
            advice: 'Follow your authentic path and trust your journey.'
          },
          maturity: {
            number: fallbackCalc.maturity,
            title: `Maturity ${fallbackCalc.maturity}`,
            description: 'Your potential and goals for later in life.',
            keywords: ['wisdom', 'fulfillment', 'later-life', 'achievement'],
            advice: 'Embrace the wisdom and opportunities that come with maturity.'
          },
          personal_year: {
            number: fallbackCalc.personal_year,
            title: 'Personal Year',
            description: 'The energy and opportunities of your current year.',
            keywords: ['current', 'opportunities', 'year', 'energy'],
            advice: 'Align with this year\'s energy to maximize opportunities.'
          },
          personal_month: {
            number: fallbackCalc.personal_month,
            title: 'Personal Month',
            description: 'The focus and energy of your current month.',
            keywords: ['current', 'monthly', 'focus', 'rhythm'],
            advice: 'Use this month\'s energy to guide your actions and decisions.'
          }
        };

        setResult(enhancedResult);

        toast({
          title: 'Calculations Complete',
          description: "Using local calculations - your enhanced profile is ready!",
          variant: "default"
        });

      } catch (fallbackError) {
        console.error('Complete fallback failed:', fallbackError);
        toast({
          variant: "destructive",
          title: "Calculation Error",
          description: "Could not generate your enhanced profile. Please check your input and try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAndCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error, isNewUser } = await smartAuth(email, password);

    if (error) {
      setLoading(false);
      toast({ variant: 'destructive', title: 'Authentication Failed', description: error.message });
      return;
    }

    toast({ title: isNewUser ? 'Account Created & Signed In!' : 'Welcome Back!', description: "We're now generating your enhanced reading." });
    // The onAuthStateChange listener will set the user, so we can proceed
    // Use a small timeout to allow auth context to update
    setTimeout(() => {
      getReading();
    }, 500);
  };

  const handleGetReadingClick = () => {
    if (user) {
      getReading();
    } else {
      setShowAuth(true);
    }
  };

  const ICONS = {
    'Life Path': <Star className="h-6 w-6" />,
    'Expression': <Zap className="h-6 w-6" />,
    'Soul Urge': <Heart className="h-6 w-6" />,
    'Personality': <User className="h-6 w-6" />,
    'Maturity': <Brain className="h-6 w-6" />,
    'Personal Year': <Sun className="h-6 w-6" />,
    'Personal Month': <Moon className="h-6 w-6" />,
  };

  const COLORS = {
    'Life Path': 'text-yellow-400',
    'Expression': 'text-cyan-400',
    'Soul Urge': 'text-pink-400',
    'Personality': 'text-orange-400',
    'Maturity': 'text-green-400',
    'Personal Year': 'text-amber-400',
    'Personal Month': 'text-indigo-400',
  }

  return (
    <div className="mt-8 p-6 bg-black/20 rounded-lg border border-purple-500/10 numerology-results">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
            <p className="mt-4 text-gray-300">Generating your cosmic blueprint...</p>
          </motion.div>
        ) : result ? (
          <motion.div key="results">
            <h3 className="text-3xl font-bold text-center text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Your Enhanced Numerology Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InterpretationCard icon={ICONS['Life Path']} title="Life Path" number={result.life_path?.number} interpretation={result.life_path} colorClass={COLORS['Life Path']} delay={0} />
              <InterpretationCard icon={ICONS['Expression']} title="Expression" number={result.expression?.number} interpretation={result.expression} colorClass={COLORS['Expression']} delay={1} />
              <InterpretationCard icon={ICONS['Soul Urge']} title="Soul Urge" number={result.soul_urge?.number} interpretation={result.soul_urge} colorClass={COLORS['Soul Urge']} delay={2} />
              <InterpretationCard icon={ICONS['Personality']} title="Personality" number={result.personality?.number} interpretation={result.personality} colorClass={COLORS['Personality']} delay={3} />
              <InterpretationCard icon={ICONS['Maturity']} title="Maturity" number={result.maturity?.number} interpretation={result.maturity} colorClass={COLORS['Maturity']} delay={4} />
              <InterpretationCard icon={ICONS['Personal Year']} title="Personal Year" number={result.personal_year?.number} interpretation={result.personal_year} colorClass={COLORS['Personal Year']} delay={5} />
              <InterpretationCard icon={ICONS['Personal Month']} title="Personal Month" number={result.personal_month?.number} interpretation={result.personal_month} colorClass={COLORS['Personal Month']} delay={6} />
            </div>
          </motion.div>
        ) : showAuth ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto text-center">
            <h4 className="text-xl font-bold text-white mb-2">Unlock Your Full Reading</h4>
            <p className="text-gray-400 mb-6">Sign in or create a free account to save and view your complete profile.</p>
            <form onSubmit={handleAuthAndCalculate} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email-enhanced" className="text-gray-400">Email</Label>
                <Input id="email-enhanced" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white" />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password-enhanced" className="text-gray-400">Password</Label>
                <Input id="password-enhanced" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className="bg-[#2a2342] border-purple-500/30 text-white" />
              </div>
              <Button type="submit" className="w-full font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900" disabled={loading}>
                <Sparkles className="h-4 w-4 mr-2" /> Sign In & Reveal My Reading
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="prompt" className="text-center">
            <Button onClick={handleGetReadingClick} size="lg" className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 shadow-lg hover:shadow-yellow-500/20 transform hover:scale-105 transition-all duration-300">
              <Sparkles className="h-5 w-5 mr-3" /> Get My Enhanced Reading
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedNumerology;
