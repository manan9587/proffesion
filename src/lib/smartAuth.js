import supabase from '@/lib/customSupabaseClient';

/**
 * Attempts to sign in a user. If sign-in fails with "Invalid login credentials",
 * it automatically attempts to create a new account with the same credentials.
 * @param {string} email - The user's email or a name/date identifier.
 * @param {string} password - The user's password or date identifier.
 * @returns {Promise<{user: object|null, session: object|null, error: object|null, isNewUser: boolean}>}
 */
export const smartAuth = async (email, password) => {
  // If caller passed a name instead of email, synthesize a deterministic pseudo-email
  const looksLikeEmail = typeof email === 'string' && email.includes('@');
  const rawIdentifier = String(email || 'user');
  const rawPassword = String(password || '');

  let authEmail = rawIdentifier;
  let authPassword = rawPassword;

  if (!looksLikeEmail) {
    // create safe local email from name + date (or other identifier)
    const namePart = rawIdentifier
      .toLowerCase()
      .replace(/[^a-z0-9._+-]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '') || 'user';
    const datePart = rawPassword.replace(/[^0-9]/g, '') || '00000000';
    authEmail = `${namePart}.${datePart}@anon.numerology`;
    // ensure password is valid length; if not, fall back to a safe generated password
    if (!authPassword || authPassword.length < 6) {
      authPassword = `nm-${datePart}-${Math.random().toString(36).slice(2,10)}`;
    }
  }

  // 1. Attempt to sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: authPassword,
  });

  if (signInError) {
    // 2. If sign-in fails because user doesn't exist or invalid credentials, try to sign up
    const msg = (signInError.message || '').toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('user not found') || msg.includes('invalid credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });

      if (signUpError) {
        // Return the sign-up error so caller can display proper message
        return { user: null, session: null, error: signUpError, isNewUser: false };
      }

      return {
        user: signUpData.user,
        session: signUpData.session,
        error: null,
        isNewUser: true,
      };
    } else {
      // Other sign-in errors (e.g., invalid password) — surface them
      return { user: null, session: null, error: signInError, isNewUser: false };
    }
  }

  // 3. If sign-in is successful
  return {
    user: signInData.user,
    session: signInData.session,
    error: null,
    isNewUser: false,
  };
};
