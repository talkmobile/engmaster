import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { grammarType, difficultyLevel, questions, answers, score } = await request.json()

    // Get the authenticated user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user profile exists
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({ id: user.id, email: user.email }, { onConflict: "id" })

    if (profileError) {
      console.error("Profile upsert error:", profileError)
    }

    // Save quiz session
    const { data: sessionData, error: sessionError } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: user.id,
        grammar_type: grammarType,
        difficulty_level: difficultyLevel,
        total_questions: questions.length,
        correct_answers: score.correct,
        score_percentage: score.percentage,
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Session save error:", sessionError)
      return NextResponse.json({ error: "Failed to save quiz session" }, { status: 500 })
    }

    // Save individual answers
    const answerRecords = questions.map((question: any, index: number) => ({
      user_id: user.id,
      question_id: question.id,
      selected_answer: answers[index] || "A",
      is_correct: answers[index] === question.correct_answer,
    }))

    const { error: answersError } = await supabase.from("user_answers").upsert(answerRecords, {
      onConflict: "user_id,question_id",
    })

    if (answersError) {
      console.error("Answers save error:", answersError)
      return NextResponse.json({ error: "Failed to save answers" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
    })
  } catch (error) {
    console.error("Error saving quiz results:", error)
    return NextResponse.json({ error: "Failed to save quiz results" }, { status: 500 })
  }
}
