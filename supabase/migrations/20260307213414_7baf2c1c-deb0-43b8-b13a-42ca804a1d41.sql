-- Create skill test results table
CREATE TABLE public.skill_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  language TEXT,
  tier TEXT NOT NULL,
  level TEXT NOT NULL,
  score TEXT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test results"
  ON public.skill_test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results"
  ON public.skill_test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_skill_test_results_user_id ON public.skill_test_results(user_id);
CREATE INDEX idx_skill_test_results_created_at ON public.skill_test_results(created_at DESC);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
