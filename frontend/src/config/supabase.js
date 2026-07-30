import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qztpmddggqdmaykelcpz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dHBtZGRnZ3FkbWF5a2VsY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDE1OTQsImV4cCI6MjEwMDY3NzU5NH0.JNVlg-01ljmloM0_NW0l98GaRNwVfRe-Z_AFSp9mLjE';

// Crear cliente con opciones
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const STORAGE_BUCKET = 'vfd-images';
