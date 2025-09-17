import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useParams, Link, Navigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { ArrowLeft, Star, AlertTriangle, Palette, Heart, User, Zap, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import supabase from '@/lib/customSupabaseClient';
    import UsageInstructions from '@/components/UsageInstructions';
    import { trackVisit } from '@/lib/analytics';

    const ExploreNumberPage = () => {
        const { number } = useParams();
        const [numData, setNumData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const numberFromPath = pathParts[pathParts.length - 1];

            trackVisit(`explore_${numberFromPath}`);
            
            const blockCtx = e => e.preventDefault();
            const blockSel = e => e.preventDefault();
            const blockCopy = e => { e.preventDefault(); return false; };
            document.addEventListener('contextmenu', blockCtx);
            document.addEventListener('selectstart', blockSel);
            document.addEventListener('copy', blockCopy);

            const fetchNumberData = async () => {
                const parsedNumber = parseInt(numberFromPath);
                if (isNaN(parsedNumber) || parsedNumber < 1 || parsedNumber > 9) {
                    setError(true);
                    setLoading(false);
                    return;
                }

                setLoading(true);
                const { data, error } = await supabase
                    .from('numerology_numbers')
                    .select('*')
                    .eq('number', parsedNumber)
                    .single();

                if (error || !data) {
                    console.error('Error fetching number data:', error);
                    setError(true);
                } else {
                    setNumData(data);
                }
                setLoading(false);
            };

            fetchNumberData();

            return () => {
                document.removeEventListener('contextmenu', blockCtx);
                document.removeEventListener('selectstart', blockSel);
                document.removeEventListener('copy', blockCopy);
            };
        }, [number]);

        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-screen bg-[#111119]">
                    <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
                </div>
            );
        }

        if (error || !numData) {
            return <Navigate to="/404" replace />;
        }

        const pageVariants = {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.5 } },
        };

        const sectionVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        };
        
        const exploreInstructions = (
            <p>
                You are exploring Number {numData.number}. Scroll down to see details about its Strengths, Weaknesses, and more. Use the "Back to Home" button to return and explore other numbers.
            </p>
        );


        const ListCard = ({ title, items, icon, colorClass, itemIcon }) => (
            <motion.div variants={sectionVariants} className="bg-[#1C162D] border border-purple-500/20 rounded-xl p-6 h-full">
                <div className={`flex items-center gap-3 mb-4 ${colorClass}`}>
                    {icon}
                    <h3 className="font-bold text-lg text-white">{title}</h3>
                </div>
                <ul className="space-y-3">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-400">
                            <span className="mt-1.5 h-4 w-4 flex-shrink-0 flex items-center justify-center">
                               {itemIcon}
                            </span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        );

        const InfoCard = ({ title, content, icon }) => (
            <motion.div variants={sectionVariants} className="bg-[#1C162D] border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 text-purple-400">
                    {icon}
                    <h3 className="font-bold text-lg text-white">{title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">{content}</p>
            </motion.div>
        );

        return (
            <>
                <Helmet>
                    <title>{`Number ${numData.number}: ${numData.name} - Numerology Destiny`}</title>
                    <meta name="description" content={numData.description} />
                    <meta property="og:title" content={`Number ${numData.number}: ${numData.name}`} />
                    <meta property="og:description" content={numData.description} />
                </Helmet>
                <motion.div 
                    className="max-w-5xl mx-auto p-4 sm:p-6 no-select"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="my-4 flex justify-between items-center">
                        <Button asChild variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/10">
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                        <UsageInstructions instructions={exploreInstructions} storageKey={`sc_help_dismissed_explore_${numData.number}`} />
                    </motion.div>

                    <div className="bg-[#1C162D]/50 border border-purple-500/20 rounded-lg p-4 text-center my-8">
                        <span className="text-gray-500 text-sm">Advertisement Space</span>
                    </div>

                    <motion.header 
                        className="text-center my-12 bg-[#1C162D] border border-purple-500/20 rounded-xl p-8"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-8xl md:text-9xl font-black text-purple-400 mb-0">{numData.number}</h1>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white -mt-2">{numData.name}</h2>
                        <p className="mt-2 text-lg font-semibold text-purple-300">{numData.title}</p>
                        <p className="mt-6 text-gray-300 max-w-3xl mx-auto leading-relaxed">{numData.description}</p>
                    </motion.header>

                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    >
                        <ListCard title="Strengths" items={numData.strengths} icon={<Star className="h-6 w-6" />} colorClass="text-yellow-400" itemIcon={<Star className="h-2.5 w-2.5 text-yellow-300" />} />
                        <ListCard title="Weaknesses" items={numData.weaknesses} icon={<AlertTriangle className="h-6 w-6" />} colorClass="text-red-400" itemIcon={<AlertTriangle className="h-2.5 w-2.5 text-red-400" />} />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                         <div className="bg-[#1C162D]/50 border border-purple-500/20 rounded-lg p-8 text-center h-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Advertisement Space</span>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-[#1C162D]/50 border border-purple-500/20 rounded-lg p-8 text-center h-full flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Advertisement Space</span>
                            </div>
                            <div className="grid grid-rows-2 gap-6">
                                <motion.div variants={sectionVariants} className="bg-[#1C162D] border border-purple-500/20 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                                        <Palette className="h-6 w-6" />
                                        <h3 className="font-bold text-lg text-white">Lucky Colors</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {numData.lucky_colors.map(color => (
                                            <span key={color} className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-md text-sm">{color}</span>
                                        ))}
                                    </div>
                                </motion.div>
                                <motion.div variants={sectionVariants} className="bg-[#1C162D] border border-purple-500/20 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                                        <Heart className="h-6 w-6" />
                                        <h3 className="font-bold text-lg text-white">Compatible Numbers</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {numData.compatible_numbers.map(num => (
                                            <span key={num} className="bg-purple-500/20 text-purple-300 h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold">{num}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 my-6">
                        <InfoCard title="Personality Traits" content={numData.personality_traits} icon={<User className="h-6 w-6" />} />
                        <InfoCard title="Life Path Guidance" content={numData.life_path_guidance} icon={<Zap className="h-6 w-6" />} />
                    </div>

                    <div className="bg-[#1C162D]/50 border border-purple-500/20 rounded-lg p-8 text-center my-8">
                        <span className="text-gray-500 text-sm">Advertisement Space</span>
                    </div>

                </motion.div>
            </>
        );
    };

    export default ExploreNumberPage;
