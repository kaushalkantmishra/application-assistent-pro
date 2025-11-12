"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { mockInterviewQuestions, mockInterviewTips, type InterviewQuestion, type InterviewTip } from "@/lib/mock-data"
import { MessageSquare, Lightbulb, ChevronDown, ChevronRight, Brain, Clock, Star, AlertCircle } from "lucide-react"

export default function InterviewPrepPage() {
  const [questions] = useState<InterviewQuestion[]>(mockInterviewQuestions)
  const [tips] = useState<InterviewTip[]>(mockInterviewTips)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const categories = Array.from(new Set(questions.map((q) => q.category)))
  const filteredQuestions =
    selectedCategory === "all" ? questions : questions.filter((q) => q.category === selectedCategory)

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const getCategoryColor = (category: InterviewQuestion["category"]) => {
    switch (category) {
      case "Technical":
        return "default"
      case "Behavioral":
        return "secondary"
      case "Company-Specific":
        return "outline"
      case "General":
        return "outline"
      default:
        return "outline"
    }
  }

  const getImportanceColor = (importance: InterviewTip["importance"]) => {
    switch (importance) {
      case "High":
        return "destructive"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getTipsByCategory = (category: InterviewTip["category"]) => {
    return tips.filter((tip) => tip.category === category)
  }

  return (
    <>
      <PageHeader
        title="Interview Prep"
        description="Prepare for your interviews with practice questions and expert tips"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">AI-powered preparation coming soon</span>
        </div>
      </PageHeader>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Practice Questions
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Interview Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          {/* Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Filter by Category</h3>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">{filteredQuestions.length} questions available</div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id}>
                <Collapsible>
                  <CollapsibleTrigger className="w-full" onClick={() => toggleQuestion(question.id)}>
                    <CardHeader className="hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getCategoryColor(question.category)}>{question.category}</Badge>
                          </div>
                          <CardTitle className="text-base text-balance">{question.question}</CardTitle>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedQuestions.has(question.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Sample Answer
                          </h4>
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-pretty">{question.sampleAnswer}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Tips for Answering
                          </h4>
                          <ul className="space-y-2">
                            {question.tips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span className="text-pretty">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Before Interview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Before Interview
                </CardTitle>
                <CardDescription>Preparation is key to success</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getTipsByCategory("Before Interview").map((tip) => (
                  <div key={tip.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm text-balance">{tip.title}</h4>
                      <Badge variant={getImportanceColor(tip.importance)} className="text-xs">
                        {tip.importance}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground text-pretty">{tip.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* During Interview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-secondary" />
                  During Interview
                </CardTitle>
                <CardDescription>Make a great impression</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getTipsByCategory("During Interview").map((tip) => (
                  <div key={tip.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm text-balance">{tip.title}</h4>
                      <Badge variant={getImportanceColor(tip.importance)} className="text-xs">
                        {tip.importance}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground text-pretty">{tip.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* After Interview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  After Interview
                </CardTitle>
                <CardDescription>Follow up professionally</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getTipsByCategory("After Interview").map((tip) => (
                  <div key={tip.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm text-balance">{tip.title}</h4>
                      <Badge variant={getImportanceColor(tip.importance)} className="text-xs">
                        {tip.importance}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground text-pretty">{tip.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Placeholder */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Interview Coach Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Get personalized interview practice with AI-powered mock interviews and feedback
                </p>
                <Button variant="outline" disabled>
                  Join Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}