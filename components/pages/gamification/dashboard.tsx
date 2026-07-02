"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AppLoader } from "@/components/app-loader"
import {
  Trophy,
  Flame,
  Users,
  Award,
  Sparkles,
  Share2,
  Calendar,
  Zap,
  TrendingUp,
  Star,
  CheckCircle2,
  Lock
} from "lucide-react"
import { toast } from "sonner"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
}

interface LeaderboardUser {
  rank: number
  name: string
  score: number
  isMe?: boolean
}

export default function GamificationDashboard() {
  const [loading, setLoading] = useState(true)
  const [streakDays, setStreakDays] = useState(7)
  const [referralCode, setReferralCode] = useState("REF-KAUS50")
  const [referredCount, setReferredCount] = useState(3)
  const [earnedBonus, setEarnedBonus] = useState(15) // $15 bonus

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "1", name: "First Resume Builder", description: "Successfully compiled your first ATS resume.", icon: "FileText", points: 100, unlocked: true },
    { id: "2", name: "First Interview Prep", description: "Completed your first AI Mock simulation session.", icon: "Brain", points: 200, unlocked: true },
    { id: "3", name: "Coding Specialist", description: "Successfully compiled and passed 100 coding problems.", icon: "Code", points: 500, unlocked: false },
    { id: "4", name: "7 Day Streak Flame", description: "Maintained a continuous 7 day practice streak.", icon: "Flame", points: 300, unlocked: true },
    { id: "5", name: "30 Day Streak Elite", description: "Maintained a continuous 30 day practice streak.", icon: "Award", points: 1000, unlocked: false },
    { id: "6", name: "Expert Candidate", description: "Averaged over 90 points on a Technical simulation.", icon: "Sparkles", points: 500, unlocked: false },
  ])

  // Leaderboard lists
  const [category, setCategory] = useState("learners") // learners, interview_scores, coding_scores
  const [timeframe, setTimeframe] = useState("weekly") // weekly, monthly, all_time
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])

  useEffect(() => {
    // Generate mock leaderboard based on selection
    const mockList: LeaderboardUser[] = [
      { rank: 1, name: "Arjun Mehta", score: category === "coding_scores" ? 950 : category === "interview_scores" ? 98 : 1200 },
      { rank: 2, name: "Priya Sharma", score: category === "coding_scores" ? 910 : category === "interview_scores" ? 95 : 1050 },
      { rank: 3, name: "Kaushal Kant Mishra", score: category === "coding_scores" ? 880 : category === "interview_scores" ? 92 : 950, isMe: true },
      { rank: 4, name: "Sarah Jenkins", score: category === "coding_scores" ? 840 : category === "interview_scores" ? 88 : 880 },
      { rank: 5, name: "David Miller", score: category === "coding_scores" ? 790 : category === "interview_scores" ? 84 : 760 },
    ]
    setLeaderboard(mockList)
    setLoading(false)
  }, [category, timeframe])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success("Referral invitation code copied to clipboard!")
  }

  if (loading) {
    return <AppLoader message="Loading achievements, daily streaks and leaderboard scorecards" />
  }

  return (
    <div className="space-y-8 font-sans text-xs max-w-6xl mx-auto">
      <PageHeader
        title="Candidate Milestones & Rankings"
        description="Track practice streaks, unlock achievements, earn bonus credits, and compare overall scoreboards on the leaderboard"
      />

      {/* Top Banner: Streaks and Referrals (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak Flame Tracker */}
        <Card className="shadow-sm border border-slate-100 bg-gradient-to-br from-amber-500/10 to-orange-500/5 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500" /> DAILY PRACTICE STREAK
            </span>
            <CardTitle className="text-sm font-extrabold text-slate-800 mt-1">Practice Streak</CardTitle>
          </CardHeader>
          <CardContent className="py-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-orange-600">{streakDays}</span>
              <span className="text-xs font-semibold text-slate-500">Days Active</span>
            </div>
            <p className="text-slate-500 mt-1 leading-relaxed">Practice with AI tomorrow to keep your {streakDays + 1} day streak alive!</p>
          </CardContent>
          <CardFooter className="py-2.5 bg-orange-500/5 flex justify-between items-center text-[10.5px]">
            <span className="text-slate-500 font-medium">NEXT REWARD</span>
            <Badge className="bg-amber-650 text-white font-bold text-[9px] gap-0.5"><Zap className="h-3 w-3 fill-current" /> +100 Credits</Badge>
          </CardFooter>
        </Card>

        {/* Referrals Invite */}
        <Card className="shadow-sm border border-slate-100 flex flex-col justify-between md:col-span-2">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
              <Users className="h-4 w-4 text-indigo-650" /> REFERRAL PROGRAM
            </span>
            <CardTitle className="text-sm font-extrabold text-slate-800 mt-1">Invite Friends & Earn Credits</CardTitle>
          </CardHeader>
          <CardContent className="py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold text-[10px] block">YOUR REFERRAL CODE</span>
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="text-xs font-mono h-9 bg-slate-50 border-slate-200" />
                <Button onClick={handleCopyCode} variant="outline" className="h-9 text-xs px-3">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border rounded-xl bg-slate-50/40">
              <div>
                <span className="text-slate-450 text-[10px] font-bold block">REFERRED FRIENDS</span>
                <span className="text-lg font-bold text-slate-800">{referredCount} Joined</span>
              </div>
              <div className="text-right">
                <span className="text-slate-450 text-[10px] font-bold block">TOTAL EARNED</span>
                <span className="text-lg font-bold text-emerald-650">+${earnedBonus.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="py-2.5 bg-slate-50/50 text-[10.5px] text-slate-500">
            Earn $5.00 wallet credits for every friend who activates a premium account!
          </CardFooter>
        </Card>

      </div>

      {/* Main Grid: Achievements (8 cols) & Leaderboard (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Achievements List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-slate-500" /> Milestones & Badges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => (
              <Card key={ach.id} className={`shadow-sm border flex items-start gap-3 p-4.5 overflow-hidden ${
                ach.unlocked ? "border-indigo-100 bg-indigo-50/5" : "border-slate-100 bg-slate-50/10 opacity-70"
              }`}>
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  ach.unlocked ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                }`}>
                  {ach.unlocked ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-1 flex-wrap">
                    <span className="font-bold text-slate-800 text-xs truncate">{ach.name}</span>
                    <Badge className={
                      ach.unlocked ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[9px]" : "bg-slate-200 text-slate-650 border-none font-bold text-[9px]"
                    }>
                      {ach.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[10.5px] leading-relaxed">{ach.description}</p>
                  <span className="text-[9.5px] font-bold text-indigo-650 block mt-1">+{ach.points} XP Points</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaderboard View */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Trophy className="h-4.5 w-4.5 text-slate-500" /> Global Leaderboard
          </h3>

          <Card className="shadow-sm border border-slate-100">
            <CardHeader className="pb-3 border-b bg-slate-50/20 space-y-3">
              {/* Category tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg text-center shrink-0">
                <button
                  onClick={() => setCategory("learners")}
                  className={`text-[10px] font-bold py-1 rounded cursor-pointer ${
                    category === "learners" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  XP Earned
                </button>
                <button
                  onClick={() => setCategory("interview_scores")}
                  className={`text-[10px] font-bold py-1 rounded cursor-pointer ${
                    category === "interview_scores" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Interview
                </button>
                <button
                  onClick={() => setCategory("coding_scores")}
                  className={`text-[10px] font-bold py-1 rounded cursor-pointer ${
                    category === "coding_scores" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Coding
                </button>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex justify-between items-center p-2.5 rounded-xl border ${
                      user.isMe ? "border-indigo-600 bg-indigo-50/10 ring-1 ring-indigo-600" : "border-slate-100 bg-slate-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`font-extrabold text-[11px] w-4.5 h-4.5 rounded-full flex items-center justify-center ${
                        user.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                        user.rank === 2 ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-650"
                      }`}>
                        {user.rank}
                      </span>
                      <span className="font-semibold text-slate-850 text-[11px]">{user.name}</span>
                      {user.isMe && (
                        <Badge className="bg-indigo-600 text-white font-bold text-[8px] h-4.5">ME</Badge>
                      )}
                    </div>

                    <div className="text-right font-bold text-slate-700 text-xs">
                      {user.score} {category === "coding_scores" || category === "learners" ? "XP" : "Points"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
