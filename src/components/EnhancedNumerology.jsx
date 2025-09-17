import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Star, Heart, Zap, User, Brain, Briefcase, Sun, Moon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
        <div className={`p-2 rounded-lg bg-black/20 ${colorClass}`}>{icon}</div>
        <h3 className="font-bold text-xl text-white">{title}</h3>
      </div>
      <span className={`text-4xl font-black ${colorClass}`}>{number}</span>
    </div>
    <div className="card-content">
      <h4 className="font-semibold text-lg text-purple-300 mb-2">{interpretation?.title}</h4>
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{interpretation?.description}</p>
      {interpretation?.profession && (
        <div className="border-t border-purple-500/20 pt-4 mb-4">
          <h5 className="font-bold text-sm text-gray-200 mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Profession Paths:</h5>
          <p className="text-gray-400 text-sm">{interpretation.profession}</p>
        </div>
      )}
      <div className="border-t border-purple-500/20 pt-4">
        <h5 className="font-bold text-sm text-gray-200 mb-2">Keywords:</h5>
        <div className="flex flex-wrap gap-2 mb-4">
          {interpretation?.keywords?.map(kw => (
            <span key={kw} className="bg-gray-700/50 text-gray-300 px-2.5 py-1 rounded-md text-xs">{kw}</span>
          ))}
        </div>
        <h5 className="font-bold text-sm text-gray-200 mb-2">Advice:</h5>
        <p className="text-gray-400 text-sm italic">{interpretation?.advice}</p>
      </div>
    </div>
  </motion.div>
);

const EnhancedNumerology = ({ fullName, birthDate, onComplete }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const computeLocal = () => {
    if (!fullName?.trim() || !birthDate) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide your full name and birth date.' });
      return;
    }

    setLoading(true);
    try {
      const fallbackCalc = FallbackCalculations.calculateAllNumbers(fullName.trim(), birthDate);
      const enhancedResult = {
        life_path: {
          number: fallbackCalc.lifePath ?? fallbackCalc.life_path ?? fallbackCalc.lifePath,
          title: `Life Path ${fallbackCalc.life_path || fallbackCalc.lifePath}`,
          description: 'Your life purpose and direction.',
          keywords: ['purpose', 'direction', 'journey'],
          advice: 'Be authentic while being mindful of the impression you create.'
        },
        soul_urge: {
          number: fallbackCalc.soul_urge ?? fallbackCalc.soulUrge ?? fallbackCalc.soul_urge,
          title: `Soul Urge ${fallbackCalc.soul_urge || fallbackCalc.soulUrge}`,
          description: 'Your inner desires and motivations.',
          keywords: ['desires', 'motivation', 'inner-self'],
          advice: 'Listen to your heart and honor your true desires.'
        },
        expression: {
          number: fallbackCalc.expression,
          title: `Expression ${fallbackCalc.expression}`,
          description: 'Your talents and abilities.',
          keywords: ['talents', 'abilities', 'potential'],
          advice: 'Develop and share your natural talents with the world.'
        },
        personality: {
          number: fallbackCalc.personality,
          title: `Personality ${fallbackCalc.personality}`,
          description: 'How others perceive you.',
          keywords: ['impression', 'image', 'first-meeting'],
          advice: 'Be authentic while being mindful of how you present yourself.'
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
      toast({ title: 'Calculations Complete', description: "Using local calculations - your enhanced profile is ready!", variant: 'default' });
      onComplete?.();
    } catch (err) {
      console.error('Local calculation failed:', err);
      toast({ variant: 'destructive', title: 'Calculation Error', description: 'Could not calculate your numbers. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const ICONS = {
    life_path: <Star className="h-6 w-6" />,
    expression: <Zap className="h-6 w-6" />,
    soul_urge: <Heart className="h-6 w-6" />,
    personality: <User className="h-6 w-6" />,
    maturity: <Brain className="h-6 w-6" />,
    profession: <Briefcase className="h-6 w-6" />,
  };

  const COLORS = {
    life_path: 'text-yellow-400',
    expression: 'text-cyan-400',
    soul_urge: 'text-pink-400',
    personality: 'text-orange-400',
    maturity: 'text-green-400',
    profession: 'text-teal-400',
  };

  return (
    <div className="mt-8 p-6 bg-black/20 rounded-lg border border-purple-500/10 numerology-results">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
          <p className="mt-4 text-gray-300">Generating your cosmic blueprint...</p>
        </div>
      ) : result ? (
        <div>
          <h3 className="text-3xl font-bold text-center text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Your Enhanced Numerology Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InterpretationCard icon={ICONS.life_path} title="Life Path" number={result.life_path?.number} interpretation={result.life_path} colorClass={COLORS.life_path} delay={0} />
            <InterpretationCard icon={ICONS.expression} title="Expression" number={result.expression?.number} interpretation={result.expression} colorClass={COLORS.expression} delay={1} />
            <InterpretationCard icon={ICONS.soul_urge} title="Soul Urge" number={result.soul_urge?.number} interpretation={result.soul_urge} colorClass={COLORS.soul_urge} delay={2} />
            <InterpretationCard icon={ICONS.personality} title="Personality" number={result.personality?.number} interpretation={result.personality} colorClass={COLORS.personality} delay={3} />
            <InterpretationCard icon={ICONS.maturity} title="Maturity" number={result.maturity?.number} interpretation={result.maturity} colorClass={COLORS.maturity} delay={4} />
            <InterpretationCard icon={<Sun className="h-6 w-6" />} title="Personal Year" number={result.personal_year?.number} interpretation={result.personal_year} colorClass={COLORS['Personal Year']} delay={5} />
            <InterpretationCard icon={<Moon className="h-6 w-6" />} title="Personal Month" number={result.personal_month?.number} interpretation={result.personal_month} colorClass={COLORS['Personal Month']} delay={6} />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Button onClick={computeLocal} size="lg" className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900">
            <Sparkles className="h-5 w-5 mr-3" /> Get My Enhanced Reading
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedNumerology;
