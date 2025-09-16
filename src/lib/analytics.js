import { supabase } from './customSupabaseClient';

export const trackVisit = async (page_section) => {
    try {
        const sessionId = sessionStorage.getItem('user_session_id');
        if (!sessionId) return;
        
        const { data: { session } } = await supabase.auth.getSession();

        await supabase.functions.invoke('track-visit', {
            body: { 
                page_section, 
                session_id: sessionId,
                auth_token: session?.access_token,
             },
        });

    } catch (error) {
        // We can silently fail here as it's not critical for UX
        console.error('Error tracking visit:', error);
    }
};