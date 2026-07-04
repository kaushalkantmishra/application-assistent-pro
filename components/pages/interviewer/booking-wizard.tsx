"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Clock, CalendarDays, DollarSign, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface BookingWizardProps {
  isOpen: boolean
  onClose: () => void
  interviewer: {
    id: string
    name: string
    pricingType: string
    hourlyCharges: number
    interviewTypes?: string[]
  }
}

export default function BookingWizard({ isOpen, onClose, interviewer }: BookingWizardProps) {
  const [step, setStep] = useState(1)
  const [interviewType, setInterviewType] = useState("")
  const [customType, setCustomType] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeSlot, setTimeSlot] = useState("")
  const [duration, setDuration] = useState("60")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
 
  const defaultTypes = [
    "Technical Interview",
    "System Design",
    "DSA",
    "Frontend",
    "Backend",
    "Full Stack",
    "Java",
    "Node.js",
    "React",
    "Next.js",
    "Behavioral",
    "Leadership",
    "Managerial",
    "HR Interview",
    "Mock Interview",
    "Custom Interview"
  ]
  const availableTypes = interviewer.interviewTypes || defaultTypes
  const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM", "04:30 PM"]
 
  const handleBook = async () => {
    if (!interviewType || !date || !timeSlot) {
      toast.error("Please fill in all fields")
      return
    }

    const typeToSend = interviewType === "Custom Interview" ? customType.trim() : interviewType
    if (interviewType === "Custom Interview" && !customType.trim()) {
      toast.error("Please specify your custom interview type")
      return
    }
 
    try {
      setSubmitting(true)
      const scheduledDate = new Date(date)
      // Parse time slot
      const [time, modifier] = timeSlot.split(" ")
      let [hours, minutes] = time.split(":").map(Number)
      if (modifier === "PM" && hours < 12) hours += 12
      if (modifier === "AM" && hours === 12) hours = 0
      scheduledDate.setHours(hours, minutes, 0, 0)
 
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerId: interviewer.id,
          interviewType: typeToSend,
          scheduledDate: scheduledDate.toISOString(),
          duration: parseInt(duration),
          notes: notes.trim(),
        }),
      })

      if (res.ok) {
        toast.success("Interview session booked successfully!")
        setStep(4) // success screen
      } else {
        const err = await res.json()
        throw new Error(err.error || "Failed to book session")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const calculatedCost = interviewer.pricingType === "free" 
    ? 0 
    : Math.round((interviewer.hourlyCharges * parseInt(duration)) / 60)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md font-sans text-xs">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-slate-800">
            Book Interview with {interviewer.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step < 4 ? `Step ${step} of 3` : "Completed"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-605">Select Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {interviewType === "Custom Interview" && (
              <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                <Label className="text-xs font-semibold text-slate-605">Specify Custom Interview Type</Label>
                <Input
                  placeholder="e.g. Kotlin Android Dev, Rust Systems Dev..."
                  value={customType}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomType(e.target.value)}
                  className="text-xs h-9.5"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-605">Select Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30" className="text-xs">30 Minutes</SelectItem>
                  <SelectItem value="60" className="text-xs">60 Minutes (Recommended)</SelectItem>
                  <SelectItem value="90" className="text-xs">90 Minutes</SelectItem>
                  <SelectItem value="120" className="text-xs">120 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Session Price:</span>
              <Badge className="bg-emerald-600 text-white font-bold">
                {interviewer.pricingType === "free" ? "Free" : `$${calculatedCost}`}
              </Badge>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2 flex flex-col items-center">
              <Label className="text-xs font-semibold self-start text-slate-605">Select Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-605">Select Time Slot</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((ts) => (
                    <SelectItem key={ts} value={ts} className="text-xs">{ts}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-605">Candidate Notes (Optional)</Label>
              <Textarea
                placeholder="Share your goals, areas of focus, or target job role description with the interviewer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="p-3 border rounded-lg bg-indigo-50/20 space-y-2">
              <h5 className="font-bold text-[10px] uppercase text-indigo-700 tracking-wider">Summary</h5>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <p className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {interviewType} ({duration} mins)</p>
                <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {date?.toLocaleDateString()} at {timeSlot}</p>
                <p className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> {interviewer.pricingType === "free" ? "Free Session" : `$${calculatedCost}`}</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-slate-800">Booking Confirmed!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Your request is sent to {interviewer.name}. You'll receive a notification and a Google Meet meeting lobby link once they accept.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="text-xs h-9">
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => {
                if (step === 1 && !interviewType) {
                  toast.error("Please select an interview type")
                  return
                }
                setStep(step + 1)
              }}
              className="text-xs h-9 bg-primary text-white font-bold"
            >
              Continue
            </Button>
          ) : step === 3 ? (
            <Button
              onClick={handleBook}
              disabled={submitting}
              className="text-xs h-9 bg-emerald-650 hover:bg-emerald-700 text-white font-bold"
            >
              {submitting ? "Booking..." : "Confirm & Request"}
            </Button>
          ) : (
            <Button onClick={onClose} className="text-xs h-9 bg-primary text-white font-bold">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
