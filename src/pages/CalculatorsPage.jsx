import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator as CalculatorIcon, Sparkles } from 'lucide-react';
import PersonalYearCalculator from '@/components/PersonalYearCalculator';
import PersonalMonthCalculator from '@/components/PersonalMonthCalculator';
import UsageInstructions from '@/components/UsageInstructions';
import { trackVisit } from '@/lib/analytics';


const CalculatorsPage = () => {
    useEffect(() => {
        trackVisit('calculators');
    }, []);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const calculatorInstructions = (
        <ul className="space-y-2 list-disc list-inside">
            <li>
                <strong>Personal Year:</strong> Enter your birth day and month. We use the current year (2025) to compute your Personal Year number. Tap 'Calculate Year' to see your result.
            </li>
            <li>
                <strong>Personal Month:</strong> Enter your Personal Year number (from 1-9) and select a month from the dropdown. Tap 'Get Prediction' for your monthly forecast.
            </li>
        </ul>
    );

    return (
        <>
            <Helmet>
                <title>Numerology Calculators - Personal Year & Month</title>
                <meta name="description" content="Calculate your Personal Year and Personal Month numbers to gain insight into your future. Free numerology calculators for your life path." />
                <meta property="og:title" content="Numerology Calculators - Personal Year & Month" />
                <meta property="og:description" content="Calculate your Personal Year and Personal Month numbers to gain insight into your future." />
            </Helmet>

            <div className="min-h-screen p-4 sm:p-6 md:p-8">
                <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-purple-400" />
                        <span className="text-2xl font-bold text-white">Numerology Destiny</span>
                    </Link>
                    <Button asChild variant="ghost">
                        <Link to="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </header>

                <main className="max-w-5xl mx-auto">
                    <motion.div
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                    >
                        <div className="text-center mb-8">
                            <CalculatorIcon className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Numerology Calculators</h1>
                            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                                Unlock the secrets of the calendar with your personal numerology. Discover the themes of your year and the focus of each month.
                            </p>
                        </div>
                        
                        <UsageInstructions instructions={calculatorInstructions} storageKey="sc_help_dismissed_calculators" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <PersonalYearCalculator />
                            <PersonalMonthCalculator />
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default CalculatorsPage;