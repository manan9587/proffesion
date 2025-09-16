import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { numerologyNumbers } from '@/lib/numerology-data';
import NumberCard from '@/components/NumberCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import DateOfBirthCalculator from '@/components/DateOfBirthCalculator';
import { LogOut, User, Sparkles, Zap, Star, LayoutDashboard } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, user, signOut } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const featureCards = [
    {
      icon: <Star className="h-8 w-8 text-yellow-400" />,
      title: "Ancient Wisdom",
      description: "Based on thousands of years of numerological knowledge and tradition.",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-400" />,
      title: "Personalized Insights",
      description: "Each number reveals unique strengths and challenges connected to you.",
    },
    {
      icon: <Zap className="h-8 w-8 text-pink-500" />,
      title: "Premium Content",
      description: "Unlock detailed career guidance and the insights into your destiny and purpose.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Numerology Destiny - Your Cosmic Career Path</title>
        <meta name="description" content="Discover your cosmic career path through the ancient wisdom of numerology. Each number holds unique insights into your destiny and purpose." />
        <meta property="og:title" content="Numerology Destiny - Your Cosmic Career Path" />
        <meta property="og:description" content="Discover your cosmic career path through the ancient wisdom of numerology." />
      </Helmet>
      
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Numerology Destiny</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button onClick={signOut} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
               <Button asChild variant="outline" size="sm">
                <Link to="/auth">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-5xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center my-12"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Numerology Destiny
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Discover your cosmic career path through the ancient wisdom of numerology. Each number holds unique insights into your destiny and purpose.
            </p>
          </motion.section>
          
          <DateOfBirthCalculator />

          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#1C162D] border border-purple-500/20 rounded-xl p-8 my-16"
          >
            <h2 className="text-2xl font-bold text-center text-white mb-8">About Numerology Destiny</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featureCards.map((card, index) => (
                <motion.div key={index} custom={index} variants={containerVariants} className="flex items-start gap-4">
                  <div className="mt-1">{card.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-200">{card.title}</h3>
                    <p className="text-gray-400 text-sm">{card.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-bold text-center text-white mb-8">Choose Your Number</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {numerologyNumbers.map((number) => (
                <NumberCard key={number.number} number={number} />
              ))}
            </div>
          </motion.section>
        </main>
      </div>
    </>
  );
};

export default HomePage;