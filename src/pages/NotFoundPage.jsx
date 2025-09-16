import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => {
    return (
        <>
            <Helmet>
                <title>404 - Page Not Found</title>
                <meta name="description" content="The page you are looking for does not exist." />
            </Helmet>
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-900 text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="max-w-md"
                >
                    <AlertTriangle className="h-24 w-24 mx-auto text-yellow-400 mb-6" />
                    <h1 className="text-8xl font-extrabold text-white tracking-tighter">404</h1>
                    <h2 className="text-3xl font-semibold mt-2 mb-4">Page Not Found</h2>
                    <p className="text-gray-400 mb-8">
                        Oops! It seems you've wandered into the cosmic void. The page you're looking for isn't here.
                    </p>
                    <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                        <Link to="/">
                            Return to Home
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </>
    );
};

export default NotFoundPage;