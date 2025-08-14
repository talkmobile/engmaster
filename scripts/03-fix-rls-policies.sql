-- Add missing INSERT policy for grammar_questions table
CREATE POLICY "Service role can insert grammar questions" ON public.grammar_questions
  FOR INSERT TO service_role WITH CHECK (true);

-- Allow authenticated users to insert questions (for admin functionality)
CREATE POLICY "Authenticated users can insert grammar questions" ON public.grammar_questions
  FOR INSERT TO authenticated WITH CHECK (true);
