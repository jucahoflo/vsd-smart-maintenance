import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqwkfpibyovajodohyoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxd2tmcGlieW92YWpvZG9oeW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTY3NzEsImV4cCI6MjEwMjM5Mjc3MX0.5zDmWkNF-4uTBasspHlCZbqP5L1yvwbiP_2-nY0DgzA';

console.log('🔌 Conectando a Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Cargar datos con caché
let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

export const getCachedData = async (table) => {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_DURATION) {
    console.log('📦 Usando datos en caché');
    return cache;
  }
  
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('codigo_vsd', { ascending: true });
    
    if (error) throw error;
    
    cache = data;
    cacheTime = now;
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

export { supabase };
export default supabase;
