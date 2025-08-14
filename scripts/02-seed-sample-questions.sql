-- Added missing semicolon to complete the INSERT statement
-- Re-executing the sample data insertion script
-- Execute this script to add sample grammar questions

-- Insert sample grammar questions
INSERT INTO public.grammar_questions (question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, grammar_type, difficulty_level) VALUES
('She _____ to the store every morning.', 'go', 'goes', 'going', 'gone', 'B', 'Use "goes" for third person singular in present simple tense.', 'Present Simple', 'beginner'),
('I have _____ finished my homework.', 'already', 'yet', 'still', 'never', 'A', '"Already" is used in positive statements to show completion.', 'Present Perfect', 'intermediate'),
('If I _____ rich, I would travel the world.', 'am', 'was', 'were', 'will be', 'C', 'Use "were" in hypothetical conditional sentences (second conditional).', 'Conditionals', 'intermediate'),
('The book _____ by millions of people.', 'read', 'reads', 'was read', 'reading', 'C', 'Use passive voice "was read" for past actions done to the subject.', 'Passive Voice', 'intermediate'),
('_____ you like some coffee?', 'Do', 'Would', 'Will', 'Are', 'B', 'Use "Would" for polite offers and requests.', 'Modal Verbs', 'beginner');
