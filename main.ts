import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Import the load function from deno-dotenv
import { config } from "https://deno.land/x/dotenv/mod.ts";

// Load environment variables from the .env file
const env = config();
// Access the environment variables
const supabaseUrl = env.SUPABASE_URL ?? "";
const supabaseKey = env.SUPABASE_KEY ?? "";
// create a new Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)
// perform a stored procedure call
const { data, error } = await supabase.rpc("search_books", {
    query_text: "兔",
    max_results: 2
})

console.log(data, error)