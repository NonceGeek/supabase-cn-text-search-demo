import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Import the load function from deno-dotenv
import { config} from "https://deno.land/x/dotenv/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const router = new Router();

router
    .get("/search", async (context) => {
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

        if (error) {
            context.response.status = 500;
            context.response.body = { error: error.message };
            return;
        }

        context.response.body = data;
    })

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });