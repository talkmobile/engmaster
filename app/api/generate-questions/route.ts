import { type NextRequest, NextResponse } from "next/server"
import { generateGrammarQuestions } from "@/lib/gemini"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: NextRequest) {
  try {
    const { grammarType, difficultyLevel, count = 5 } = await request.json()

    // Validate input
    if (!grammarType || !difficultyLevel) {
      return NextResponse.json({ error: "Grammar type and difficulty level are required" }, { status: 400 })
    }

    if (!["beginner", "intermediate", "advanced"].includes(difficultyLevel)) {
      return NextResponse.json({ error: "Invalid difficulty level" }, { status: 400 })
    }

    // Generate questions using Gemini API
    const questions = await generateGrammarQuestions(grammarType, difficultyLevel, count)

    const supabase = createServiceClient()
    const { data, error } = await supabase.from("grammar_questions").insert(questions).select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save questions to database" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      questions: data,
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("Error in generate-questions API:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
