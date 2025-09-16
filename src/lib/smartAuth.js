import { supabase } from '@/lib/customSupabaseClient';

/**
 * Attempts to sign in a user. If sign-in fails with "Invalid login credentials",
 * it automatically attempts to create a new account with the same credentials.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{user: object|null, session: object|null, error: object|null, isNewUser: boolean}>}
 */
export const smartAuth = async (email, password) => {
  // 1. Attempt to sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // 2. If sign-in fails because user doesn't exist, try to sign up
    if (signInError.message === 'Invalid login credentials') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        // Handle sign-up errors (e.g., password too short, email already exists but with different casing)
        return { user: null, session: null, error: signUpError, isNewUser: false };
      }
      
      // After sign up, the session is available in signUpData.data
      return { 
        user: signUpData.user, 
        session: signUpData.session, 
        error: null, 
        isNewUser: true 
      };

    } else {
      // Handle other sign-in errors (e.g., network error, email not confirmed)
      return { user: null, session: null, error: signInError, isNewUser: false };
    }
  }

  // 3. If sign-in is successful
  return { 
    user: signInData.user, 
    session: signInData.session, 
    error: null, 
    isNewUser: false 
  };
};