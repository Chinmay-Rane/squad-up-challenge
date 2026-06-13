
CREATE TYPE public.quiz_level AS ENUM ('easy','medium','hard','very_hard','impossible');

CREATE TABLE public.audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level public.quiz_level NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audios TO anon, authenticated;
GRANT ALL ON public.audios TO service_role;
ALTER TABLE public.audios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read audios" ON public.audios FOR SELECT USING (true);
CREATE POLICY "public insert audios" ON public.audios FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete audios" ON public.audios FOR DELETE USING (true);

CREATE TABLE public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_scores TO anon, authenticated;
GRANT ALL ON public.quiz_scores TO service_role;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read quiz_scores" ON public.quiz_scores FOR SELECT USING (true);
CREATE POLICY "public insert quiz_scores" ON public.quiz_scores FOR INSERT WITH CHECK (true);

CREATE TABLE public.racing_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  lap_time_ms INT NOT NULL CHECK (lap_time_ms > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.racing_times TO anon, authenticated;
GRANT ALL ON public.racing_times TO service_role;
ALTER TABLE public.racing_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read racing_times" ON public.racing_times FOR SELECT USING (true);
CREATE POLICY "public insert racing_times" ON public.racing_times FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete racing_times" ON public.racing_times FOR DELETE USING (true);

CREATE TABLE public.aimlabs_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aimlabs_scores TO anon, authenticated;
GRANT ALL ON public.aimlabs_scores TO service_role;
ALTER TABLE public.aimlabs_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read aimlabs_scores" ON public.aimlabs_scores FOR SELECT USING (true);
CREATE POLICY "public insert aimlabs_scores" ON public.aimlabs_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete aimlabs_scores" ON public.aimlabs_scores FOR DELETE USING (true);
