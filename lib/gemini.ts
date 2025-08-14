// Gemini API integration for generating grammar questions
export interface GrammarQuestion {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation: string
  grammar_type: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
}

export async function generateGrammarQuestions(
  grammarType: string,
  difficultyLevel: "beginner" | "intermediate" | "advanced",
  count = 5,
): Promise<GrammarQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  const prompt = `Generate ${count} English grammar questions about ${grammarType} at ${difficultyLevel} level.

For each question, provide:
1. A sentence with a blank (use _____ for the blank)
2. Four multiple choice options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. A brief explanation of why the answer is correct
5. Grammar type: ${grammarType}
6. Difficulty level: ${difficultyLevel}

Format the response as a JSON array with this exact structure:
[
  {
    "question_text": "She _____ to school every day.",
    "option_a": "go",
    "option_b": "goes",
    "option_c": "going",
    "option_d": "gone",
    "correct_answer": "B",
    "explanation": "Use 'goes' for third person singular in present simple tense.",
    "grammar_type": "${grammarType}",
    "difficulty_level": "${difficultyLevel}"
  }
]

Make sure the questions are varied, educational, and appropriate for the ${difficultyLevel} level.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error("No content generated from Gemini API")
    }

    // Extract JSON from the response (remove any markdown formatting)
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Gemini response")
    }

    const questions: GrammarQuestion[] = JSON.parse(jsonMatch[0])

    // Validate the questions
    questions.forEach((q, index) => {
      if (
        !q.question_text ||
        !q.option_a ||
        !q.option_b ||
        !q.option_c ||
        !q.option_d ||
        !q.correct_answer ||
        !q.explanation ||
        !q.grammar_type ||
        !q.difficulty_level
      ) {
        throw new Error(`Invalid question format at index ${index}`)
      }
      if (!["A", "B", "C", "D"].includes(q.correct_answer)) {
        throw new Error(`Invalid correct_answer at index ${index}: ${q.correct_answer}`)
      }
    })

    return questions
  } catch (error) {
    console.error("Error generating questions with Gemini:", error)
    throw error
  }
}
