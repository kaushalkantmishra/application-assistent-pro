"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLoader } from "@/components/app-loader"
import { Calendar, Plus, Trash2, Clock, Check, Save } from "lucide-react"
import { toast } from "sonner"

interface AvailabilityRule {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rules, setRules] = useState<AvailabilityRule[]>([])

  // Form input state
  const [day, setDay] = useState("1") // Monday default
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("17:00")

  const daysOfWeekMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/interviewers/availability")
      if (res.ok) {
        setRules(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  const handleAddRule = () => {
    const dayNum = parseInt(day)
    // Check duplication
    const duplicate = rules.find((r) => r.dayOfWeek === dayNum && r.startTime === start && r.endTime === end)
    if (duplicate) {
      toast.error("This slot is already added")
      return
    }

    setRules([...rules, { dayOfWeek: dayNum, startTime: start, endTime: end }])
    toast.success("Availability slot added to staging list")
  }

  const handleDeleteRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/interviewers/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurring: rules }),
      })

      if (res.ok) {
        toast.success("Availability template synchronized successfully")
      } else {
        throw new Error("Failed to synchronize availability template")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 font-sans text-xs">
      <PageHeader
        title="Weekly Availability Settings"
        description="Configure your recurring weekly shifts and break schedules candidates can select during bookings"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        {/* Left Side: Configuration Card */}
        <div className="md:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-indigo-650" /> Add Available Shift
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Day of the Week</label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger className="text-xs h-9.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeekMap.map((d, i) => (
                      <SelectItem key={i} value={i.toString()} className="text-xs">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">Start Time</label>
                  <Select value={start} onValueChange={setStart}>
                    <SelectTrigger className="text-xs h-9.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00" className="text-xs">08:00 AM</SelectItem>
                      <SelectItem value="09:00" className="text-xs">09:00 AM</SelectItem>
                      <SelectItem value="10:00" className="text-xs">10:00 AM</SelectItem>
                      <SelectItem value="11:00" className="text-xs">11:00 AM</SelectItem>
                      <SelectItem value="12:00" className="text-xs">12:00 PM</SelectItem>
                      <SelectItem value="13:00" className="text-xs">01:00 PM</SelectItem>
                      <SelectItem value="14:00" className="text-xs">02:00 PM</SelectItem>
                      <SelectItem value="15:00" className="text-xs">03:00 PM</SelectItem>
                      <SelectItem value="16:00" className="text-xs">04:00 PM</SelectItem>
                      <SelectItem value="17:00" className="text-xs">05:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-600 block">End Time</label>
                  <Select value={end} onValueChange={setEnd}>
                    <SelectTrigger className="text-xs h-9.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12:00" className="text-xs">12:00 PM</SelectItem>
                      <SelectItem value="13:00" className="text-xs">01:00 PM</SelectItem>
                      <SelectItem value="14:00" className="text-xs">02:00 PM</SelectItem>
                      <SelectItem value="15:00" className="text-xs">03:00 PM</SelectItem>
                      <SelectItem value="16:00" className="text-xs">04:00 PM</SelectItem>
                      <SelectItem value="17:00" className="text-xs">05:00 PM</SelectItem>
                      <SelectItem value="18:00" className="text-xs">06:00 PM</SelectItem>
                      <SelectItem value="19:00" className="text-xs">07:00 PM</SelectItem>
                      <SelectItem value="20:00" className="text-xs">08:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddRule} className="text-xs w-full cursor-pointer h-9.5 bg-primary text-white font-bold gap-1">
                <Plus className="h-4 w-4" /> Add Slot
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Shift Schedules List */}
        <div className="md:col-span-8 space-y-6">
          <Card className="shadow-sm border-slate-100 flex flex-col justify-between min-h-[300px]">
            <CardHeader className="flex flex-row justify-between items-center pb-3 border-b">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800">Recurring Weekly Schedule</CardTitle>
                <CardDescription className="text-xs">Check or delete staging shifts before synchronization.</CardDescription>
              </div>
              <Button onClick={handleSave} disabled={saving} className="text-xs h-9 cursor-pointer bg-emerald-650 hover:bg-emerald-700 text-white font-bold gap-1">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Synchronize"}
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {loading ? (
                <div className="py-16">
                  <AppLoader message="Retrieving schedule templates" />
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  No availability shifts configured. Add shifts on the left panel.
                </div>
              ) : (
                <div className="divide-y">
                  {rules.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 block text-xs">{daysOfWeekMap[item.dayOfWeek]}</span>
                        <span className="text-[10px] text-indigo-650 font-bold block">{item.startTime} - {item.endTime}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteRule(idx)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
