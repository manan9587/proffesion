import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NumberCard = ({ number }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="bg-[#1C162D] border border-purple-500/20 rounded-xl p-6 text-center transition-all duration-300 hover:bg-[#231C39] hover:border-purple-500/50"
    >
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-5xl font-bold text-purple-400">{number.number}</span>
        <h3 className="text-3xl font-bold text-gray-100">{number.name}</h3>
      </div>
      <p className="text-gray-400 mt-2 mb-6 min-h-[40px]">{number.description.split('.')[0]}.</p>
      <Button asChild size="lg" className="w-full font-bold text-gray-900 bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300">
        <Link to={`/explore/${number.number}`}>Explore Number {number.number}</Link>
      </Button>
    </motion.div>
  );
};

export default NumberCard;