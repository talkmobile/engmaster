import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("Users count error:", usersError)
    }

    // Get total questions
    const { count: totalQuestions, error: questionsError } = await supabase
      .from("grammar_questions")
      .select("*", { count: "exact", head: true })

    if (questionsError) {
      console.error("Questions count error:", questionsError)
    }

    // Get total quiz sessions
    const { count: totalSessions, error: sessionsError } = await supabase
      .from("quiz_sessions")
      .select("*", { count: "exact", head: true })

    if (sessionsError) {
      console.error("Sessions count error:", sessionsError)
    }

    // Get questions by grammar type
    const { data: questionsByType, error: typeError } = await supabase.from("grammar_questions").select("grammar_type")

    const grammarTypeStats =
      questionsByType?.reduce((acc: any, q) => {
        acc[q.grammar_type] = (acc[q.grammar_type] || 0) + 1
        return acc
      }, {}) || {}

    // Get questions by difficulty
    const { data: questionsByDifficulty, error: difficultyError } = await supabase
      .from("grammar_questions")
      .select("difficulty_level")

    const difficultyStats =
      questionsByDifficulty?.reduce((acc: any, q) => {
        acc[q.difficulty_level] = (acc[q.difficulty_level] || 0) + 1
        return acc
      }, {}) || {}

    // Get recent activity (last 10 quiz sessions)
    const { data: recentActivity, error: activityError } = await supabase
      .from("quiz_sessions")
      .select(`
        *,
        user_profiles!inner(email)
      `)
      .order("completed_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalQuestions: totalQuestions || 0,
        totalSessions: totalSessions || 0,
        grammarTypeStats,
        difficultyStats,
        recentActivity: recentActivity || [],
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch admin statistics" }, { status: 500 })
  }
}
