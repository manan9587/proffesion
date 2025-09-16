import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';

const UsageInstructions = ({ instructions, storageKey }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(storageKey);
        if (!dismissed) {
            setIsOpen(true);
        }
    }, [storageKey]);

    const handleDismiss = () => {
        localStorage.setItem(storageKey, 'true');
        setIsOpen(false);
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    }

    const panelVariants = {
        hidden: { opacity: 0, y: -20, height: 0 },
        visible: { opacity: 1, y: 0, height: 'auto' }
    };

    return (
        <div className="mb-8">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="panel"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                             <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-purple-300 mt-0.5 flex-shrink-0" />
                                <div className="text-gray-300 text-sm">
                                    <p className="font-bold text-white mb-2">How to use</p>
                                    {instructions}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-7 w-7 text-gray-400 hover:text-white">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                 <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8 text-gray-400 hover:text-white">
                        <Info className="h-5 w-5" />
                    </Button>
                 </div>
            )}
        </div>
    );
};

export default UsageInstructions;