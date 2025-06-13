// server/db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file (one level up)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug logging for env values
console.log("🌐 SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("🔑 Keys loaded:", "ANON?", !!process.env.SUPABASE_ANON_KEY, "SERVICE?", !!process.env.SUPABASE_SERVICE_KEY);

// Choose service role key if available, else anon key
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
if (!process.env.SUPABASE_URL || !KEY) {
  throw new Error("Missing SUPABASE_URL or key in .env");
}

// Initialize Supabase client
export const supabase = createClient(process.env.SUPABASE_URL, KEY);

/**
 * Fetch public profile by username
 */
export async function getPublicProfileData(username) {
  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (userErr || !userData) {
    console.error("❌ User lookup failed:", userErr?.message);
    throw new Error('User not found');
  }

  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select(`
      public_data,
      image_url,
      instagram_url,
      whatsapp_number,
      linkedin_url,
      pitch_deck_url
    `)
    .eq('user_id', userData.id)
    .single();
  if (profileErr || !profileData) {
    console.error("❌ Profile lookup failed:", profileErr?.message);
    throw new Error('Profile not found');
  }

  return {
    ...(profileData.public_data || {}),
    image_url: profileData.image_url,
    instagram_url: profileData.instagram_url,
    whatsapp_number: profileData.whatsapp_number,
    linkedin_url: profileData.linkedin_url,
    pitch_deck_url: profileData.pitch_deck_url
  };
}

/**
 * Fetch public profile by user_id
 */
export async function getPublicProfileDataById(userId) {
  const { data: p, error } = await supabase
    .from('profiles')
    .select(`
      public_data,
      image_url,
      instagram_url,
      whatsapp_number,
      linkedin_url,
      pitch_deck_url
    `)
    .eq('user_id', userId)
    .single();
  if (error || !p) {
    console.error("❌ Profile lookup by ID failed:", error?.message);
    throw new Error('Profile not found');
  }

  return {
    ...(p.public_data || {}),
    image_url: p.image_url,
    instagram_url: p.instagram_url,
    whatsapp_number: p.whatsapp_number,
    linkedin_url: p.linkedin_url,
    pitch_deck_url: p.pitch_deck_url
  };
}

/**
 * Fetch protected profile with token
 */
export async function getProtectedProfileData(username, token) {
  const { data: u, error: ue } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (ue || !u) {
    console.error("❌ Protected user lookup failed:", ue?.message);
    throw new Error('User not found');
  }

  const { data: p, error: pe } = await supabase
    .from('profiles')
    .select(`
      public_data,
      protected_data,
      protected_url,
      image_url,
      instagram_url,
      whatsapp_number,
      linkedin_url,
      pitch_deck_url
    `)
    .eq('user_id', u.id)
    .single();
  if (pe || !p) {
    console.error("❌ Protected profile lookup failed:", pe?.message);
    throw new Error('Profile not found');
  }

  if (!p.protected_url?.includes(`token=${token}`)) {
    console.warn("⚠️ Invalid protected token:", token);
    throw new Error('Invalid token');
  }

  return {
    ...(p.public_data || {}),
    ...(p.protected_data || {}),
    image_url: p.image_url,
    instagram_url: p.instagram_url,
    whatsapp_number: p.whatsapp_number,
    linkedin_url: p.linkedin_url,
    pitch_deck_url: p.pitch_deck_url
  };
}

/**
 * Update token amount in protected_data
 */
export async function updateTokenAmount(username, token, newTokenAmount) {
  const { data: u, error: ue } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (ue || !u) throw new Error('User not found');

  const { data: p, error: pe } = await supabase
    .from('profiles')
    .select('protected_data, protected_url')
    .eq('user_id', u.id)
    .single();
  if (pe || !p) throw new Error('Profile not found');

  if (!p.protected_url?.includes(`token=${token}`)) throw new Error('Invalid token');

  const updatedProtected = {
    ...p.protected_data,
    token_amount: parseFloat(newTokenAmount)
  };

  const { error: ue2 } = await supabase
    .from('profiles')
    .update({ protected_data: updatedProtected })
    .eq('user_id', u.id);
  if (ue2) {
    console.error("❌ Token update failed:", ue2.message);
    throw new Error('Failed to update token amount');
  }

  return { message: 'Token amount updated successfully!' };
}
