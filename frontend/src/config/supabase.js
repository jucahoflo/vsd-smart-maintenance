import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qztpmddggqdmaykelcpz.supabase.co';
// IMPORTANTE: Usar la SERVICE_KEY en lugar de la ANON_KEY
// O usar un token de usuario autenticado
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dHBtZGRnZ3FkbWF5a2VsY3B6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEwMTU5NCwiZXhwIjoyMTAwNjc3NTk0fQ.Kec8wbK-x48g55OpPgoFAJYRoLCR--dSyNdi8IdmdXM';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const STORAGE_BUCKET = 'vfd-images';
