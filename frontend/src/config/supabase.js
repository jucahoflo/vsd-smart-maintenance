import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qztpmddggqdmaykelcpz.supabase.co'
// ✅ ESTA ES LA ANON KEY CORRECTA (La que empieza por eyJ...)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dHBtZGRnZ3FkbWF5a2VsY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDE1OTQsImV4cCI6MjEwMDY3NzU5NH0.JNVlg-01ljmloM0_NW0l98GaRNwVfRe-Z_AFSp9mLjE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
