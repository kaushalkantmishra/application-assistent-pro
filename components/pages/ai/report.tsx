"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AppLoader } from "@/components/app-loader"
import { Star, Trophy, Sparkles, Award, ArrowLeft, BookOpen, AlertCircle, TrendingUp } from "lucide-react"

interface ReportData {
  id: string
  overallScore: number
  technicalScore: number
  communicationScore: number
  confidenceScore: number
  codingScore: number
  behavioralScore: number
  problemSolvingScore: number
  systemDesignScore: number
  grammarScore: number
  recommendation: string
  roadmap: { step: string; description: string }[] | null
  studyResources: { topic: string; url: string }[] | null
}

export default function AIMockReport({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/ai-interviews/${sessionId}/report`)
      .then(res => res.ok ? res.json() : null)
      .then(resData => {
        setData(resData)
        setLoading(false)
      }).catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [sessionId])

  if (loading) {
    return <AppLoader message="Compiling performance analytics and AI recommendations" />
  }

  if (!data) {
    return (
      <div className="text-center py-20 border border-dashed rounded-xl bg-slate-50/50 font-sans text-xs">
        <AlertCircle className="h-12 w-12 text-slate-350 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-700">No Assessment Report Found</h4>
        <p className="text-xs text-slate-500 mt-1">Please complete the practice simulation to generate the scorecard.</p>
        <Button onClick={() => router.push("/ai-mock-interview")} className="mt-4 text-xs h-9 bg-primary text-white font-bold">
          Back to Lobby
        </Button>
      </div>
    )
  }

  const renderMetric = (label: string, score: number) => {
    return (
      <div className="space-y-1.5" key={label}>
        <div className="flex justify-between items-center text-xs font-semibold text-slate-750">
          <span>{label}</span>
          <span>{score} / 100</span>
        </div>
        <Progress value={score} className="h-2 bg-slate-100" />
      </div>
    )
  }

  const badgeColors: Record<string, string> = {
    "Strong Hire": "bg-emerald-100 text-emerald-850",
    "Hire": "bg-emerald-50 text-emerald-700",
    "Leaning Hire": "bg-amber-100 text-amber-800",
    "No Hire": "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6 font-sans text-xs max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/ai-mock-interview")} className="h-8 w-8 cursor-pointer border rounded-full bg-card">
          <ArrowLeft className="h-4 w-4 text-slate-550" />
        </Button>
        <PageHeader
          title="AI Evaluation Scorecard"
          description="Comprehensive technical analysis, communication matrices, and roadmap recommendations compiled by AI"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        {/* Left Card: Score Summary (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-sm border-indigo-100 bg-indigo-50/5">
            <CardHeader className="text-center pb-2 border-b">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Overall Assessment Score</span>
              <div className="text-4xl font-extrabold text-slate-800 mt-2 flex items-center justify-center gap-1">
                {data.overallScore} <Star className="h-7 w-7 text-amber-500 fill-amber-500" />
              </div>
              <Badge className={`mt-2.5 font-bold px-3 py-1 mx-auto text-xs ${badgeColors[data.recommendation] || "bg-indigo-100 text-indigo-850"}`}>
                Recommendation: {data.recommendation}
              </Badge>
            </CardHeader>
            <CardContent className="py-5 space-y-4">
              {renderMetric("Technical Knowledge", data.technicalScore)}
              {renderMetric("Problem Solving", data.problemSolvingScore)}
              {renderMetric("Communication & Clarity", data.communicationScore)}
              {renderMetric("Confidence Level", data.confidenceScore)}
              {renderMetric("Coding Competence", data.codingScore)}
              {renderMetric("Behavioral Alignment", data.behavioralScore)}
              {renderMetric("System Design Skill", data.systemDesignScore)}
              {renderMetric("Grammar & Delivery", data.grammarScore)}
            </CardContent>
          </Card>
        </div>

        {/* Right Card: Roadmap & Study logs (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Detailed Roadmap */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-indigo-650" /> Suggested Preparation Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-4">
              {data.roadmap && data.roadmap.length > 0 ? (
                <div className="relative border-l border-slate-150 pl-4 space-y-4 ml-2">
                  {data.roadmap.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-0.5 bg-indigo-600 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center font-mono font-bold text-[9px]">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-850 text-xs block">{step.step}</span>
                      <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No custom roadmap generated.</p>
              )}
            </CardContent>
          </Card>

          {/* Learning Resources */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-indigo-650" /> Curated Study Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              {data.studyResources && data.studyResources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.studyResources.map((res, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <span className="font-semibold text-slate-800 block truncate">{res.topic}</span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5 mt-1"
                      >
                        Explore Resource <TrendingUp className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No resources linked yet.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
