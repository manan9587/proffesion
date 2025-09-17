import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Heart, Brain, User, Sparkles, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const NumberResult = ({ icon, title, number, description, delay, colorClass, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1, duration: 0.5 }}
        className="bg-purple-900/30 border border-purple-500/20 rounded-lg p-4 flex items-center gap-4 result-card min-h-[110px]"
    >
        <div className={`p-3 rounded-full bg-black/20 ${colorClass}`}>{icon}</div>
        <div className="card-content w-full">
            <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-white">{title}</p>
                {number && <p className={`text-2xl font-black ${colorClass}`}>{number}</p>}
            </div>
            {loading ? (
                <div className="flex items-center mt-1">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                    <p className="text-sm text-gray-400">Loading meaning...</p>
                </div>
            ) : (
                <p className="text-sm text-gray-400">{description}</p>
            )}
        </div>
    </motion.div>
);

const BasicResultDisplay = ({ results }) => {
    const [interpretations, setInterpretations] = useState({});
    const [loading, setLoading] = useState(true);
    const [localProfession, setLocalProfession] = useState(null);

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

    const numberTypes = [
        { key: 'life_path', title: 'Life Path', type: 'Life Path' },
        { key: 'expression', title: 'Expression', type: 'Expression' },
        { key: 'soul_urge', title: 'Soul Urge', type: 'Soul Urge' },
        { key: 'personality', title: 'Personality', type: 'Personality' },
        { key: 'maturity', title: 'Maturity', type: 'Maturity' },
    ];

    useEffect(() => {
        const fetchInterpretations = async () => {
            setLoading(true);
            const fetchedInterpretations = {};
            const promises = numberTypes.map(async (item) => {
                // Normalize different shapes: results[item.key] might be a number or an object { number: N }
                const raw = results[item.key];
                const number = raw && typeof raw === 'object' && raw.number ? raw.number : raw;
                if (number || number === 0) {
                    const { data, error } = await supabase
                        .from('number_interpretations')
                        .select('description')
                        .eq('number', number)
                        .eq('type', item.type)
                        .single();
                    if (!error && data) {
                        fetchedInterpretations[item.key] = data.description;
                    } else {
                        fetchedInterpretations[item.key] = `Meaning for ${item.title} ${number} not found.`;
                    }
                }
            });

            await Promise.all(promises);

            // Fetch suggested professions based on life_path number (if available)
            let fetchedProfession = null;
            const lifeRaw = results.life_path;
            const lifeNumber = lifeRaw && typeof lifeRaw === 'object' && lifeRaw.number ? lifeRaw.number : lifeRaw;
            if (lifeNumber || lifeNumber === 0) {
                try {
                    const { data: profData, error: profError } = await supabase
                        .from('number_interpretations')
                        .select('profession')
                        .eq('number', lifeNumber)
                        .eq('type', 'Life Path')
                        .single();
                    if (!profError && profData) {
                        fetchedProfession = profData.profession;
                    }
                } catch (e) {
                    // ignore
                }
            }

            setInterpretations(fetchedInterpretations);
            setLoading(false);

            if (fetchedProfession) {
                // set a local state to show profession if parent didn't include it
                setLocalProfession(fetchedProfession);
            }
        };

        if (results) {
            fetchInterpretations();
        }
    }, [results]);

    if (!results) {
        return null;
    }

    const coreNumbers = numberTypes;

    return (
        <div className="mt-8 p-6 bg-purple-900/20 rounded-lg border border-purple-500/30 text-center numerology-results">
            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-300" /> Your Core Numerology Numbers <Sparkles className="h-5 w-5 text-yellow-300" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {coreNumbers.map((item, index) => {
                    const raw = results[item.key];
                    const numberValue = raw && typeof raw === 'object' && raw.number ? raw.number : raw;
                    return (
                        <NumberResult
                            key={item.key}
                            icon={ICONS[item.key]}
                            title={item.title}
                            number={numberValue}
                            description={interpretations[item.key] || ''}
                            delay={index}
                            colorClass={COLORS[item.key]}
                            loading={loading}
                        />
                    );
                })}

                {(results.profession || localProfession) && (
                    <div className="md:col-span-2">
                        <NumberResult
                            key="profession"
                            icon={ICONS.profession}
                            title="Suggested Professions"
                            description={results.profession || localProfession}
                            delay={5}
                            colorClass={COLORS.profession}
                            loading={false}
                        />
                    </div>
                )}
            </div>
             <Button asChild className="mt-8">
                <Link to={`/explore/${results.life_path}`}>Explore Your Life Path Number {results.life_path}</Link>
            </Button>
        </div>
    );
};

export default BasicResultDisplay;
