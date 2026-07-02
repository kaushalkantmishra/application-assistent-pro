"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useResumeStore } from "@/stores/resume-store"
import { useEditorStore } from "@/stores/editor-store"
import { useAutosaveStore } from "@/stores/autosave-store"
import { RESUME_SECTIONS_SCHEMAS, SectionSchema, getInitialResumeJson } from "@/lib/resume-schemas"
import { ResumeTemplateSelector } from "./resume-templates"
import AiAssistantDashboard from "./ai-assistant-dashboard"
import { AppLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  GripVertical,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Settings,
  X,
} from "lucide-react"
import { toast } from "sonner"

export default function ResumeEditorPage({ id }: { id: string }) {
  const router = useRouter()
  const {
    resume,
    past,
    future,
    setResume,
    updateMetadata,
    updateField,
    addRepeatableItem,
    updateRepeatableItem,
    removeRepeatableItem,
    reorderRepeatableItems,
    reorderSections,
    toggleSectionVisibility,
    addCustomSection,
    removeCustomSection,
    undo,
    redo,
  } = useResumeStore()

  const {
    activeSectionId,
    panelSizes,
    expandedItems,
    spellCheckEnabled,
    zoomLevel,
    setActiveSectionId,
    setPanelSizes,
    toggleItemExpanded,
    setItemExpanded,
    toggleSpellCheck,
    setZoomLevel,
  } = useEditorStore()

  const { status, lastSavedAt, setStatus, setLastSavedAt } = useAutosaveStore()
  const [loading, setLoading] = useState(true)
  const [showAiPanel, setShowAiPanel] = useState(false)

  // Custom section state
  const [customOpen, setCustomOpen] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [customFields, setCustomFields] = useState<{ id: string; label: string; type: "text" | "textarea" }[]>([
    { id: "field1", label: "Field 1 Label", type: "text" },
  ])

  // Drag and Drop Section indices
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // 1. Fetch Resume Data on Mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/resumes/${id}`)
        if (res.ok) {
          const data = await res.json()
          setResume(data)
          setStatus("idle")
        } else {
          toast.error("Resume not found")
          router.push("/resumes")
        }
      } catch (error) {
        console.error(error)
        toast.error("Error loading resume")
      } finally {
        setLoading(false)
      }
    }
    fetchResume()
  }, [id])

  const ensureNonDefaultResume = async (): Promise<string> => {
    if (!resume) return id
    const isDefaultResume = resume.isDefault || resume.title.toLowerCase() === "kaushal resume" || id === "b643c468-2b38-462d-b370-970747b9e878"
    if (!isDefaultResume) return id

    setStatus("saving")
    toast.info("Saving changes will create a copy of the default resume...")

    const dupRes = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" })
    if (!dupRes.ok) throw new Error("Failed to duplicate default resume")
    
    const duplicated = await dupRes.json()
    const newId = duplicated.id
    const newTitle = resume.title.toLowerCase() === "kaushal resume" ? `${resume.title} (Copy)` : resume.title

    // Rename the duplicate on db
    await fetch(`/api/resumes/${newId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    })
    
    // Update local store metadata and redirect
    updateMetadata({ title: newTitle })
    setResume({
      ...resume,
      id: newId,
      title: newTitle,
    })

    router.replace(`/resumes/${newId}/edit`)
    return newId
  }

  // 2. Debounced Autosave (saves 1s after last change)
  useEffect(() => {
    if (!resume || loading) return

    const timer = setTimeout(async () => {
      setStatus("saving")
      try {
        const activeId = await ensureNonDefaultResume()
        const res = await fetch(`/api/resumes/${activeId}/autosave`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeJson: resume.resumeJson }),
        })
        if (res.ok) {
          setStatus("saved")
          setLastSavedAt(new Date())
        } else {
          setStatus("error")
        }
      } catch (err) {
        console.error(err)
        setStatus("error")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [resume?.resumeJson, id])

  const downloadPDF = () => {
    window.print()
  }

  const downloadWord = () => {
    const resumeElement = document.getElementById("resume-print-area")
    if (!resumeElement) return

    const htmlContent = resumeElement.innerHTML

    // Load design config
    const design = resumeJson.design || {}
    const primaryColor = design.themeColor || "#000000"
    const baseFontSize = design.fontSize || "11px"

    // Map font family choices to CSS font stacks
    const fontStyleFamily = 
      design.fontFamily === "sans" ? "Inter, -apple-system, Arial, sans-serif" : 
      design.fontFamily === "mono" ? "'Geist Mono', 'Courier New', Courier, monospace" : 
      design.fontFamily === "merriweather" ? "'Merriweather', Georgia, 'Times New Roman', serif" : 
      design.fontFamily === "playfair" ? "'Playfair Display', Georgia, 'Times New Roman', serif" : 
      design.fontFamily === "lora" ? "'Lora', Georgia, 'Times New Roman', serif" : 
      design.fontFamily === "roboto" ? "'Roboto', -apple-system, Arial, sans-serif" : 
      design.fontFamily === "outfit" ? "'Outfit', -apple-system, Arial, sans-serif" : 
      design.fontFamily === "jetbrains" ? "'JetBrains Mono', 'Courier New', Courier, monospace" : 
      design.fontFamily === "eb-garamond" ? "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif" : 
      design.fontFamily === "computer-modern" ? "'Computer Modern Serif', Georgia, 'Times New Roman', serif" : 
      "'Times New Roman', Georgia, serif"

    // Map Google Fonts & CDNs
    const fontImports: Record<string, string> = {
      merriweather: "https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap",
      playfair: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap",
      lora: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap",
      roboto: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
      outfit: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap",
      jetbrains: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
      "eb-garamond": "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap",
      "computer-modern": "https://cdn.jsdelivr.net/npm/computer-modern@0.1.3/cmu-serif.min.css"
    }
    const selectedImport = fontImports[design.fontFamily]

    // Map font sizes
    const wordFontSize = 
      baseFontSize === "9px" ? "8.5pt" :
      baseFontSize === "10px" ? "9.5pt" : 
      baseFontSize === "11px" ? "10.5pt" : 
      baseFontSize === "12px" ? "11.5pt" : 
      baseFontSize === "13px" ? "12pt" : 
      baseFontSize === "14px" ? "13pt" : 
      baseFontSize === "15px" ? "14pt" : 
      "10.5pt"

    // Map page margins
    const wordMargin = 
      design.margins === "supercompact" ? "0.3in" :
      design.margins === "compact" ? "0.5in" : 
      design.margins === "wide" ? "1.0in" : 
      "0.75in"

    // Map headings customization
    const headingsBold = design.headingsBold !== false
    const headingsItalic = design.headingsItalic === true
    const headingsUppercase = design.headingsUppercase !== false

    // Map line spacing/leading
    const leadingValue = 
      design.lineSpacing === "extratight" ? "0.95" :
      design.lineSpacing === "normal" ? "1.2" : 
      design.lineSpacing === "loose" ? "1.4" : 
      "1.0"

    const spaceBetweenSections = 
      design.lineSpacing === "extratight" ? "4pt" :
      design.lineSpacing === "normal" ? "12pt" : 
      design.lineSpacing === "loose" ? "16pt" : 
      "8pt"

    const spaceBetweenItems = 
      design.lineSpacing === "extratight" ? "2pt" :
      design.lineSpacing === "normal" ? "8pt" : 
      design.lineSpacing === "loose" ? "12pt" : 
      "4pt"

    // Add MS Word document styling and metadata wrapper
    const documentTemplate = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${resume?.title || "Resume"}</title>
        ${selectedImport ? `<link rel="stylesheet" href="${selectedImport}" />` : ""}
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: A4 portrait;
            margin: ${wordMargin};
          }
          body {
            font-family: ${fontStyleFamily};
            font-size: ${wordFontSize};
            line-height: ${leadingValue};
            color: #000000;
          }
          a {
            color: ${primaryColor};
            text-decoration: underline;
          }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .italic { font-style: italic; }
          .uppercase { text-transform: uppercase; }
          
          /* Spacing overrides based on lineSpacing options */
          .mb-6, .mb-5\\.5, .mb-4, .mb-2\\.5 { margin-bottom: ${spaceBetweenSections}; }
          .space-y-4 > *, .space-y-3 > *, .space-y-1\\.5 > * { margin-top: ${spaceBetweenItems}; }
          
          /* Custom layout elements styling */
          h1 { 
            font-size: 24pt; 
            color: ${primaryColor}; 
            font-family: ${fontStyleFamily}; 
            margin: 0; 
            padding: 0; 
            font-weight: ${headingsBold ? "bold" : "normal"}; 
            font-style: ${headingsItalic ? "italic" : "normal"};
            text-transform: ${headingsUppercase ? "uppercase" : "none"};
            text-align: center; 
          }
          h3 { 
            font-size: 11pt; 
            color: ${primaryColor};
            font-family: ${fontStyleFamily}; 
            font-weight: ${headingsBold ? "bold" : "normal"}; 
            font-style: ${headingsItalic ? "italic" : "normal"};
            text-transform: ${headingsUppercase ? "uppercase" : "none"};
            margin: 0; 
            margin-top: ${spaceBetweenSections}; 
          }
          hr { border: none; border-top: 1px solid ${primaryColor}; margin: 2px 0 6px 0; }
          ul { margin: 2px 0 0 15px; padding: 0; list-style-type: disc; }
          li { margin-bottom: 2px; font-family: ${fontStyleFamily}; font-size: ${wordFontSize}; }
          
          /* Inline tables for flex rows */
          .flex { display: table; width: 100%; }
          .justify-between { display: table; width: 100%; }
          .items-baseline { display: table; width: 100%; }
          .font-serif { font-family: ${fontStyleFamily}; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `

    const blob = new Blob(['\ufeff' + documentTemplate], {
      type: 'application/msword'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${resume?.title || "Resume"}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Loading Screen
  if (loading || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AppLoader message="Loading Resume Editor" />
      </div>
    )
  }

  const resumeJson = resume.resumeJson
  const sectionOrder = resumeJson.sectionOrder || []

  // Dynamic Metadata Updates
  const handleMetaChange = async (key: "title" | "templateId" | "themeId", value: string) => {
    updateMetadata({ [key]: value })
    try {
      const activeId = await ensureNonDefaultResume()
      await fetch(`/api/resumes/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Find Section Schema (or construct custom schema dynamically)
  const getSectionSchema = (sectionId: string): SectionSchema | undefined => {
    const standard = RESUME_SECTIONS_SCHEMAS.find((s) => s.id === sectionId)
    if (standard) return standard

    const customData = resumeJson[sectionId]
    if (customData && customData.custom) {
      return {
        id: sectionId,
        title: customData.title,
        repeatable: true,
        icon: "Sparkles",
        description: "Custom user section",
        fields: customData.fields.map((f: any) => ({
          id: f.id,
          label: f.label,
          placeholder: `Enter ${f.label.toLowerCase()}`,
          type: f.type,
          defaultValue: "",
        })),
      }
    }
    return undefined
  }

  const activeSchema = getSectionSchema(activeSectionId)

  // Drag & Drop HTML5 Handlers for sections list re-ordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderSections(draggedIndex, index)
    }
    setDraggedIndex(null)
  }

  // Create custom section wizard execute
  const handleCreateCustomSection = () => {
    if (!customTitle.trim()) {
      toast.error("Section title is required")
      return
    }
    const sectionId = `custom_${Date.now()}`
    const fields = customFields.map((f, index) => ({
      id: f.id || `field_${index}`,
      label: f.label.trim() || `Field ${index + 1}`,
      type: f.type,
    }))

    addCustomSection(sectionId, customTitle.trim(), fields)
    setCustomOpen(false)
    setCustomTitle("")
    setCustomFields([{ id: "field1", label: "Field 1 Label", type: "text" }])
    setActiveSectionId(sectionId)
    toast.success("Custom section added!")
  }

  const addCustomFieldRow = () => {
    const newId = `field_${Date.now()}`
    setCustomFields([...customFields, { id: newId, label: "", type: "text" }])
  }

  const updateCustomFieldRow = (index: number, key: "label" | "type", val: string) => {
    setCustomFields(
      customFields.map((f, idx) => (idx === index ? { ...f, [key]: val } : f))
    )
  }

  const removeCustomFieldRow = (index: number) => {
    if (customFields.length === 1) return
    setCustomFields(customFields.filter((_, idx) => idx !== index))
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50/50">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* ROOT CONTAINER RESET */
          html, body, #__next, [data-reactroot], .flex-col, .h-screen, .flex-1 {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }

          /* RESET PANEL GROUP DISPLAY FOR PRINT */
          [data-panel-group] {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            position: relative !important;
          }
          [data-panel] {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* HIDE ALL UI PANELS & NO-PRINT ELEMENTS */
          .no-print,
          [data-panel].no-print,
          [data-panel-resize-handle],
          header,
          aside {
            display: none !important;
          }

          /* FORCE RESUME CONTAINER TO BE POSITIONED AT TOP */
          #resume-print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important; /* Reset zoom scale */
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      ` }} />
      {/* 1. TOP NAVBAR */}
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between shrink-0 shadow-sm z-10 no-print">
        <div className="flex items-center gap-3">
          <Link href="/resumes">
            <Button variant="ghost" size="icon" className="cursor-pointer h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Input
            value={resume.title}
            onChange={(e) => handleMetaChange("title", e.target.value)}
            className="h-8 font-bold border-transparent hover:border-input focus:border-input max-w-[250px] px-2 text-sm"
          />
          {/* Autosave Status Badge */}
          <div className="flex items-center gap-1.5 ml-2">
            {status === "saving" && (
              <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50 border-blue-200 animate-pulse">
                Saving...
              </Badge>
            )}
            {status === "saved" && (
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">
                <Check className="h-2.5 w-2.5 mr-0.5" /> Saved
              </Badge>
            )}
            {status === "error" && (
              <Badge variant="destructive" className="text-[10px]">
                Error Saving
              </Badge>
            )}
          </div>
        </div>

        {/* Top bar controls (Undo, Redo, Template, Print option) */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <Button variant="ghost" size="icon" onClick={undo} disabled={past.length === 0} className="h-8 w-8 cursor-pointer" title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={future.length === 0} className="h-8 w-8 cursor-pointer" title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 2. THREE PANEL LAYOUT */}
      <div className="flex-1 overflow-hidden relative">
        <PanelGroup direction="horizontal" onLayout={setPanelSizes}>
          
          {/* LEFT PANEL: Sections management */}
          <Panel defaultSize={panelSizes[0]} minSize={15} maxSize={30} className="bg-card border-r flex flex-col overflow-hidden h-full no-print">
            <div className="p-3 border-b flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Edit Sections</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 cursor-pointer hover:bg-slate-100"
                onClick={() => setCustomOpen(true)}
                title="Add Custom Section"
              >
                <Plus className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
            
            {/* Sections List with editing capabilities */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {sectionOrder.map((sectionId: string, index: number) => {
                const section = resumeJson[sectionId]
                if (!section) return null
                const schema = getSectionSchema(sectionId)
                if (!schema) return null

                const isActive = activeSectionId === sectionId
                const isVisible = section.visible !== false

                // Personal info is static at the top, no order/visibility toggles needed
                if (sectionId === "personalInfo") {
                  return (
                    <button
                      key={sectionId}
                      onClick={() => setActiveSectionId(sectionId)}
                      className={`w-full flex items-center p-2.5 rounded-lg border text-left transition-all select-none cursor-pointer ${
                        isActive ? "bg-primary text-white border-primary shadow-sm font-semibold" : "hover:bg-muted/50 bg-card border-border"
                      }`}
                    >
                      <span className="text-xs">{resumeJson[sectionId]?.title || schema.title}</span>
                    </button>
                  )
                }

                return (
                  <div
                    key={sectionId}
                    className={`flex items-center justify-between p-1.5 pl-2.5 rounded-lg border transition-all ${
                      isActive ? "bg-primary text-white border-primary shadow-sm" : "bg-card border-border hover:bg-muted/50"
                    } ${!isVisible ? "opacity-60 bg-slate-50/50" : ""}`}
                  >
                    {/* Section Selector Text */}
                    <button
                      onClick={() => setActiveSectionId(sectionId)}
                      className="flex-1 text-left min-w-0 pr-1 cursor-pointer focus:outline-none"
                    >
                      <span className={`text-xs block truncate ${isActive ? "font-semibold text-white" : "text-slate-800"}`}>
                        {resumeJson[sectionId]?.title || schema.title}
                      </span>
                    </button>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Move Up */}
                      <button
                        disabled={index <= 1} // Index 0 is personalInfo
                        onClick={(e) => {
                          e.stopPropagation()
                          reorderSections(index, index - 1)
                        }}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          index <= 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100/50"
                        } ${isActive ? "text-white/80 hover:bg-white/20" : "text-slate-500"}`}
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        disabled={index === sectionOrder.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          reorderSections(index, index + 1)
                        }}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          index === sectionOrder.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100/50"
                        } ${isActive ? "text-white/80 hover:bg-white/20" : "text-slate-500"}`}
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSectionVisibility(sectionId)
                        }}
                        className={`p-1 rounded cursor-pointer hover:bg-slate-100/50 transition-colors ${
                          isActive ? "text-white/80 hover:bg-white/20" : "text-slate-500"
                        }`}
                        title={isVisible ? "Hide Section" : "Show Section"}
                      >
                        {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Custom Delete */}
                      {section.custom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Are you sure you want to delete the custom section "${section.title}"?`)) {
                              removeCustomSection(sectionId)
                              if (activeSectionId === sectionId) setActiveSectionId("personalInfo")
                            }
                          }}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isActive ? "text-white/95 hover:bg-white/20" : "text-destructive hover:bg-red-50"
                          }`}
                          title="Delete Section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Special Document Design styling section */}
              <button
                onClick={() => setActiveSectionId("styling")}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all select-none cursor-pointer mt-4 ${
                  activeSectionId === "styling" ? "bg-primary text-white border-primary shadow-sm font-semibold" : "hover:bg-muted/50 bg-card border-border border-dashed text-slate-700"
                }`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-xs">Document Design / Styling</span>
              </button>

              {/* AI Assistant Section */}
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all select-none cursor-pointer mt-2 ${
                  showAiPanel
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold animate-pulse"
                    : "hover:bg-indigo-50/50 bg-card border-indigo-200 border-dashed text-indigo-700"
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold">✨ AI Assistant</span>
              </button>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 hover:bg-primary/20 bg-slate-100 transition-colors cursor-col-resize shrink-0 no-print" />

          {/* CENTER PANEL: Form inputs Editor */}
          <Panel defaultSize={panelSizes[1]} minSize={30} maxSize={60} className="bg-card flex flex-col overflow-hidden h-full no-print">
            {activeSectionId === "styling" ? (
              /* Custom Document Design Settings Panel */
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800">Document Design & Styling</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Customize fonts, colors, and layout spacing dynamically</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Font Family selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Font Family</Label>
                    <Select
                      value={resumeJson.design?.fontFamily || "serif"}
                      onValueChange={(val) => updateField("design", "fontFamily", val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Font Family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serif" className="text-xs font-serif">Classic Serif (Times New Roman / Georgia)</SelectItem>
                        <SelectItem value="sans" className="text-xs font-sans">Modern Sans-Serif (Inter / Geist)</SelectItem>
                        <SelectItem value="mono" className="text-xs font-mono">Developer Mono (Geist Mono / Fira)</SelectItem>
                        <SelectItem value="computer-modern" className="text-xs font-serif">Computer Modern (LaTeX Classic)</SelectItem>
                        <SelectItem value="eb-garamond" className="text-xs font-serif">EB Garamond (Elegant Book Serif)</SelectItem>
                        <SelectItem value="merriweather" className="text-xs font-serif">Merriweather (Warm Serif)</SelectItem>
                        <SelectItem value="playfair" className="text-xs font-serif">Playfair Display (Elegant Serif)</SelectItem>
                        <SelectItem value="lora" className="text-xs font-serif">Lora (Contemporary Serif)</SelectItem>
                        <SelectItem value="roboto" className="text-xs font-sans">Roboto (Clean Sans)</SelectItem>
                        <SelectItem value="outfit" className="text-xs font-sans">Outfit (Geometric Sans)</SelectItem>
                        <SelectItem value="jetbrains" className="text-xs font-mono">JetBrains Mono (Premium Developer Mono)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Primary Color Selection */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold text-slate-700">Theme Color</Label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { name: "Black", color: "#000000" },
                        { name: "Navy", color: "#1e3a8a" },
                        { name: "Slate", color: "#475569" },
                        { name: "Emerald", color: "#047857" },
                        { name: "Crimson", color: "#b91c1c" },
                        { name: "Indigo", color: "#4338ca" },
                        { name: "Teal", color: "#0f766e" },
                      ].map((theme) => {
                        const isSelected = (resumeJson.design?.themeColor || "#000000") === theme.color
                        return (
                          <button
                            key={theme.color}
                            onClick={() => updateField("design", "themeColor", theme.color)}
                            className={`h-8 px-3 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected ? "ring-2 ring-primary border-primary bg-slate-50" : "bg-card hover:bg-slate-50"
                            }`}
                          >
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                            {theme.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Font Size selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Base Font Size</Label>
                    <Select
                      value={resumeJson.design?.fontSize || "11px"}
                      onValueChange={(val) => updateField("design", "fontSize", val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Font Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9px" className="text-xs font-mono">Micro (8.5pt / 9px)</SelectItem>
                        <SelectItem value="10px" className="text-xs font-mono">Extra Small (9.5pt / 10px)</SelectItem>
                        <SelectItem value="11px" className="text-xs font-mono">Small (10.5pt / 11px) - Recommended</SelectItem>
                        <SelectItem value="12px" className="text-xs font-mono">Normal (11.5pt / 12px)</SelectItem>
                        <SelectItem value="13px" className="text-xs font-mono">Medium (12pt / 13px)</SelectItem>
                        <SelectItem value="14px" className="text-xs font-mono">Large (12.5pt / 14px)</SelectItem>
                        <SelectItem value="15px" className="text-xs font-mono">Extra Large (13.5pt / 15px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Line Spacing selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Line Spacing / Margins</Label>
                    <Select
                      value={resumeJson.design?.lineSpacing || "tight"}
                      onValueChange={(val) => updateField("design", "lineSpacing", val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Spacing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="extratight" className="text-xs">Extra Tight (Maximum compact)</SelectItem>
                        <SelectItem value="tight" className="text-xs">Tight (Compact, fits more content)</SelectItem>
                        <SelectItem value="normal" className="text-xs">Normal (Balanced layout)</SelectItem>
                        <SelectItem value="loose" className="text-xs">Loose (Generous spacing)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Page Margins selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Page Margins</Label>
                    <Select
                      value={resumeJson.design?.margins || "normal"}
                      onValueChange={(val) => updateField("design", "margins", val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Margins" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supercompact" className="text-xs">Super Compact (0.3 in / Maximize space)</SelectItem>
                        <SelectItem value="compact" className="text-xs">Compact (0.5 in / Fits more content)</SelectItem>
                        <SelectItem value="normal" className="text-xs">Normal (0.75 in / Standard)</SelectItem>
                        <SelectItem value="wide" className="text-xs">Wide (1.0 in / Generous white space)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Name Alignment selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Name & Contact Alignment</Label>
                    <Select
                      value={resumeJson.design?.titleAlign || "center"}
                      onValueChange={(val) => updateField("design", "titleAlign", val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left" className="text-xs">Left Aligned</SelectItem>
                        <SelectItem value="center" className="text-xs">Centered</SelectItem>
                        <SelectItem value="right" className="text-xs">Right Aligned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Section Title Layout */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Section Title Design</Label>
                    <Select
                      value={resumeJson.design?.sectionHeaderStyle || "left-line"}
                      onValueChange={(val) => updateField("design", "sectionHeaderStyle", val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Header Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left-line" className="text-xs">Left aligned with divider line</SelectItem>
                        <SelectItem value="center-line" className="text-xs">Centered with divider line</SelectItem>
                        <SelectItem value="clean" className="text-xs">Clean left-aligned (no divider line)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Divider Line Thickness */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Divider Line Thickness</Label>
                    <Select
                      value={resumeJson.design?.dividerThickness || "1px"}
                      onValueChange={(val) => updateField("design", "dividerThickness", val)}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Thickness" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1px" className="text-xs">Thin (1px)</SelectItem>
                        <SelectItem value="2px" className="text-xs">Medium (2px)</SelectItem>
                        <SelectItem value="3px" className="text-xs">Thick (3px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Headings styling switches */}
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Heading Styles</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50">
                        <Label className="text-xs font-medium text-slate-700 cursor-pointer" htmlFor="headingsBold">Bold Headings</Label>
                        <input
                          type="checkbox"
                          id="headingsBold"
                          checked={resumeJson.design?.headingsBold !== false}
                          onChange={(e) => updateField("design", "headingsBold", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-primary cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50">
                        <Label className="text-xs font-medium text-slate-700 cursor-pointer" htmlFor="headingsItalic">Italic Headings</Label>
                        <input
                          type="checkbox"
                          id="headingsItalic"
                          checked={resumeJson.design?.headingsItalic === true}
                          onChange={(e) => updateField("design", "headingsItalic", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-primary cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50/50">
                        <Label className="text-xs font-medium text-slate-700 cursor-pointer" htmlFor="headingsUppercase">UPPERCASE HEADINGS</Label>
                        <input
                          type="checkbox"
                          id="headingsUppercase"
                          checked={resumeJson.design?.headingsUppercase !== false}
                          onChange={(e) => updateField("design", "headingsUppercase", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeSchema ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {resumeJson[activeSectionId]?.title || activeSchema.title}
                      </h3>
                      {resumeJson[activeSectionId]?.custom && <Badge variant="secondary">Custom</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{activeSchema.description}</p>
                  </div>

                  {activeSectionId !== "personalInfo" && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Section Header Name</Label>
                      <Input
                        value={resumeJson[activeSectionId]?.title ?? activeSchema.title}
                        onChange={(e) => {
                          updateField(activeSectionId, "title", e.target.value)
                        }}
                        placeholder="e.g. WORK EXPERIENCE"
                        className="h-8 w-[180px] text-xs font-semibold"
                      />
                    </div>
                  )}
                </div>

                {/* Form dynamic wrapper */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {activeSchema.repeatable ? (
                    /* REPEATABLE SECTION: Renders repeatable cards list */
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Added entries ({(resumeJson[activeSectionId]?.items || []).length})</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            const init: Record<string, any> = {}
                            activeSchema.fields.forEach((f) => {
                              init[f.id] = f.defaultValue ?? ""
                            })
                            addRepeatableItem(activeSectionId, init)
                          }}
                          className="cursor-pointer gap-1.5 text-xs h-8"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Item
                        </Button>
                      </div>

                      {/* Items Accordion list */}
                      <div className="space-y-3">
                        {(resumeJson[activeSectionId]?.items || []).map((item: any, idx: number) => {
                          const isExpanded = expandedItems[item.id] !== false // Default open
                          const itemTitle =
                            item.company ||
                            item.institution ||
                            item.name ||
                            item.title ||
                            item.platform ||
                            `Entry #${idx + 1}`

                          return (
                            <Card key={item.id} className="border bg-card shadow-sm overflow-hidden">
                              <div
                                onClick={() => toggleItemExpanded(item.id)}
                                className="p-3 flex items-center justify-between bg-slate-50/50 cursor-pointer border-b hover:bg-slate-100/50 select-none"
                              >
                                <span className="text-xs font-bold text-slate-700 truncate max-w-[70%]">{itemTitle}</span>
                                <div className="flex items-center gap-1">
                                  {/* Repeatable actions: Duplicate, Move Up, Move Down, Delete */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      addRepeatableItem(activeSectionId, { ...item, id: undefined })
                                    }}
                                    className="p-1 rounded text-slate-500 hover:bg-muted cursor-pointer"
                                    title="Duplicate"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (idx > 0) reorderRepeatableItems(activeSectionId, idx, idx - 1)
                                    }}
                                    disabled={idx === 0}
                                    className="p-1 rounded text-slate-500 hover:bg-muted disabled:opacity-40 cursor-pointer"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const len = (resumeJson[activeSectionId]?.items || []).length
                                      if (idx < len - 1) reorderRepeatableItems(activeSectionId, idx, idx + 1)
                                    }}
                                    disabled={idx === (resumeJson[activeSectionId]?.items || []).length - 1}
                                    className="p-1 rounded text-slate-500 hover:bg-muted disabled:opacity-40 cursor-pointer"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeRepeatableItem(activeSectionId, item.id)
                                    }}
                                    className="p-1 rounded text-destructive hover:bg-muted cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {isExpanded && (
                                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {activeSchema.fields.map((field) => {
                                    const val = item[field.id] ?? ""

                                    if (field.type === "checkbox") {
                                      return (
                                        <div key={field.id} className="sm:col-span-2 flex items-center gap-2 py-1.5 mt-1">
                                          <input
                                            type="checkbox"
                                            id={`${item.id}-${field.id}`}
                                            checked={!!val}
                                            onChange={(e) =>
                                              updateRepeatableItem(activeSectionId, item.id, field.id, e.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                                          />
                                          <Label
                                            htmlFor={`${item.id}-${field.id}`}
                                            className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                                          >
                                            {field.label}
                                          </Label>
                                        </div>
                                      )
                                    }

                                    return (
                                      <div
                                        key={field.id}
                                        className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                                      >
                                        <Label className="text-xs font-semibold text-slate-700">{field.label}</Label>
                                        {field.type === "textarea" ? (
                                          <Textarea
                                            value={val}
                                            onChange={(e) =>
                                              updateRepeatableItem(activeSectionId, item.id, field.id, e.target.value)
                                            }
                                            placeholder={field.placeholder}
                                            className="text-xs"
                                            rows={3}
                                          />
                                        ) : (
                                          <Input
                                            value={val}
                                            onChange={(e) =>
                                              updateRepeatableItem(activeSectionId, item.id, field.id, e.target.value)
                                            }
                                            placeholder={field.placeholder}
                                            className="text-xs h-9"
                                            type={field.type}
                                          />
                                        )}
                                      </div>
                                    )
                                  })}
                                </CardContent>
                              )}
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    /* NON-REPEATABLE SECTION: Render direct fields */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeSchema.fields.map((field) => {
                          const val = resumeJson[activeSectionId]?.[field.id] ?? ""

                          if (field.type === "checkbox") {
                              return (
                                <div key={field.id} className="sm:col-span-2 flex items-center gap-2 py-1.5 mt-1">
                                  <input
                                    type="checkbox"
                                    id={`${activeSectionId}-${field.id}`}
                                    checked={!!val}
                                    onChange={(e) => updateField(activeSectionId, field.id, e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                                  />
                                  <Label
                                    htmlFor={`${activeSectionId}-${field.id}`}
                                    className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                                  >
                                    {field.label}
                                  </Label>
                                </div>
                              )
                            }

                            return (
                              <div
                                key={field.id}
                                className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                              >
                                <Label className="text-xs font-semibold text-slate-700">{field.label}</Label>
                                {field.type === "textarea" ? (
                                  <Textarea
                                    value={val}
                                    onChange={(e) => updateField(activeSectionId, field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="text-xs"
                                    rows={4}
                                  />
                                ) : (
                                  <Input
                                    value={val}
                                    onChange={(e) => updateField(activeSectionId, field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="text-xs h-9"
                                    type={field.type}
                                  />
                                )}
                              </div>
                            )
                        })}
                      </div>

                      {/* Extra Contact Visibility Checkboxes for Personal Information */}
                      {activeSectionId === "personalInfo" && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-sm font-bold text-slate-800 mb-3">Header Contact Links Visibility</h4>
                          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            {[
                              { id: "showPhone", label: "Show Phone Number" },
                              { id: "showEmail", label: "Show Email Address" },
                              { id: "showLinkedIn", label: "Show LinkedIn Profile" },
                              { id: "showGitHub", label: "Show GitHub Profile" },
                              { id: "showPortfolio", label: "Show LeetCode Link" },
                              { id: "showWebsite", label: "Show GeeksforGeeks Link" },
                            ].map((opt) => {
                              const checked = resumeJson.personalInfo?.[opt.id] !== false
                              return (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={opt.id}
                                    checked={checked}
                                    onChange={(e) => {
                                      updateField("personalInfo", opt.id, e.target.checked)
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                  />
                                  <label htmlFor={opt.id} className="text-xs font-medium text-slate-700 select-none cursor-pointer">
                                    {opt.label}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Select a section to start editing
              </div>
            )}
          </Panel>

          {showAiPanel && (
            <>
              <PanelResizeHandle className="w-1.5 hover:bg-indigo-300/30 bg-slate-100 transition-colors cursor-col-resize shrink-0 no-print" />
              <Panel defaultSize={28} minSize={20} maxSize={50} className="bg-card border-r border-l flex flex-col overflow-hidden h-full no-print">
                <div className="p-3 border-b flex justify-between items-center bg-indigo-50/20 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI Assistant Workspace
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 cursor-pointer hover:bg-slate-200/50"
                    onClick={() => setShowAiPanel(false)}
                    title="Close Workspace"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <AiAssistantDashboard id={id} />
                </div>
              </Panel>
            </>
          )}

          <PanelResizeHandle className="w-1.5 hover:bg-primary/20 bg-slate-100 transition-colors cursor-col-resize shrink-0 no-print" />

          {/* RIGHT PANEL: Live Resume Document Preview */}
          <Panel defaultSize={panelSizes[2]} minSize={25} maxSize={50} className="bg-slate-100 flex flex-col overflow-hidden h-full">
            {/* Preview Toolbar */}
            <div className="h-10 border-b bg-card flex items-center justify-between px-3 shrink-0 no-print">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Render Preview</span>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={downloadPDF}
                  className="h-7 px-2.5 text-[11px] font-bold cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0 gap-1 rounded-md flex items-center shadow-sm select-none"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>
                <button
                  onClick={downloadWord}
                  className="h-7 px-2.5 text-[11px] font-bold cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0 gap-1 rounded-md flex items-center shadow-sm select-none"
                >
                  <Download className="h-3 w-3" /> Word
                </button>

                <div className="h-4 w-[1px] bg-slate-200 mx-1 shrink-0" />

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-semibold select-none text-slate-600">{zoomLevel}%</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => setZoomLevel(90)}
                  title="Reset Zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Document Render Container with zoom scaling */}
            <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
              <div
                id="resume-print-area"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease-out",
                }}
                className="w-full shrink-0 print-container"
              >
                <ResumeTemplateSelector resumeJson={resumeJson} templateId={resume.templateId} />
              </div>
            </div>
          </Panel>

        </PanelGroup>
      </div>

      {/* CREATE CUSTOM SECTION DIALOG */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Section</DialogTitle>
            <DialogDescription>Define your own section title and repeat fields</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Section Title</Label>
              <Input
                placeholder="e.g. Patents or Hackathons"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">Custom Fields</span>
                <Button size="sm" variant="outline" className="cursor-pointer h-7 text-[10px]" onClick={addCustomFieldRow}>
                  Add Field
                </Button>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto p-1">
                {customFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      placeholder="Field Label (e.g. Project Name)"
                      value={field.label}
                      onChange={(e) => updateCustomFieldRow(idx, "label", e.target.value)}
                      className="text-xs flex-1 h-8"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(val: any) => updateCustomFieldRow(idx, "type", val)}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-xs cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Short Text</SelectItem>
                        <SelectItem value="textarea">Long Text</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeCustomFieldRow(idx)}
                      disabled={customFields.length === 1}
                      className="h-8 w-8 text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button variant="outline" onClick={() => setCustomOpen(false)} className="cursor-pointer">Cancel</Button>
              <Button onClick={handleCreateCustomSection} className="cursor-pointer">Create Section</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
