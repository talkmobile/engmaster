"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, LogOut, Trophy, Target, BarChart3 } from "lucide-react"
import { signOut } from "@/lib/actions"
import QuizInterface from "@/components/quiz-interface"
import PerformanceDashboard from "@/components/performance-dashboard"

interface QuizDashboardProps {
  user: { id: string; email: string }
}

export default function QuizDashboard({ user }: QuizDashboardProps) {
  const [selectedGrammarType, setSelectedGrammarType] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalQuestions: 0,
  })

  const grammarTypes = [
    "Present Simple",
    "Present Perfect",
    "Past Simple",
    "Past Perfect",
    "Future Tense",
    "Conditionals",
    "Passive Voice",
    "Modal Verbs",
    "Gerunds and Infinitives",
    "Articles",
    "Prepositions",
    "Relative Clauses",
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/performance")
      const data = await response.json()
      if (data.success) {
        setStats({
          totalQuizzes: data.stats.totalQuizzes,
          averageScore: data.stats.averageScore,
          totalQuestions: data.stats.totalQuestions,
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleStartQuiz = () => {
    if (selectedGrammarType && selectedDifficulty) {
      setIsQuizActive(true)
    }
  }

  const handleQuizComplete = () => {
    setIsQuizActive(false)
    setSelectedGrammarType("")
    setSelectedDifficulty("")
    // Refresh stats after quiz completion
    fetchStats()
  }

  if (showPerformance) {
    return <PerformanceDashboard onBack={() => setShowPerformance(false)} />
  }

  if (isQuizActive) {
    return (
      <QuizInterface
        grammarType={selectedGrammarType}
        difficulty={selectedDifficulty}
        onComplete={handleQuizComplete}
        user={user}
      />
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Grammar Master</h1>
                <p className="text-sm text-gray-600">English Grammar Practice</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                {user.email}
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Grammar Master!</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Improve your English grammar skills with AI-generated questions. Choose your topic and difficulty level to
              get started.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                    <p className="text-sm text-gray-600">Quizzes Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                    <p className="text-sm text-gray-600">Questions Answered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Analytics Button */}
          {stats.totalQuizzes > 0 && (
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
                      <p className="text-sm text-gray-600">View detailed progress and identify areas for improvement</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowPerformance(true)} className="bg-purple-600 hover:bg-purple-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz Setup */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                Start New Quiz
              </CardTitle>
              <CardDescription>Select your preferred grammar topic and difficulty level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Grammar Type</label>
                  <Select value={selectedGrammarType} onValueChange={setSelectedGrammarType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose grammar topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {grammarTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Beginner
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Intermediate
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Advanced
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleStartQuiz}
                disabled={!selectedGrammarType || !selectedDifficulty}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
