
CREATE POLICY "public read quiz-audio" ON storage.objects FOR SELECT USING (bucket_id = 'quiz-audio');
CREATE POLICY "public upload quiz-audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'quiz-audio');
CREATE POLICY "public delete quiz-audio" ON storage.objects FOR DELETE USING (bucket_id = 'quiz-audio');
