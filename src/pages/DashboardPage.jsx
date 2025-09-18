import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';
import { Loader2, AlertTriangle, History, Sparkles, ArrowLeft, LogOut, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackVisit } from '@/lib/analytics';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const [dobHistory, setDobHistory] = useState([]);
  const [calcHistory, setCalcHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    trackVisit('dashboard');

    const fetchHistory = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      const { data: numerologyData, error: numerologyError } = await supabase
        .from('numerology_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: calcData, error: calcError } = await supabase
        .from('calculator_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (numerologyError || calcError) {
        console.error('Error fetching history:', numerologyError || calcError);
        setError('Could not load your history. Please try again later.');
      } else {
        setDobHistory(numerologyData);
        setCalcHistory(calcData);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const PersonalYearResult = ({ result }) => (
    <>
      <p className="text-sm text-purple-300">Personal Year for 2025</p>
      <p className="text-3xl font-bold text-white">{result.number}</p>
      <p className="font-semibold text-yellow-300">{result.title}</p>
    </>
  );

  const PersonalMonthResult = ({ result }) => (
    <>
      <p className="text-sm text-purple-300">Personal Month for {result.month}</p>
      <p className="text-3xl font-bold text-white">{result.number}</p>
      <p className="font-semibold text-yellow-300 truncate" title={result.prediction}>{result.prediction}</p>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Your Dashboard - Numerology Destiny</title>
        <meta name="description" content="View your past numerology readings and query history." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-[#111119] to-[#1C162D] py-12 px-4 sm:px-6 lg:px-8">
        <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Your Cosmic Dashboard
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              A history of your numerological journeys and discoveries.
            </p>
          </div>

          <Tabs defaultValue="dob" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1C162D]/50 border border-purple-500/20">
              <TabsTrigger value="dob"><History className="h-4 w-4 mr-2" /> Core Numbers History</TabsTrigger>
              <TabsTrigger value="calculators"><Calculator className="h-4 w-4 mr-2" /> Calculator History</TabsTrigger>
            </TabsList>
            <div className="bg-[#1C162D]/50 border border-purple-500/20 rounded-b-2xl p-8 shadow-2xl shadow-purple-900/20 mt-[-1px]">
              {loading && (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center h-40 text-center bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
                  <h3 className="text-xl font-bold text-white mb-1">An Error Occurred</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  <TabsContent value="dob">
                    <AnimatePresence>
                      {dobHistory.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                          <p className="text-gray-400 mb-4">You haven't calculated your core numbers yet.</p>
                          <Button asChild><Link to="/">Calculate Your Numbers</Link></Button>
                        </motion.div>
                      ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                          {dobHistory.map((item) => (
                            <motion.div key={item.id} variants={itemVariants} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                              <div className="flex-1 text-center sm:text-left">
                                <p className="text-sm text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="font-bold text-lg text-white">DOB: {new Date(item.birth_date).toLocaleDateString('en-GB')}</p>
                                <p className="font-bold text-lg text-white">Name: {item.full_name}</p>
                              </div>
                              <div className="flex gap-6 text-center">
                                <div><p className="text-sm text-purple-300">Life Path</p><p className="text-3xl font-bold text-white">{item.life_path}</p></div>
                                <div><p className="text-sm text-purple-300">Expression</p><p className="text-3xl font-bold text-white">{item.expression}</p></div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>
                  <TabsContent value="calculators">
                    <AnimatePresence>
                      {calcHistory.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                          <p className="text-gray-400 mb-4">You haven't used the calculators yet.</p>
                          <Button asChild><Link to="/calculators">Try Calculators</Link></Button>
                        </motion.div>
                      ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                          {calcHistory.map((item) => (
                            <motion.div key={item.id} variants={itemVariants} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="flex-1 text-center sm:text-left">
                                <p className="text-sm text-gray-400">{new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                {item.calculator_type === 'personal_year' && <p className="font-bold text-lg text-white">Inputs: Day {item.inputs.day}, Month {item.inputs.month}</p>}
                                {item.calculator_type === 'personal_month' && <p className="font-bold text-lg text-white">Inputs: Year {item.inputs.personal_year}, {item.inputs.month}</p>}
                              </div>
                              <div className="text-center sm:text-right">
                                {item.calculator_type === 'personal_year' && <PersonalYearResult result={item.result} />}
                                {item.calculator_type === 'personal_month' && <PersonalMonthResult result={item.result} />}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;
