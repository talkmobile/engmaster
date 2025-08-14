"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeneratedQuestion {
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
}

export default function QuestionGenerator() {
  const [grammarType, setGrammarType] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("")
  const [questionCount, setQuestionCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const { toast } = useToast()

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

  const handleGenerate = async () => {
    if (!grammarType || !difficultyLevel) {
      toast({
        title: "Missing Information",
        description: "Please select both grammar type and difficulty level.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grammarType,
          difficultyLevel,
          count: questionCount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions")
      }

      setGeneratedQuestions(data.questions || [])
      toast({
        title: "Questions Generated!",
        description: `Successfully generated ${data.count} questions.`,
      })
    } catch (error) {
      console.error("Error generating questions:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate Grammar Questions
          </CardTitle>
          <CardDescription>Use AI to generate English grammar questions with multiple choice answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grammar-type">Grammar Type</Label>
              <Select value={grammarType} onValueChange={setGrammarType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grammar type" />
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
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="10"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number.parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !grammarType || !difficultyLevel}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Generated Questions ({generatedQuestions.length})</h3>
          </div>

          {generatedQuestions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-lg">Question {index + 1}</h4>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{question.grammar_type}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded capitalize">
                        {question.difficulty_level}
                      </span>
                    </div>
                  </div>

                  <p className="text-lg">{question.question_text}</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-2 rounded ${question.correct_answer === "A" ? "bg-green-100 border-green-500 border" : "bg-gray-50"}`}
                    >
                      <span className="font-medium">A)</span> {question.option_a}
                    </div>
                    <div
                      className={`p-2 rounded ${question.correct_answer === "B" ? "bg-green-100 border-green-500 border" : "bg-gray-50"}`}
                    >
                      <span className="font-medium">B)</span> {question.option_b}
                    </div>
                    <div
                      className={`p-2 rounded ${question.correct_answer === "C" ? "bg-green-100 border-green-500 border" : "bg-gray-50"}`}
                    >
                      <span className="font-medium">C)</span> {question.option_c}
                    </div>
                    <div
                      className={`p-2 rounded ${question.correct_answer === "D" ? "bg-green-100 border-green-500 border" : "bg-gray-50"}`}
                    >
                      <span className="font-medium">D)</span> {question.option_d}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm">
                      <strong>Correct Answer:</strong> {question.correct_answer}
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
