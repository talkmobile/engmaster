"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation: string
  grammar_type: string
  difficulty_level: string
}

interface User {
  id: string
  email: string
}

interface QuizInterfaceProps {
  grammarType: string
  difficulty: string
  onComplete: () => void
  user: User
}

export default function QuizInterface({ grammarType, difficulty, onComplete, user }: QuizInterfaceProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `/api/questions?grammarType=${encodeURIComponent(grammarType)}&difficultyLevel=${difficulty}&limit=10`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch questions")
      }

      if (data.questions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "No questions found for this topic and difficulty. Please try another combination.",
          variant: "destructive",
        })
        onComplete()
        return
      }

      setQuestions(data.questions)
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      })
      onComplete()
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    setIsSaving(true)
    try {
      const score = calculateScore()

      const response = await fetch("/api/quiz-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grammarType,
          difficultyLevel: difficulty,
          questions,
          answers: selectedAnswers,
          score,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save quiz results")
      }

      toast({
        title: "Quiz Completed!",
        description: `Your results have been saved. Score: ${score.percentage}%`,
      })
    } catch (error) {
      console.error("Error saving quiz results:", error)
      toast({
        title: "Warning",
        description: "Quiz completed but results could not be saved.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++
      }
    })
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    }
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Loading quiz questions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {grammarType}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 capitalize">
                  {difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Summary */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-blue-600">{score.percentage}%</div>
                <p className="text-xl text-gray-600">
                  You got {score.correct} out of {score.total} questions correct
                </p>
                <Progress value={score.percentage} className="w-full max-w-md mx-auto h-3" />
              </div>

              {/* Question Review */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question Review</h3>
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index]
                  const isCorrect = userAnswer === question.correct_answer
                  return (
                    <Card
                      key={question.id}
                      className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <p className="font-medium">
                              {index + 1}. {question.question_text}
                            </p>
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {["A", "B", "C", "D"].map((option) => {
                              const optionText = question[`option_${option.toLowerCase()}` as keyof Question] as string
                              const isUserAnswer = userAnswer === option
                              const isCorrectAnswer = question.correct_answer === option
                              return (
                                <div
                                  key={option}
                                  className={`p-2 rounded ${
                                    isCorrectAnswer
                                      ? "bg-green-100 border border-green-500"
                                      : isUserAnswer
                                        ? "bg-red-100 border border-red-500"
                                        : "bg-gray-50"
                                  }`}
                                >
                                  <span className="font-medium">{option})</span> {optionText}
                                </div>
                              )
                            })}
                          </div>
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <p>
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button onClick={handleRetakeQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={onComplete} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {grammarType}
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 capitalize">
                {difficulty}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {["A", "B", "C", "D"].map((option) => {
                const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string
                const isSelected = selectedAnswers[currentQuestionIndex] === option
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium text-blue-600">{option})</span> {optionText}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length !== questions.length || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Saving..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
