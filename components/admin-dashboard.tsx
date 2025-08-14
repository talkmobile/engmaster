"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, BookOpen, BarChart3, Settings, Trash2, Plus, TrendingUp, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QuestionGenerator from "@/components/question-generator"

interface AdminStats {
  totalUsers: number
  totalQuestions: number
  totalSessions: number
  grammarTypeStats: Record<string, number>
  difficultyStats: Record<string, number>
  recentActivity: Array<{
    id: string
    score_percentage: number
    grammar_type: string
    difficulty_level: string
    completed_at: string
    user_profiles: { email: string }
  }>
}

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  totalSessions: number
  averageScore: number
  lastActivity: string
}

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation: string
  grammar_type: string
  difficulty_level: string
  created_at: string
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionsPage, setQuestionsPage] = useState(1)
  const [questionsTotalPages, setQuestionsTotalPages] = useState(1)
  const [questionsFilter, setQuestionsFilter] = useState({
    grammarType: "all",
    difficultyLevel: "all",
    search: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "questions") {
      fetchQuestions()
    }
  }, [activeTab, questionsPage, questionsFilter])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "Failed to load admin statistics.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      })
    }
  }

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams({
        page: questionsPage.toString(),
        limit: "20",
      })
      if (questionsFilter.grammarType !== "all") params.append("grammarType", questionsFilter.grammarType)
      if (questionsFilter.difficultyLevel !== "all") params.append("difficultyLevel", questionsFilter.difficultyLevel)

      const response = await fetch(`/api/admin/questions?${params}`)
      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions)
        setQuestionsTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast({
        title: "Error",
        description: "Failed to load questions.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      const response = await fetch("/api/admin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Question deleted successfully.",
        })
        fetchQuestions()
        fetchStats() // Refresh stats
      } else {
        throw new Error("Failed to delete question")
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Manage users, questions, and monitor system performance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalQuestions || 0}</p>
                    <p className="text-sm text-gray-600">Total Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalSessions || 0}</p>
                    <p className="text-sm text-gray-600">Quiz Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.recentActivity?.length || 0}</p>
                    <p className="text-sm text-gray-600">Recent Activity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions by Grammar Type */}
          <Card>
            <CardHeader>
              <CardTitle>Questions by Grammar Type</CardTitle>
              <CardDescription>Distribution of questions across different grammar topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats?.grammarTypeStats || {}).map(([type, count]) => (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                    <p className="text-sm text-gray-600">{type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Activity</CardTitle>
              <CardDescription>Latest quiz sessions from users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          activity.score_percentage >= 80
                            ? "bg-green-500"
                            : activity.score_percentage >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{activity.user_profiles.email}</p>
                        <p className="text-sm text-gray-600">
                          {activity.grammar_type} • {activity.difficulty_level}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          activity.score_percentage >= 80
                            ? "bg-green-100 text-green-800"
                            : activity.score_percentage >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {activity.score_percentage}%
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-600">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{user.totalSessions} quizzes</p>
                        <p className="text-sm text-gray-600">{user.averageScore}% avg score</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Last active</p>
                        <p className="text-sm font-medium">{new Date(user.lastActivity).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Management</CardTitle>
              <CardDescription>View, filter, and manage grammar questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <Select
                  value={questionsFilter.grammarType}
                  onValueChange={(value) => setQuestionsFilter((prev) => ({ ...prev, grammarType: value }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by grammar type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grammar Types</SelectItem>
                    {Object.keys(stats?.grammarTypeStats || {}).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={questionsFilter.difficultyLevel}
                  onValueChange={(value) => setQuestionsFilter((prev) => ({ ...prev, difficultyLevel: value }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-lg">{question.question_text}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {question.grammar_type}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`capitalize ${
                                question.difficulty_level === "beginner"
                                  ? "bg-green-100 text-green-800"
                                  : question.difficulty_level === "intermediate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {question.difficulty_level}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div
                            className={`p-2 rounded ${
                              question.correct_answer === "A" ? "bg-green-100 border border-green-500" : "bg-gray-50"
                            }`}
                          >
                            <span className="font-medium">A)</span> {question.option_a}
                          </div>
                          <div
                            className={`p-2 rounded ${
                              question.correct_answer === "B" ? "bg-green-100 border border-green-500" : "bg-gray-50"
                            }`}
                          >
                            <span className="font-medium">B)</span> {question.option_b}
                          </div>
                          <div
                            className={`p-2 rounded ${
                              question.correct_answer === "C" ? "bg-green-100 border border-green-500" : "bg-gray-50"
                            }`}
                          >
                            <span className="font-medium">C)</span> {question.option_c}
                          </div>
                          <div
                            className={`p-2 rounded ${
                              question.correct_answer === "D" ? "bg-green-100 border border-green-500" : "bg-gray-50"
                            }`}
                          >
                            <span className="font-medium">D)</span> {question.option_d}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded text-sm">
                          <p>
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {questionsTotalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setQuestionsPage((prev) => Math.max(1, prev - 1))}
                    disabled={questionsPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {questionsPage} of {questionsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setQuestionsPage((prev) => Math.min(questionsTotalPages, prev + 1))}
                    disabled={questionsPage === questionsTotalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <QuestionGenerator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
