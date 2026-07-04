"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AppLoader } from "@/components/app-loader"
import { Star, ArrowLeft, ShieldCheck, Trophy, Sparkles, AlertCircle } from "lucide-react"

interface FeedbackData {
  id: string
  overallRating: number
  technicalRating: number
  communication: number
  problemSolving: number
  confidence: number
  behavior: number
  codingSkills: number
  strengths: string
  weaknesses: string
  recommendations: string
  hiringRecommendation: string
  createdAt: string
}

export default function FeedbackReport({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [data, setData] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/feedback?bookingId=${bookingId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        setData(resData)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }, [bookingId])

  if (loading) {
    return <AppLoader message="Retrieving your interview scorecard feedback report" />
  }

  if (!data) {
    return (
      <div className="text-center py-20 border border-dashed rounded-xl bg-slate-50/50 font-sans text-xs">
        <AlertCircle className="h-12 w-12 text-slate-350 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-700">No Feedback Scorecard Found</h4>
        <p className="text-xs text-slate-500 mt-1">Feedback has not been submitted for this booking yet.</p>
        <Button onClick={() => router.push("/")} className="mt-4 text-xs h-9 bg-primary text-white font-bold">
          Go Back
        </Button>
      </div>
    )
  }

  const renderMetric = (label: string, score: number) => {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-750">
          <span>{label}</span>
          <span>{score} / 5</span>
        </div>
        <Progress value={(score / 5) * 100} className="h-2 bg-slate-100" />
      </div>
    )
  }

  const recommendationColors: Record<string, string> = {
    "Strong Hire": "bg-emerald-100 text-emerald-850",
    "Hire": "bg-emerald-50 text-emerald-700",
    "Leaning Hire": "bg-amber-100 text-amber-800",
    "No Hire": "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6 font-sans text-xs max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="h-8 w-8 cursor-pointer border rounded-full bg-card">
          <ArrowLeft className="h-4 w-4 text-slate-550" />
        </Button>
        <PageHeader
          title="Interview Scorecard Report"
          description="Detailed metrics, hiring decisions, and qualitative improvement logs compiled by your interviewer"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        {/* Left Side: Score Matrix (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-sm border-slate-100 bg-slate-50/50">
            <CardHeader className="text-center pb-2 border-b">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Overall Performance Score</span>
              <div className="text-4xl font-extrabold text-slate-800 mt-2 flex items-center justify-center gap-1">
                {data.overallRating} <Star className="h-7 w-7 text-amber-500 fill-amber-500" />
              </div>
              <Badge className={`mt-2 font-bold px-3 py-1 mx-auto text-xs ${recommendationColors[data.hiringRecommendation] || "bg-indigo-100 text-indigo-800"}`}>
                Recommendation: {data.hiringRecommendation}
              </Badge>
            </CardHeader>
            <CardContent className="py-5 space-y-4">
              {renderMetric("Technical Knowledge", data.technicalRating)}
              {renderMetric("Problem Solving Ability", data.problemSolving)}
              {renderMetric("Coding Speed & Quality", data.codingSkills)}
              {renderMetric("Communication & Clarity", data.communication)}
              {renderMetric("Confidence & Delivery", data.confidence)}
              {renderMetric("Behavior & Adaptability", data.behavior)}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Text logs (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-indigo-650" /> Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <p className="text-slate-650 leading-relaxed font-sans text-xs whitespace-pre-wrap">{data.strengths}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="h-4.5 w-4.5 text-red-500" /> Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <p className="text-slate-650 leading-relaxed font-sans text-xs whitespace-pre-wrap">{data.weaknesses}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-650" /> Specific Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <p className="text-slate-650 leading-relaxed font-sans text-xs whitespace-pre-wrap">{data.recommendations}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
