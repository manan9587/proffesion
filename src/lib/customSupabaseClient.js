import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbazahjtivfmescwxpro.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYXphaGp0aXZmbWVzY3d4cHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTQ3MzUsImV4cCI6MjA3MTk3MDczNX0.vc2rjWKOgSoGq4Csv4Qk85cKrDYWlrVWOfIe-9ne5yo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);