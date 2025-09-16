import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, Calendar, Zap, CalendarOff } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AuthForm from '@/components/AuthForm';

const AdPlaceholder = ({ onAdComplete, onSkip }) => {
    const [counter, setCounter] = useState(10);
    const [canSkip, setCanSkip] = useState(false);

    useEffect(() => {
        if (counter > 0) {
            const timer = setTimeout(() => setCounter(counter - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onAdComplete();
        }
    }, [counter, onAdComplete]);

    useEffect(() => {
        if (counter <= 5) {
            setCanSkip(true);
        }
    }, [counter]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 border border-purple-500/30 rounded-lg bg-purple-900/20 text-center"
        >
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                <div className="bg-purple-400 h-2.5 rounded-full" style={{ width: `${(10 - counter) * 10}%` }}></div>
            </div>
            <img  className="w-full h-auto rounded-lg" alt="Advertisement placeholder showing a celestial design" src="https://images.unsplash.com/photo-1685478237361-a5b50d0eb76b" />
            <p className="text-sm text-purple-300 mt-2">Ad playing... Your result will appear in {counter}s</p>
            {canSkip && (
                <Button onClick={onSkip} variant="ghost" size="sm" className="mt-2 text-gray-400 hover:text-white">
                    Skip Ad
                </Button>
            )}
        </motion.div>
    );
};

const PersonalMonthCalculator = () => {
    const [personalYear, setPersonalYear] = useState('');
    const [month, setMonth] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [result, setResult] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [afterLoginAction, setAfterLoginAction] = useState(null);
    const { toast } = useToast();
    const { isAuthenticated, user } = useAuth();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const personalYears = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22];
    
    const requireAuthThen = async (action) => {
        const {data:{user}} = await supabase.auth.getUser();
        if(!user){
            setAfterLoginAction(()=>action);
            setIsAuthModalOpen(true);
            return;
        } 
        action();
    };

    const calculateAndShowResult = async () => {
        const p_target_month = months.indexOf(month) + 1;
        
        const { data: rpcData, error: rpcError } = await supabase.rpc('calculate_personal_month_safe', {
            p_personal_year: parseInt(personalYear),
            p_target_month
        });
        
        if (rpcError || rpcData === null) {
            toast({ variant: "destructive", title: "Error", description: rpcError?.message || "Could not calculate personal month." });
            setLoading(false);
            setShowAd(false);
            return;
        }

        const personalMonthNumber = rpcData;
        
        const { data: predictionData, error } = await supabase
            .from('personal_month_predictions')
            .select('prediction')
            .eq('personal_year', parseInt(personalYear))
            .eq('month_number', personalMonthNumber)
            .maybeSingle();

        if (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch prediction. Please try again." });
            setResult(null);
        } else {
            const finalResult = { 
                prediction: predictionData?.prediction || "This is a month of reflection and planning. Prepare for the opportunities ahead.",
                month: month, 
                number: personalMonthNumber 
            };
            setResult(finalResult);
            if(user) {
              await supabase.from('calculator_history').insert({
                  user_id: user.id,
                  calculator_type: 'personal_month',
                  inputs: { personal_year: parseInt(personalYear), month: month },
                  result: finalResult,
              });
            }
        }
        setLoading(false);
        setShowAd(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!personalYear || !month) {
            toast({ variant: "destructive", title: "Missing Fields", description: "Please select a Personal Year and a month." });
            return;
        }

        await requireAuthThen(async () => {
            setResult(null);
            setLoading(true);
            
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    
            const { data: historyData, error: historyError } = await supabase
                .from('calculator_history')
                .select('id')
                .eq('user_id', user.id)
                .eq('calculator_type', 'personal_month')
                .eq('inputs->>month', month)
                .eq('inputs->>personal_year', personalYear)
                .gte('created_at', firstDayOfMonth);
    
            if (historyError) {
                setLoading(false);
                toast({ variant: "destructive", title: "Error", description: "Could not check your history. Please try again." });
                return;
            }
    
            if (historyData && historyData.length > 0) {
                setLoading(false);
                toast({
                    variant: "destructive",
                    title: "Monthly Limit Reached",
                    description: "You've already calculated this for this month. Check your dashboard or try again next month.",
                    icon: <CalendarOff className="h-5 w-5 text-red-400" />,
                });
                return;
            }
    
            setShowAd(true);
        })
    };

    const handleAdComplete = () => {
        calculateAndShowResult();
    };

    useEffect(() => {
        if (isAuthenticated && afterLoginAction) {
            setIsAuthModalOpen(false);
            afterLoginAction();
            setAfterLoginAction(null);
        }
    }, [isAuthenticated, afterLoginAction]);

    return (
        <motion.div
            className="bg-[#1C162D] border border-purple-500/20 rounded-xl p-8 h-full result-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="card-content">
                <h3 className="text-2xl font-bold text-center text-white mb-2 flex items-center justify-center gap-2">
                    <Calendar className="text-purple-400" /> Personal Month Calculator
                </h3>
                <p className="text-center text-gray-400 mb-6">Get your unique prediction for any month.</p>

                <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <Label htmlFor="pm-year" className="text-gray-400">Personal Year</Label>
                                <select
                                    id="pm-year"
                                    value={personalYear}
                                    onChange={(e) => setPersonalYear(e.target.value)}
                                    className="flex h-11 w-full rounded-lg border bg-[#2a2342] border-purple-500/30 px-3 py-2 text-base text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>Year...</option>
                                    {personalYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pm-month" className="text-gray-400">Select Month</Label>
                                <select
                                    id="pm-month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="flex h-11 w-full rounded-lg border bg-[#2a2342] border-purple-500/30 px-3 py-2 text-base text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>Month...</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <Button type="submit" className="w-full font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/20" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <><Zap className="h-4 w-4 mr-2" /> Get Prediction</>}
                        </Button>
                    </form>
                    <DialogContent className="bg-[#1C162D] border-purple-500/20 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold">Sign In to Calculate</DialogTitle>
                            <DialogDescription className="text-center text-gray-400">
                                Please sign in or create an account to use the calculators.
                            </DialogDescription>
                        </DialogHeader>
                        <AuthForm onAuthSuccess={() => {
                            setIsAuthModalOpen(false);
                            if (afterLoginAction) {
                                afterLoginAction();
                                setAfterLoginAction(null);
                            }
                        }} />
                    </DialogContent>
                </Dialog>

                <AnimatePresence>
                    {showAd && <AdPlaceholder onAdComplete={handleAdComplete} onSkip={handleAdComplete} />}
                </AnimatePresence>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-6 p-6 bg-purple-900/20 rounded-lg border border-purple-500/30 text-center"
                        >
                            <p className="text-sm text-purple-300">Your prediction for {result.month}</p>
                            <h4 className="text-xl font-bold text-yellow-300 flex items-center justify-center gap-2 mt-2">
                                <Sparkles className="h-5 w-5" /> Personal Month {result.number}
                            </h4>
                            <p className="mt-3 text-gray-300">{result.prediction}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PersonalMonthCalculator;