// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Cliente público (para autenticación)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente administrativo (solo backend)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log(`🔗 Conectado a Supabase: ${supabaseUrl}`);

module.exports = { supabase, supabaseAdmin };