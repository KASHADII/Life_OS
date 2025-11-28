console.log('supabaseClient module loaded');
import { createClient } from '@supabase/supabase-js';
import type { AppState } from './types';

// keep your existing env log too
console.log('Vite env check', {
  url: import.meta.env.VITE_SUPABASE_URL,
  anon: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing'
});

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string;
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LIFEOS_USER_ID = '00000000-0000-0000-0000-000000000001'; // single-user demo

export async function loadAppState(): Promise<AppState | null> {
  const { data, error } = await supabase
    .from('lifeos_states')
    .select('state')
    .eq('user_id', LIFEOS_USER_ID)
    .maybeSingle();

  if (error) {
    console.error('Supabase load error', error);
    return null;
  }

  return (data as { state: AppState } | null)?.state ?? null;
}

export async function saveAppState(state: AppState): Promise<void> {
  const { error } = await supabase
    .from('lifeos_states')
    .upsert(
      { user_id: LIFEOS_USER_ID, state },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Supabase save error', error);
  }
}

export async function clearAppState(): Promise<void> {
  const { error } = await supabase
    .from('lifeos_states')
    .delete()
    .eq('user_id', LIFEOS_USER_ID);

  if (error) {
    console.error('Supabase clear error', error);
  }
}

