import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
if (!process.env.SUPABASE_URL || !KEY) {
  throw new Error("Missing SUPABASE_URL or key in .env");
}

export const supabase = createClient(process.env.SUPABASE_URL, KEY);

/**
 * ✅ Fetch user verification data by Supabase user_id
 */
export async function getUserById(userId) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("permission, public_data, image_url")
    .eq("user_id", userId)
    .single();

  if (error || !profile) {
    console.error("❌ Profile lookup failed for user_id:", userId, error?.message);
    return null;
  }

  const name = profile.public_data?.name?.trim() || "Unnamed User";

  return {
    name,
    image_url: profile.image_url || null,
    permission: profile.permission,
    timestamp: new Date().toLocaleString()
  };
}

/**
 * Public profile by username
 */
export async function getPublicProfileData(username) {
  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (userErr || !userData) throw new Error('User not found');

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
  if (profileErr || !profileData) throw new Error('Profile not found');

  return {
    ...(profileData.public_data || {}),
    image_url: profileData.image_url,
    instagram_url: profileData.instagram_url,
    whatsapp_number: profileData.whatsapp_number,
    linkedin_url: profileData.linkedin_url,
    pitch_deck_url: profileData.pitch_deck_url
  };
}

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
  if (error || !p) throw new Error('Profile not found');

  return {
    ...(p.public_data || {}),
    image_url: p.image_url,
    instagram_url: p.instagram_url,
    whatsapp_number: p.whatsapp_number,
    linkedin_url: p.linkedin_url,
    pitch_deck_url: p.pitch_deck_url
  };
}

export async function getProtectedProfileData(username, token) {
  const { data: u, error: ue } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();
  if (ue || !u) throw new Error('User not found');

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
  if (pe || !p) throw new Error('Profile not found');

  if (!p.protected_url?.includes(`token=${token}`)) throw new Error('Invalid token');

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
  if (ue2) throw new Error('Failed to update token amount');

  return { message: 'Token amount updated successfully!' };
}
