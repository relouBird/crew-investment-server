import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Create a single supabase client for interacting with your database
const SupabaseConfig = createClient(
  String(process.env.SUPABASE_URL),
  String(process.env.SUPABASE_SERVICE_ROLE),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default SupabaseConfig;
