import { createClient } from '@supabase/supabase-js';

// Απευθείας ενσωμάτωση των κλειδιών για άμεσο deployment χωρίς καθυστερήσεις
const supabaseUrl = 'https://xbricpdkqhclyfoowxeq.supabase.co';
const supabaseAnonKey = 'sb_publishable_7-DEyJJSNd0Dd9pOf7Xt7w_s7p2ZaEi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);