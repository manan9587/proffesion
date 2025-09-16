import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calculator } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1C162D]/50 border-t border-purple-500/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity justify-center md:justify-start">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            <span className="font-bold text-lg text-white">Numerology Destiny</span>
          </Link>
          
          <div className="flex justify-center items-center space-x-6 text-gray-400">
             <Link to="/calculators" className="flex items-center hover:text-white transition-colors duration-200">
               <Calculator className="h-4 w-4 mr-2" />
              Calculators
            </Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms-of-use" className="hover:text-white transition-colors duration-200">
              Terms of Use
            </Link>
          </div>

          <div className="text-center md:text-right text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Numerology Destiny. All rights reserved.</p>
            <p className="mt-1">Designed with cosmic love ✨</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;