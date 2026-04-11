import { createClient } from "@supabase/supabase-js";

const SUPA_URL = "https://pfmtuvtlgxooydivaydy.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbXR1dnRsZ3hvb3lkaXZheWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzk2NTksImV4cCI6MjA4ODY1NTY1OX0.YnckW9h5myTX9Q2qN2Db_ZlzrzWP2XpT7sm2o1QwSao";

export const supabase = createClient(SUPA_URL, SUPA_KEY);

export const db = supabase;
