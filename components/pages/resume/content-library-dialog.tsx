"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Save, Trash2, Check, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Snippet {
  id: string
  contentType: string
  title: string
  content: string
  createdAt: string
}

interface ContentLibraryDialogProps {
  isOpen: boolean
  onClose: () => void
  contentType: "summary" | "objective" | "project" | "achievement" | "skill" | "certificate" | "experience"
  currentValue: string
  onSelect: (value: string) => void
}

export function ContentLibraryDialog({
  isOpen,
  onClose,
  contentType,
  currentValue,
  onSelect,
}: ContentLibraryDialogProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(false)
  const [saveMode, setSaveMode] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState(currentValue || "")

  const typeLabels: Record<string, string> = {
    summary: "Professional Summary",
    objective: "Career Objective",
    project: "Project Description",
    achievement: "Achievement / Award",
    skill: "Skill Entry",
    certificate: "Certificate / Training",
    experience: "Experience Description",
  }

  const fetchSnippets = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/content-library?contentType=${contentType}`)
      if (res.ok) {
        const data = await res.json()
        setSnippets(data)
      } else {
        toast.error("Failed to load snippets")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSnippets()
      setNewContent(currentValue || "")
      setNewTitle("")
      setSaveMode(false)
    }
  }, [isOpen, contentType, currentValue])

  const handleSaveSnippet = async () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title for the snippet")
      return
    }
    if (!newContent.trim()) {
      toast.error("Snippet content cannot be empty")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/content-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          title: newTitle,
          content: newContent,
        }),
      })

      if (res.ok) {
        toast.success("Snippet saved to library")
        setSaveMode(false)
        fetchSnippets()
      } else {
        toast.error("Failed to save snippet")
      }
    } catch (e) {
      console.error(e)
      toast.error("Error saving snippet")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSnippet = async (id: string) => {
    try {
      const res = await fetch(`/api/content-library?id=${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Snippet deleted")
        setSnippets(snippets.filter((s) => s.id !== id))
      } else {
        toast.error("Failed to delete snippet")
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-md font-bold text-slate-800">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            {typeLabels[contentType]} Library
          </DialogTitle>
          <DialogDescription className="text-xs">
            Reuse pre-written texts, objectives, or descriptions across multiple resumes.
          </DialogDescription>
        </DialogHeader>

        {saveMode ? (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Snippet Name / Title</Label>
              <Input
                placeholder="e.g. React Developer Lead Summary"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Content</Label>
              <Textarea
                placeholder="Write or edit the snippet..."
                rows={5}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1 py-1">
            {loading && snippets.length === 0 ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
              </div>
            ) : snippets.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-lg">
                No snippets found in library for this field. Click "Save Current to Library" to create one.
              </div>
            ) : (
              snippets.map((snip) => (
                <div
                  key={snip.id}
                  className="p-3 border rounded-lg bg-slate-50 hover:bg-indigo-50/20 border-slate-100 hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-700">{snip.title}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onSelect(snip.content)
                          toast.success("Snippet selected")
                          onClose()
                        }}
                        className="h-7 text-[10px] text-indigo-600 hover:text-indigo-700 font-bold gap-1 pl-2 pr-2"
                      >
                        <Check className="h-3 w-3" /> Select
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSnippet(snip.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 whitespace-pre-wrap mt-1.5 leading-relaxed line-clamp-3">
                    {snip.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter className="flex sm:justify-between items-center w-full gap-2">
          {saveMode ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => setSaveMode(false)} className="text-xs">
                Back to Library
              </Button>
              <Button size="sm" onClick={handleSaveSnippet} disabled={loading} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                <Save className="h-3.5 w-3.5" /> Save Snippet
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setNewContent(currentValue || "")
                  setSaveMode(true)
                }}
                className="text-xs bg-primary text-white gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Save Current to Library
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
