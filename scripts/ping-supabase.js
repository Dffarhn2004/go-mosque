import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const table = process.env.SUPABASE_HEALTH_TABLE || "health_check";

function fail(message, detail) {
  console.error(message);
  if (detail) {
    console.error(detail);
  }
  process.exit(1);
}

if (!url) {
  fail("Missing SUPABASE_URL. Set it as a GitHub Actions secret.");
}

const apiKey = serviceRoleKey || anonKey;
if (!apiKey) {
  fail(
    "Missing Supabase API key. Set SUPABASE_ANON_KEY (and optionally SUPABASE_SERVICE_ROLE_KEY) as GitHub Actions secrets."
  );
}

const supabase = createClient(url, apiKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data, error } = await supabase.from(table).select("*").limit(1);

if (error) {
  fail(
    `Supabase health check failed on table "${table}".`,
    `Code: ${error.code ?? "n/a"} | Message: ${error.message}`
  );
}

const rows = Array.isArray(data) ? data.length : 0;
const timestamp = new Date().toISOString();
console.log(
  `Supabase health check succeeded at ${timestamp} (table="${table}", rows=${rows}).`
);
