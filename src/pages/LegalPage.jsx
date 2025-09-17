import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import supabase from '@/lib/customSupabaseClient';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LegalPage = ({ pageSlug }) => {
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('legal_content')
        .select('title, content')
        .eq('slug', pageSlug)
        .single();

      if (error) {
        console.error('Error fetching legal content:', error);
        setError('Could not load the page content. Please try again later.');
      } else {
        setPageContent(data);
      }
      setLoading(false);
    };

    fetchContent();
  }, [pageSlug]);

  return (
    <>
      <Helmet>
        <title>{pageContent ? pageContent.title : 'Legal Information'} - Numerology Destiny</title>
        <meta name="description" content={`Read our ${pageContent ? pageContent.title : 'legal information'}.`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-[#111119] to-[#1C162D] py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-red-900/20 border border-red-500/30 rounded-lg p-8">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">An Error Occurred</h2>
              <p className="text-red-300">{error}</p>
            </div>
          )}
          {pageContent && (
            <div className="bg-[#1C162D]/50 border border-purple-500/20 rounded-2xl p-8 sm:p-12 shadow-2xl shadow-purple-900/20">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-purple-400 to-yellow-400">
                {pageContent.title}
              </h1>
              <div className="prose prose-invert prose-lg max-w-none text-gray-300 prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-yellow-300">
                {pageContent.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default LegalPage;
