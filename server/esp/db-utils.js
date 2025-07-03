// server/esp/db-utils.js
import { supabase } from "../db.js";

/**
 * Fetch verification credential by MAC address.
 * Returns: { lat, lng, radius_m, label } or null
 */
export async function getCredentialByMac(mac_address) {
  const { data, error } = await supabase
    .from("verification_credentials")
    .select("lat, lng, radius_m, label")
    .eq("mac_address", mac_address)
    .single();

  if (error || !data) {
    console.warn("⚠️ MAC not found in verification_credentials:", mac_address);
    return null;
  }

  return data;
}
