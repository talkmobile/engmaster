// Gemini API integration for generating G-TELP grammar questions
export interface GrammarQuestion {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation: string
  grammar_type: string
  difficulty_level: "초급" | "중급" | "고급"
}

export async function generateGrammarQuestions(
  grammarType: string,
  difficultyLevel: "초급" | "중급" | "고급",
  count = 1,
): Promise<GrammarQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  const prompt = `너는 G-TELP 문법 출제자야. [문법유형: ${grammarType}], [난이도: ${difficultyLevel}]에 맞는 4지선다형 영어 문법 문제를 ${count}문항 만들어줘. 

문장은 빈칸이 한 곳 있으며, 보기 4개와 정답, 간단한 해설도 함께 제공해줘. 

출력 형식은 아래와 같아:
문제: (빈칸이 있는 영어 문장)
보기: A. B. C. D.
정답: (정답 보기의 알파벳)
해설: (정답이 왜 맞는지 한 문장으로 간단히 설명)
문법유형: ${grammarType}
난이도: ${difficultyLevel}

응답은 반드시 다음과 같은 JSON 배열 형태로만 제공해줘:
[
  {
    "question_text": "She _____ to school every day.",
    "option_a": "go",
    "option_b": "goes", 
    "option_c": "going",
    "option_d": "gone",
    "correct_answer": "B",
    "explanation": "3인칭 단수 주어에는 현재시제 동사에 -s를 붙여 'goes'를 사용합니다.",
    "grammar_type": "${grammarType}",
    "difficulty_level": "${difficultyLevel}"
  }
]

G-TELP 시험 스타일에 맞게 실용적이고 정확한 문제를 만들어줘.`

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

      if (!["초급", "중급", "고급"].includes(q.difficulty_level)) {
        throw new Error(`Invalid difficulty_level at index ${index}: ${q.difficulty_level}`)
      }
    })

    return questions
  } catch (error) {
    console.error("Error generating G-TELP questions with Gemini:", error)
    throw error
  }
}
