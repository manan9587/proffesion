import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Heart, Brain, User, Sparkles, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import supabase from '@/lib/customSupabaseClient';
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
                {number || number === 0 ? <p className={`text-2xl font-black ${colorClass}`}>{number}</p> : null}
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
        birth_number: <Sparkles className="h-6 w-6" />,
        life_path: <Star className="h-6 w-6" />,
        expression: <Zap className="h-6 w-6" />,
        soul_urge: <Heart className="h-6 w-6" />,
        personality: <User className="h-6 w-6" />,
        maturity: <Brain className="h-6 w-6" />,
        profession: <Briefcase className="h-6 w-6" />,
    };

    const COLORS = {
        birth_number: 'text-yellow-300',
        life_path: 'text-yellow-400',
        expression: 'text-cyan-400',
        soul_urge: 'text-pink-400',
        personality: 'text-orange-400',
        maturity: 'text-green-400',
        profession: 'text-teal-400',
    };

    const numberTypes = [
        { key: 'birth_number', title: 'Birth Number (Mulank)', type: 'Mulank' },
        { key: 'life_path', title: 'Life Path', type: 'Life Path' },
        { key: 'expression', title: 'Expression', type: 'Expression' },
        { key: 'soul_urge', title: 'Soul Urge', type: 'Soul Urge' },
        { key: 'personality', title: 'Personality', type: 'Personality' },
        { key: 'maturity', title: 'Maturity', type: 'Maturity' },
    ];

    const typeToTable = {
        'Mulank': 'birth_number_meanings',
        'Life Path': 'life_path_meanings',
        'Expression': 'expression_meanings',
        'Soul Urge': 'soul_urge_meanings',
        'Personality': 'personality_meanings',
        'Maturity': 'maturity_meanings',
    };

    useEffect(() => {
        const fetchInterpretations = async () => {
            setLoading(true);
            const fetchedInterpretations = {};
            const promises = numberTypes.map(async (item) => {
                const raw = results[item.key];
                const number = raw && typeof raw === 'object' && raw.number !== undefined ? raw.number : raw;
                if (number || number === 0) {
                    // Try dedicated table first
                    const tableName = typeToTable[item.type] || null;
                    let found = null;
                    if (tableName) {
                        try {
                            const { data, error } = await supabase
                                .from(tableName)
                                .select('title, description, profession, keywords, advice')
                                .eq('number', number)
                                .maybeSingle();
                            if (!error && data) {
                                found = data;
                            }
                        } catch (e) {
                            // ignore and fallback
                        }
                    }

                    if (!found) {
                        // Fallback to generic number_interpretations
                        try {
                            const { data, error } = await supabase
                                .from('number_interpretations')
                                .select('title, description, profession')
                                .eq('number', number)
                                .eq('type', item.type)
                                .maybeSingle();
                            if (!error && data) {
                                found = data;
                            }
                        } catch (e) {
                            // ignore
                        }
                    }

                    if (found) {
                        // Normalize fields
                        fetchedInterpretations[item.key] = {
                            title: found.title || `${item.title} ${number}`,
                            description: found.description || '',
                            profession: found.profession || null,
                            keywords: found.keywords || [],
                            advice: found.advice || null,
                        };
                    } else {
                        fetchedInterpretations[item.key] = {
                            title: `${item.title} ${number}`,
                            description: `Meaning for ${item.title} ${number} not found.`,
                            profession: null,
                            keywords: [],
                            advice: null,
                        };
                    }
                }
            });

            await Promise.all(promises);

            // Fetch suggested professions based on life_path + mulank combination first
            let fetchedProfession = null;
            const lifeRaw = results.life_path;
            const lifeNumber = lifeRaw && typeof lifeRaw === 'object' && lifeRaw.number !== undefined ? lifeRaw.number : lifeRaw;
            const birthRaw = results.birth_number;
            const mulankNumber = birthRaw && typeof birthRaw === 'object' && birthRaw.number !== undefined ? birthRaw.number : birthRaw;

            if (mulankNumber != null && lifeNumber != null) {
                try {
                    const { data: profData, error: profError } = await supabase
                        .from('professions')
                        .select('profession')
                        .eq('mulank', mulankNumber)
                        .eq('life_path', lifeNumber)
                        .maybeSingle();
                    if (!profError && profData && profData.profession) {
                        fetchedProfession = profData.profession;
                    }
                } catch (e) {
                    // ignore and fallback
                }
            }

            if (!fetchedProfession && lifeNumber != null) {
                try {
                    const { data: profData, error: profError } = await supabase
                        .from('number_interpretations')
                        .select('profession')
                        .eq('number', lifeNumber)
                        .eq('type', 'Life Path')
                        .maybeSingle();
                    if (!profError && profData && profData.profession) {
                        fetchedProfession = profData.profession;
                    }
                } catch (e) {
                    // ignore
                }
            }

            setInterpretations(fetchedInterpretations);
            setLoading(false);

            if (fetchedProfession) {
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
                    const numberValue = raw && typeof raw === 'object' && raw.number !== undefined ? raw.number : raw;
                    return (
                        <NumberResult
                            key={item.key}
                            icon={ICONS[item.key]}
                            title={item.title}
                            number={numberValue}
                            description={interpretations[item.key]?.description || ''}
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
        </div>
    );
};

export default BasicResultDisplay;
