import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseのURLとAnon Keyを取得します
// ※実際に連携するには、プロジェクトのルートディレクトリに .env ファイルを作成し
// VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定する必要があります。

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
