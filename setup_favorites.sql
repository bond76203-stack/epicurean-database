CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  recipe_id text NOT NULL,
  recipe_name text,
  recipe_image text,
  recipe_time integer,
  recipe_calories text,
  is_external boolean DEFAULT false,
  link text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" 
  ON public.favorites 
  FOR ALL 
  USING (auth.uid() = user_id);
