import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    
import express from "express";
import { supabase } from "./db.js";

const router = express.Router();

// ✅ Public Profile Route (Returns General Details)
router.get("/:username", async (req, res) => {
    const { username } = req.params;

    const { data, error } = await supabase
        .from("profiles")
        .select("public_data")
        .eq("public_url", `/profile/${username}`)
        .single();

    if (error || !data) return res.status(404).json({ error: "Profile not found" });

    res.json(data.public_data);
});

// ✅ Protected Profile Route (Returns Address & Token Amount)
router.get("/:username/protected", async (req, res) => {
    const { username } = req.params;
    const { token } = req.query;

    if (!token) return res.status(403).json({ error: "Access Denied" });

    const { data, error } = await supabase
        .from("profiles")
        .select("protected_data, token_amount")
        .eq("protected_url", `/profile/${username}/protected?token=${token}`)
        .single();

    if (error || !data) return res.status(404).json({ error: "Invalid Token or Profile Not Found" });

    res.json({
        address: data.protected_data.address,
        token_amount: data.token_amount
    });
});

// ✅ Modify Token Amount (Only via Protected Access)
router.post("/:username/update-token", async (req, res) => {
    const { username } = req.params;
    const { token, new_token_amount } = req.body;

    if (!token) return res.status(403).json({ error: "Access Denied" });

    const { error } = await supabase
        .from("profiles")
        .update({ token_amount: new_token_amount })
        .eq("protected_url", `/profile/${username}/protected?token=${token}`);

    if (error) return res.status(500).json({ error: "Failed to update token amount" });

    res.json({ success: true, new_token_amount });
});

export default router;
