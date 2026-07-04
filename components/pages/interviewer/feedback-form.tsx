"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Save, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function FeedbackForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [submitting, setSubmitting] = useState(false)

  // Grader metrics
  const [overallRating, setOverallRating] = useState(4)
  const [technicalRating, setTechnicalRating] = useState(4)
  const [communication, setCommunication] = useState(4)
  const [problemSolving, setProblemSolving] = useState(4)
  const [confidence, setConfidence] = useState(4)
  const [behavior, setBehavior] = useState(4)
  const [codingSkills, setCodingSkills] = useState(4)

  // Text inputs
  const [strengths, setStrengths] = useState("")
  const [weaknesses, setWeaknesses] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [hiringRecommendation, setHiringRecommendation] = useState("Hire")
  const [notes, setNotes] = useState("")

  const handleRatingSelect = (name: string, value: number) => {
    switch (name) {
      case "overall": setOverallRating(value); break;
      case "technical": setTechnicalRating(value); break;
      case "communication": setCommunication(value); break;
      case "problem": setProblemSolving(value); break;
      case "confidence": setConfidence(value); break;
      case "behavior": setBehavior(value); break;
      case "coding": setCodingSkills(value); break;
    }
  }

  const renderStars = (name: string, currentValue: number) => {
    return (
      <div className="flex gap-0.5 mt-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => handleRatingSelect(name, val)}
            className="p-0.5 cursor-pointer focus:outline-none"
          >
            <Star className={`h-5 w-5 ${val <= currentValue ? "text-amber-500 fill-amber-500" : "text-slate-350"}`} />
          </button>
        ))}
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!bookingId) {
      toast.error("Booking ID parameter is missing")
      return
    }

    if (!strengths.trim() || !weaknesses.trim() || !recommendations.trim()) {
      toast.error("Please fill in all textual summary fields")
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          overallRating,
          technicalRating,
          communication,
          problemSolving,
          confidence,
          behavior,
          codingSkills,
          strengths: strengths.trim(),
          weaknesses: weaknesses.trim(),
          recommendations: recommendations.trim(),
          hiringRecommendation,
          notes: notes.trim(),
        }),
      })

      if (res.ok) {
        toast.success("Feedback scorecard submitted successfully!")
        router.push("/")
      } else {
        throw new Error("Failed to submit feedback scorecard")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 font-sans text-xs max-w-3xl mx-auto">
      <PageHeader
        title="Candidate Interview Scorecard"
        description="Submit professional mock assessment scores, qualitative highlights, and hiring recommendations"
      />

      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3 border-b bg-slate-50/20">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-650" /> Performance Matrix (Graded 1-5)
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Overall Rating</Label>
            {renderStars("overall", overallRating)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Technical Competence</Label>
            {renderStars("technical", technicalRating)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Communication Skills</Label>
            {renderStars("communication", communication)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Problem Solving</Label>
            {renderStars("problem", problemSolving)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Confidence Level</Label>
            {renderStars("confidence", confidence)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Behavior & Teamwork</Label>
            {renderStars("behavior", behavior)}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Coding / Technical Skills</Label>
            {renderStars("coding", codingSkills)}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-slate-700">Hiring Decision Recommendation</Label>
            <Select value={hiringRecommendation} onValueChange={setHiringRecommendation}>
              <SelectTrigger className="text-xs h-9.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Strong Hire" className="text-xs">Strong Hire (Excellent performance)</SelectItem>
                <SelectItem value="Hire" className="text-xs">Hire (Meets bar)</SelectItem>
                <SelectItem value="Leaning Hire" className="text-xs">Leaning Hire (Minor reservations)</SelectItem>
                <SelectItem value="No Hire" className="text-xs">No Hire (Does not meet bar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-3 border-b bg-slate-50/20">
          <CardTitle className="text-sm font-bold text-slate-800">Qualitative Summary & Notes</CardTitle>
        </CardHeader>
        <CardContent className="py-4 space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Key Strengths</Label>
            <Textarea
              placeholder="What did the candidate do exceptionally well? Mention specific architectural decisions, DSA optimizations, or behavioral answers..."
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={4}
              className="text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Areas for Improvement / Weaknesses</Label>
            <Textarea
              placeholder="Where did they struggle or show room for progress? Mention edge case handlings, time/space complexity details, or structure errors..."
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              rows={4}
              className="text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Recommendations & Next Steps</Label>
            <Textarea
              placeholder="Specific courses, books, or practice materials the candidate should review before their actual interview..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={4}
              className="text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5 border-t pt-4">
            <Label className="text-xs font-bold text-slate-750">Internal Notes (Private, only visible to you)</Label>
            <Textarea
              placeholder="Private details, salary estimations, level alignments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs leading-relaxed"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t flex justify-end gap-2 bg-slate-50/50 pb-3">
          <Button variant="outline" onClick={() => router.push("/")} className="text-xs h-9">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="text-xs h-9 bg-primary text-white font-bold gap-1">
            <Save className="h-4 w-4" /> {submitting ? "Submitting..." : "Save Scorecard"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
