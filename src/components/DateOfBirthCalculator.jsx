import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import BasicResultDisplay from '@/components/BasicResultDisplay';
import { smartAuth } from '@/lib/smartAuth';
import { Loader2 } from 'lucide-react';
import { FallbackCalculations } from '@/lib/fallbackCalculations';
import { ValidationUtils } from '@/lib/validationUtils';
import { PerformanceMonitor } from '@/lib/performanceMonitor';

const DateInput = ({ value, onChange, placeholder, maxLength }) => {
  const handleChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="bg-gray-800/60 border-purple-400/30 focus:border-purple-400 focus:ring-purple-400 text-center"
      maxLength={maxLength}
    />
  );
};

const DateOfBirthCalculator = () => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchLastCalculation = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('numerology_calculations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && data.birth_date) {
          const [y, m, d] = data.birth_date.split('-');
          setDay(d);
          setMonth(m);
          setYear(y);
          setName(data.full_name);
          setResults({
            life_path: data.life_path,
            expression: data.expression,
            soul_urge: data.soul_urge,
            personality: data.personality,
            maturity: data.maturity,
            profession: data.profession,
          });
        }
      }
    };
    fetchLastCalculation();
  }, [user]);

  const calculateNumbers = async () => {
    if (!name) {
       toast({
        title: 'Missing Information',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!ValidationUtils.isBirthDateValid(day, month, year)) {
      toast({
        title: 'Invalid Date',
        description: 'Please enter a valid date of birth (DD/MM/YYYY).',
        variant: 'destructive',
      });
      return;
    }

    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    setIsLoading(true);
    setResults(null);

    try {
      if (user) {
        // Confirm server-side auth user exists before calling RPC
        const userCheck = await supabase.auth.getUser();
        const rpcUser = userCheck?.data?.user || null;
        if (!rpcUser) {
          console.warn('Supabase client has no authenticated user; skipping RPC and using fallback.');
          const fallbackResults = FallbackCalculations.calculateAllNumbers(name, date);
          try {
            const { data: interpretationData, error: interpretationError } = await supabase
              .from('number_interpretations')
              .select('profession')
              .eq('number', fallbackResults.lifePath)
              .eq('type', 'Life Path')
              .maybeSingle();

            const profession = interpretationError ? 'Not available' : interpretationData?.profession || 'Not available';
            setResults({ ...fallbackResults, profession });
          } catch (e) {
            setResults(fallbackResults);
          }
        } else {
          const { data, error } = await supabase.rpc('compute_full_profile_all_numbers', {
            p_birth_date: date,
            p_full_name: name,
          });

          if (error) {
            throw error;
          }

          const calculatedResults = Array.isArray(data) ? data[0] : data;
          setResults(calculatedResults);
        }
      } else {
        // User not authenticated — use local fallback to avoid server-side RLS errors
        const fallbackResults = FallbackCalculations.calculateAllNumbers(name, date);
        try {
          const { data: interpretationData, error: interpretationError } = await supabase
            .from('number_interpretations')
            .select('profession')
            .eq('number', fallbackResults.lifePath)
            .eq('type', 'Life Path')
            .maybeSingle();

          const profession = interpretationError ? 'Not available' : interpretationData?.profession || 'Not available';
          setResults({ ...fallbackResults, profession });
        } catch (e) {
          setResults(fallbackResults);
        }

        smartAuth(name, date);
      }

    } catch (error) {
      console.error('Calculation error, trying fallback:', error);
      toast({
        title: 'Using Fallback',
        description: "Could not reach our fast calculation server, using local fallback.",
        variant: "default",
      });
      
      try {
        const fallbackResults = FallbackCalculations.calculateAllNumbers(name, date);
        const { lifePath } = fallbackResults;
        const { data: interpretationData, error: interpretationError } = await supabase
          .from('number_interpretations')
          .select('profession')
          .eq('number', lifePath)
          .eq('type', 'Life Path')
          .maybeSingle();

        const profession = interpretationError ? 'Not available' : interpretationData?.profession || 'Not available';
        
        setResults({ ...fallbackResults, profession });

      } catch (fallbackError) {
        console.error('Fallback calculation failed:', fallbackError);
        toast({
          title: 'Calculation Failed',
          description: fallbackError.message || 'Could not calculate your numbers. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-gray-900/50 rounded-3xl shadow-2xl border border-purple-500/20 backdrop-blur-sm"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Your Cosmic Blueprint
        </h2>
        <p className="text-gray-400 mt-2">Discover the numbers that shape your destiny.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-300">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="As on your birth certificate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800/60 border-purple-400/30 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-purple-300">Date of Birth</Label>
            <div className="flex items-center gap-2">
              <DateInput value={day} onChange={setDay} placeholder="DD" maxLength={2} />
              <span className="text-gray-400">/</span>
              <DateInput value={month} onChange={setMonth} placeholder="MM" maxLength={2} />
              <span className="text-gray-400">/</span>
              <DateInput value={year} onChange={setYear} placeholder="YYYY" maxLength={4} />
            </div>
          </div>
        </div>
        <Button
          onClick={calculateNumbers}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 text-lg rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculating...
            </>
          ) : (
            'Reveal My Numbers'
          )}
        </Button>
      </div>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <BasicResultDisplay results={results} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default DateOfBirthCalculator;
