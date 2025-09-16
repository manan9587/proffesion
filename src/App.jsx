import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import NumberPage from '@/pages/NumberPage';
import ExploreNumberPage from '@/pages/ExploreNumberPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AuthPage from '@/pages/AuthPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import CalculatorsPage from '@/pages/CalculatorsPage';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import Footer from '@/components/Footer';
import LegalPage from '@/pages/LegalPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { trackVisit } from '@/lib/analytics';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';

function App() {

  useEffect(() => {
    let sessionId = sessionStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('user_session_id', sessionId);
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <EnhancedErrorBoundary>
          <div className="flex flex-col min-h-screen bg-[#111119] text-white">
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                
                <Route path="/number/:number" element={<NumberPage />} />

                <Route path="/explore/1" element={<ExploreNumberPage />} />
                <Route path="/explore/2" element={<ExploreNumberPage />} />
                <Route path="/explore/3" element={<ExploreNumberPage />} />
                <Route path="/explore/4" element={<ExploreNumberPage />} />
                <Route path="/explore/5" element={<ExploreNumberPage />} />
                <Route path="/explore/6" element={<ExploreNumberPage />} />
                <Route path="/explore/7" element={<ExploreNumberPage />} />
                <Route path="/explore/8" element={<ExploreNumberPage />} />
                <Route path="/explore/9" element={<ExploreNumberPage />} />
                <Route path="/explore/:number" element={<ExploreNumberPage />} />
                
                <Route path="/calculators" element={<CalculatorsPage />} />

                <Route path="/auth" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/privacy-policy" element={<LegalPage pageSlug="privacy-policy" />} />
                <Route path="/terms-of-use" element={<LegalPage pageSlug="terms-of-use" />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </EnhancedErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;