import React from "react"
import { Mail, Phone, MapPin, Link as LinkIcon, Github, Linkedin, Globe, Code } from "lucide-react"

interface TemplateProps {
  resumeJson: Record<string, any>
  themeId?: string
}

// ----------------------------------------------------
// HELPER FOR RENDERING ICONS
// ----------------------------------------------------
function renderSocialIcon(type: string) {
  switch (type) {
    case "email":
      return <Mail className="h-3.5 w-3.5" />
    case "phone":
      return <Phone className="h-3.5 w-3.5" />
    case "location":
      return <MapPin className="h-3.5 w-3.5" />
    case "github":
      return <Github className="h-3.5 w-3.5" />
    case "linkedin":
      return <Linkedin className="h-3.5 w-3.5" />
    default:
      return <Globe className="h-3.5 w-3.5" />
  }
}

// ----------------------------------------------------
// SHARED UTILITIES & HELPERS
// ----------------------------------------------------

export const fontImports: Record<string, string> = {
  merriweather: "https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap",
  playfair: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap",
  lora: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap",
  roboto: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
  outfit: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap",
  jetbrains: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
  "eb-garamond": "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap",
  "computer-modern": "https://cdn.jsdelivr.net/npm/computer-modern@0.1.3/cmu-serif.min.css"
}

export function parseBoldText(text: string) {
  if (!text) return ""
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-black">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export function renderDescription(text: string, fontStyle?: React.CSSProperties, lineSpacing: string = "normal") {
  if (!text) return null
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Determine if it should render as a bullet list
  const isBulletList = lines.length > 1 || lines.some(line => /^[\s•\-\*]/.test(line))

  const leadingClass = 
    lineSpacing === "extratight" ? "leading-[1.15]" :
    lineSpacing === "normal" ? "leading-normal" : 
    lineSpacing === "loose" ? "leading-relaxed" : 
    "leading-tight"

  const spaceBetweenBullets = 
    lineSpacing === "extratight" ? "space-y-0" :
    lineSpacing === "normal" ? "space-y-0.5" : 
    lineSpacing === "loose" ? "space-y-1.5" : 
    "space-y-0"

  const mtClass = 
    lineSpacing === "extratight" ? "mt-0" :
    lineSpacing === "normal" ? "mt-1" : 
    lineSpacing === "loose" ? "mt-2" : 
    "mt-0.5"

  if (isBulletList) {
    const cleanLines = lines.map((line) => line.replace(/^[\s•\-\*]+\s*/, ""))
    return (
      <ul className={`list-disc pl-4 ${spaceBetweenBullets} ${mtClass} ${leadingClass} text-slate-900`} style={fontStyle}>
        {cleanLines.map((line, i) => (
          <li key={i} className="pl-0.5">
            {parseBoldText(line)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className={`${mtClass} ${leadingClass} text-slate-900`} style={fontStyle}>
      {parseBoldText(text)}
    </p>
  )
}

function getFontStyleFamily(family?: string, defaultFamily: string = "Times New Roman, Georgia, serif") {
  switch (family) {
    case "sans":
      return "Inter, -apple-system, sans-serif"
    case "mono":
      return "Geist Mono, Courier New, monospace"
    case "merriweather":
      return "'Merriweather', Georgia, serif"
    case "playfair":
      return "'Playfair Display', Georgia, serif"
    case "lora":
      return "'Lora', Georgia, serif"
    case "roboto":
      return "'Roboto', -apple-system, sans-serif"
    case "outfit":
      return "'Outfit', -apple-system, sans-serif"
    case "jetbrains":
      return "'JetBrains Mono', Courier New, monospace"
    case "eb-garamond":
      return "'EB Garamond', Garamond, Georgia, serif"
    case "computer-modern":
      return "'Computer Modern Serif', Georgia, serif"
    case "serif":
      return "Times New Roman, Georgia, serif"
    default:
      return defaultFamily
  }
}

function getSpacingAndMargins(design: Record<string, any>) {
  const spaceBetweenSections = 
    design.lineSpacing === "extratight" ? "mb-0.5" :
    design.lineSpacing === "normal" ? "mb-4" : 
    design.lineSpacing === "loose" ? "mb-5.5" : 
    "mb-2.5"
    
  const spaceBetweenItems = 
    design.lineSpacing === "extratight" ? "space-y-0" :
    design.lineSpacing === "normal" ? "space-y-3" : 
    design.lineSpacing === "loose" ? "space-y-4" : 
    "space-y-1.5"

  const leadingClass = 
    design.lineSpacing === "extratight" ? "leading-[1.15]" :
    design.lineSpacing === "normal" ? "leading-normal" : 
    design.lineSpacing === "loose" ? "leading-relaxed" : 
    "leading-tight"

  const marginPaddingClass = 
    design.margins === "supercompact" ? "pt-1.5 pb-1.5 px-4" :
    design.margins === "compact" ? "p-5" : 
    design.margins === "wide" ? "p-10" : 
    "p-8"

  const itemMarginBottom = 
    design.lineSpacing === "extratight" ? "mb-0" :
    design.lineSpacing === "normal" ? "mb-2" : 
    design.lineSpacing === "loose" ? "mb-3" : 
    "mb-1.5"

  return {
    spaceBetweenSections,
    spaceBetweenItems,
    leadingClass,
    marginPaddingClass,
    itemMarginBottom
  }
}

function getScaledFontSizes(baseFontSize: string) {
  const base = parseInt(baseFontSize, 10) || 11
  return {
    base,
    title3xl: { fontSize: `${Math.round(base * 2.7)}px` },
    title2xl: { fontSize: `${Math.round(base * 2.2)}px` },
    titleLg: { fontSize: `${Math.round(base * 1.6)}px` },
    titleMd: { fontSize: `${Math.round(base * 1.45)}px` },
    textSm: { fontSize: `${Math.round(base * 1.25)}px` },
    textNormal: { fontSize: `${base}px` },
    textXs: { fontSize: `${Math.round(base * 1.05)}px` },
    textXxs: { fontSize: `${Math.round(base * 0.95)}px` },
  }
}

// ----------------------------------------------------
// MODERN TEMPLATE (Single Column, Elegant borders)
// ----------------------------------------------------
export function ModernTemplate({ resumeJson }: TemplateProps) {
  const personalInfo = resumeJson.personalInfo || {}
  const summary = resumeJson.summary || {}
  const sectionOrder = resumeJson.sectionOrder || []

  // Load design config
  const design = resumeJson.design || {}
  const primaryColor = design.themeColor || "#000000"
  const baseFontSize = design.fontSize || "11px"
  const fontStyleFamily = getFontStyleFamily(design.fontFamily, "Inter, -apple-system, sans-serif")
  const selectedImport = fontImports[design.fontFamily]

  const {
    spaceBetweenSections,
    spaceBetweenItems,
    leadingClass,
    marginPaddingClass
  } = getSpacingAndMargins(design)

  const sizes = getScaledFontSizes(baseFontSize)

  const rootStyle = {
    fontFamily: fontStyleFamily,
    fontSize: `${sizes.base}px`,
    '--primary': primaryColor,
  } as React.CSSProperties

  return (
    <>
      {selectedImport && (
        <link rel="stylesheet" href={selectedImport} />
      )}
      <div 
        className={`${marginPaddingClass} bg-white text-slate-800 shadow-sm rounded-lg min-h-[1050px] w-full max-w-[800px] mx-auto ${leadingClass}`}
        style={rootStyle}
      >
        {/* Header */}
        <div className="border-b border-primary/20 pb-6 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="font-extrabold tracking-tight text-primary uppercase" style={sizes.title3xl}>
                {personalInfo.fullName || "Your Name"}
              </h1>
              <p className="font-medium text-slate-500 mt-1" style={sizes.titleLg}>
                {personalInfo.headline || "Headline / Job Title"}
              </p>
            </div>
            {personalInfo.photo && (
              <img src={personalInfo.photo} alt={personalInfo.fullName} className="h-20 w-20 rounded-full border border-border object-cover" />
            )}
          </div>

          {/* Contact info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-slate-600" style={sizes.textXs}>
            {personalInfo.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-1.5 col-span-1">
                <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.linkedIn && (
              <div className="flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <a href={personalInfo.linkedIn} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.linkedIn.replace("https://", "")}</a>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.github.replace("https://", "")}</a>
              </div>
            )}
            {personalInfo.portfolio && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <a href={personalInfo.portfolio} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.portfolio.replace("https://", "")}</a>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary.visible !== false && summary.text && (
          <div className="mb-6">
            <p className="text-slate-700 italic" style={sizes.textNormal}>{summary.text}</p>
          </div>
        )}

        {/* Dynamic Sections */}
        {sectionOrder.map((sectionId: string) => {
          const section = resumeJson[sectionId]
          if (!section || section.visible === false) return null

          // Skip rendering non-repeatable info handled above
          if (sectionId === "personalInfo" || sectionId === "summary") return null

          // Render sections based on repeatable/non-repeatable
          return (
            <div key={sectionId} className={spaceBetweenSections}>
              <h3 className="font-bold text-primary border-b border-primary/10 pb-1 uppercase tracking-wide mb-3" style={sizes.titleMd}>
                {section.title || sectionId}
              </h3>
              
              {section.repeatable ? (
                <div className={spaceBetweenItems}>
                  {(section.items || []).map((item: any) => (
                    <div key={item.id} className="group relative">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {/* Title details */}
                          <h4 className="font-bold text-slate-800" style={sizes.textSm}>
                            {item.company || item.institution || item.name || item.title || item.organization || item.platform}
                            {item.role && <span className="font-normal text-slate-500"> — {item.role}</span>}
                            {item.degree && <span className="font-normal text-slate-500"> — {item.degree} in {item.fieldOfStudy}</span>}
                          </h4>
                          {item.companySub && (
                            <p className="text-slate-500 italic mt-0.5 font-medium" style={sizes.textXs}>{item.companySub}</p>
                          )}
                          
                          {/* Subtitle / Metadata details */}
                          <div className="text-slate-500 flex flex-wrap gap-2 mt-0.5" style={sizes.textXxs}>
                            {item.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{item.location}</span>}
                            {item.issuer && <span>Issued by: {item.issuer}</span>}
                            {item.publisher && <span>Published in: {item.publisher}</span>}
                            {item.username && <span>Handle: {item.username}</span>}
                            {item.language && <span>Proficiency: {item.proficiency}</span>}
                            {item.gpa && <span>GPA: {item.gpa}</span>}
                          </div>
                        </div>

                        {/* Dates */}
                        {(item.startDate || item.endDate || item.date) && (
                          <span className="font-semibold text-slate-500 whitespace-nowrap text-right shrink-0" style={sizes.textXs}>
                            {item.startDate} {item.endDate ? ` - ${item.endDate}` : ""} {item.date || ""}
                          </span>
                        )}
                      </div>

                      {/* Description details */}
                      {item.description && renderDescription(item.description, sizes.textNormal, design.lineSpacing)}
                      
                      {/* Link */}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5 mt-1" style={sizes.textXs}>
                          <LinkIcon className="h-3 w-3" /> Link
                        </a>
                      )}
                      
                      {/* Skills & Technologies */}
                      {item.skills && <p className="text-slate-700 mt-1" style={sizes.textXs}><span className="font-bold">Skills:</span> {item.skills}</p>}
                      {item.technologies && <p className="text-slate-700 mt-1" style={sizes.textXs}><span className="font-bold">Technologies:</span> {item.technologies}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-700 whitespace-pre-line" style={sizes.textNormal}>
                  {/* Non repeatable general formats */}
                  {section.skills && <p className="font-semibold" style={sizes.textSm}>{section.skills}</p>}
                  {section.items && <p>{section.items}</p>}
                  {Object.entries(section).map(([k, v]) => {
                    if (k === "visible" || k === "title" || k === "repeatable" || k === "custom" || k === "fields") return null
                    return (
                      <div key={k} className="mt-1">
                        <span className="font-bold capitalize">{k.replace(/([A-Z])/g, " $1")}:</span> <span className="text-slate-600">{String(v)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ----------------------------------------------------
// PROFESSIONAL TEMPLATE (Modern Double Column Layout)
// ----------------------------------------------------
export function ProfessionalTemplate({ resumeJson }: TemplateProps) {
  const personalInfo = resumeJson.personalInfo || {}
  const summary = resumeJson.summary || {}
  const sectionOrder = resumeJson.sectionOrder || []

  // Split sections for left/right column layouts
  const rightColumnSectionIds = ["experience", "education", "projects", "publications", "volunteerWork"]
  const leftColumnSectionIds = sectionOrder.filter((id: string) => !rightColumnSectionIds.includes(id) && id !== "personalInfo" && id !== "summary")

  // Load design config
  const design = resumeJson.design || {}
  const primaryColor = design.themeColor || "#000000"
  const baseFontSize = design.fontSize || "11px"
  const fontStyleFamily = getFontStyleFamily(design.fontFamily, "Inter, -apple-system, sans-serif")
  const selectedImport = fontImports[design.fontFamily]

  const {
    spaceBetweenSections,
    leadingClass,
    marginPaddingClass
  } = getSpacingAndMargins(design)

  const sizes = getScaledFontSizes(baseFontSize)

  const rootStyle = {
    fontFamily: fontStyleFamily,
    fontSize: `${sizes.base}px`,
    '--primary': primaryColor,
  } as React.CSSProperties

  return (
    <>
      {selectedImport && (
        <link rel="stylesheet" href={selectedImport} />
      )}
      <div 
        className={`${marginPaddingClass} bg-white text-slate-800 shadow-sm rounded-lg min-h-[1050px] w-full max-w-[800px] mx-auto ${leadingClass}`}
        style={rootStyle}
      >
        {/* Top Header */}
        <div className="text-center border-b border-primary/20 pb-5 mb-5">
          <h1 className="font-bold tracking-wide text-primary uppercase" style={sizes.title3xl}>
            {personalInfo.fullName || "Your Name"}
          </h1>
          <p className="font-medium text-slate-500 mt-0.5" style={sizes.titleMd}>
            {personalInfo.headline || "Headline / Job Title"}
          </p>
          
          {/* Contact elements list inline */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 text-slate-600" style={sizes.textXs}>
            {personalInfo.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-primary/70" />{personalInfo.email}</span>}
            {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-primary/70" />{personalInfo.phone}</span>}
            {personalInfo.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary/70" />{personalInfo.address}</span>}
            {personalInfo.portfolio && <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-primary/70" /><a href={personalInfo.portfolio} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.portfolio.replace("https://", "")}</a></span>}
          </div>
        </div>

        {/* Summary */}
        {summary.visible !== false && summary.text && (
          <div className="mb-5 bg-slate-50 p-3 rounded-lg border border-border">
            <p className="text-slate-700 italic" style={sizes.textXs}>{summary.text}</p>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Small Column */}
          <div className="col-span-1 border-r border-border pr-5 space-y-5">
            {leftColumnSectionIds.map((sectionId: string) => {
              const section = resumeJson[sectionId]
              if (!section || section.visible === false) return null

              return (
                <div key={sectionId}>
                  <h3 className="font-bold text-primary border-b border-primary/10 pb-1 uppercase tracking-wide mb-2" style={sizes.textXs}>{section.title || sectionId}</h3>
                  
                  {section.repeatable ? (
                    <div className="space-y-2">
                      {(section.items || []).map((item: any) => (
                        <div key={item.id} style={sizes.textXs}>
                          <h4 className="font-semibold text-slate-800">
                            {item.company || item.institution || item.name || item.title || item.platform}
                          </h4>
                          {item.role && <p className="text-slate-500">{item.role}</p>}
                          {item.skills && <p className="text-slate-600 mt-0.5" style={sizes.textXxs}>{item.skills}</p>}
                          {item.language && <p className="text-slate-600 mt-0.5" style={sizes.textXxs}>{item.proficiency}</p>}
                          {item.username && <p className="text-blue-600 hover:underline">{item.username}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-600 whitespace-pre-line" style={sizes.textXs}>
                      {section.skills || section.items || Object.entries(section).map(([k, v]) => {
                        if (k === "visible" || k === "title" || k === "repeatable" || k === "custom" || k === "fields") return null
                        return (
                          <div key={k} className="mt-1">
                            <span className="font-bold block capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                            <span>{String(v)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Large Column */}
          <div className="col-span-2 space-y-5">
            {rightColumnSectionIds.map((sectionId) => {
              const section = resumeJson[sectionId]
              if (!section || section.visible === false) return null

              return (
                <div key={sectionId}>
                  <h3 className="font-bold text-primary border-b border-primary/10 pb-1 uppercase tracking-wide mb-3.5" style={sizes.textXs}>{section.title || sectionId}</h3>
                  
                  <div className="space-y-4">
                    {(section.items || []).map((item: any) => (
                      <div key={item.id}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800" style={sizes.textSm}>
                              {item.company || item.institution || item.name || item.title || item.organization}
                            </h4>
                            <p className="text-slate-500 mt-0.5 font-medium" style={sizes.textXs}>
                              {item.role || item.degree} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ""}
                            </p>
                            {item.companySub && (
                              <p className="text-slate-500 italic mt-0.5 font-medium" style={sizes.textXs}>
                                {item.companySub}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-slate-500" style={sizes.textXxs}>
                            {item.startDate} {item.endDate ? ` - ${item.endDate}` : ""} {item.date || ""}
                          </span>
                        </div>
                        
                        {item.description && renderDescription(item.description, sizes.textXs, design.lineSpacing)}
                        
                        {item.technologies && (
                          <p className="text-slate-700 mt-1" style={sizes.textXxs}><span className="font-semibold">Tech:</span> {item.technologies}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// ----------------------------------------------------
// DEVELOPER TEMPLATE (Dark-themed Accent Sidebar style)
// ----------------------------------------------------
export function DeveloperTemplate({ resumeJson }: TemplateProps) {
  const personalInfo = resumeJson.personalInfo || {}
  const summary = resumeJson.summary || {}
  const sectionOrder = resumeJson.sectionOrder || []

  // Load design config
  const design = resumeJson.design || {}
  const primaryColor = design.themeColor || "#000000"
  const baseFontSize = design.fontSize || "11px"
  const fontStyleFamily = getFontStyleFamily(design.fontFamily, "Geist Mono, Courier New, monospace")
  const selectedImport = fontImports[design.fontFamily]

  const {
    spaceBetweenSections,
    spaceBetweenItems,
    leadingClass,
    marginPaddingClass
  } = getSpacingAndMargins(design)

  const sizes = getScaledFontSizes(baseFontSize)

  const rootStyle = {
    fontFamily: fontStyleFamily,
    fontSize: `${sizes.base}px`,
    '--primary': primaryColor,
  } as React.CSSProperties

  return (
    <>
      {selectedImport && (
        <link rel="stylesheet" href={selectedImport} />
      )}
      <div 
        className={`${marginPaddingClass} bg-white text-slate-800 shadow-sm rounded-lg min-h-[1050px] w-full max-w-[800px] mx-auto ${leadingClass}`}
        style={rootStyle}
      >
        {/* Header Panel */}
        <div className="bg-slate-900 text-slate-100 p-6 rounded-lg mb-6 flex justify-between items-center gap-6">
          <div className="flex-1">
            <h1 className="font-bold tracking-tight text-white" style={sizes.title2xl}>&gt; {personalInfo.fullName || "developer"}</h1>
            <p className="font-semibold text-primary/80 mt-1" style={sizes.textSm}>// {personalInfo.headline || "full stack dev"}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-slate-300" style={sizes.textXxs}>
              {personalInfo.email && <span>email: {personalInfo.email}</span>}
              {personalInfo.phone && <span>phone: {personalInfo.phone}</span>}
              {personalInfo.portfolio && <span>web: {personalInfo.portfolio.replace("https://", "")}</span>}
              {personalInfo.github && <span>github: {personalInfo.github.replace("https://", "")}</span>}
            </div>
          </div>
          {personalInfo.photo && (
            <img src={personalInfo.photo} alt={personalInfo.fullName} className="h-16 w-16 rounded-lg border border-slate-700 object-cover" />
          )}
        </div>

        {/* Summary */}
        {summary.visible !== false && summary.text && (
          <div className="mb-6 text-slate-600 bg-slate-50 p-3 border-l-4 border-slate-900 rounded-r-md" style={sizes.textNormal}>
            {summary.text}
          </div>
        )}

        {/* All sections render sequentially */}
        {sectionOrder.map((sectionId: string) => {
          const section = resumeJson[sectionId]
          if (!section || section.visible === false) return null
          if (sectionId === "personalInfo" || sectionId === "summary") return null

          return (
            <div key={sectionId} className={spaceBetweenSections}>
              <h3 className="font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-1.5" style={sizes.textXs}>
                <span className="text-primary font-bold">#</span> {section.title || sectionId}
              </h3>

              {section.repeatable ? (
                <div className={`${spaceBetweenItems} pl-4 border-l border-slate-100`}>
                  {(section.items || []).map((item: any) => (
                    <div key={item.id} className="relative">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <h4 className="font-bold text-slate-800" style={sizes.textXs}>
                          [{item.company || item.institution || item.name || item.title || item.platform}]
                          {item.role && <span className="font-normal text-slate-500"> - {item.role}</span>}
                        </h4>
                        <span className="text-slate-500 font-semibold" style={sizes.textXxs}>
                          {item.startDate} {item.endDate ? ` - ${item.endDate}` : ""} {item.date || ""}
                        </span>
                      </div>
                      {item.companySub && (
                        <p className="text-slate-500 italic font-mono mt-0.5" style={sizes.textXxs}>
                          // {item.companySub}
                        </p>
                      )}

                      {item.description && renderDescription(item.description, sizes.textXs, design.lineSpacing)}

                      {item.technologies && (
                        <div className="flex items-center gap-1.5 mt-1.5" style={sizes.textXxs}>
                          <Code className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600 font-semibold">{item.technologies}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-600 pl-4 border-l border-slate-100 whitespace-pre-line" style={sizes.textXs}>
                  {section.skills || section.items || Object.entries(section).map(([k, v]) => {
                    if (k === "visible" || k === "title" || k === "repeatable" || k === "custom" || k === "fields") return null
                    return (
                      <div key={k} className="mt-1">
                        <span className="font-bold">{k}:</span> <span>{String(v)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ----------------------------------------------------
// MINIMAL TEMPLATE (Typographic simplicity)
// ----------------------------------------------------
export function MinimalTemplate({ resumeJson }: TemplateProps) {
  const personalInfo = resumeJson.personalInfo || {}
  const summary = resumeJson.summary || {}
  const sectionOrder = resumeJson.sectionOrder || []

  // Load design config
  const design = resumeJson.design || {}
  const primaryColor = design.themeColor || "#000000"
  const baseFontSize = design.fontSize || "11px"
  const fontStyleFamily = getFontStyleFamily(design.fontFamily, "Times New Roman, Georgia, serif")
  const selectedImport = fontImports[design.fontFamily]

  const {
    spaceBetweenSections,
    spaceBetweenItems,
    leadingClass,
    marginPaddingClass
  } = getSpacingAndMargins(design)

  const sizes = getScaledFontSizes(baseFontSize)

  const rootStyle = {
    fontFamily: fontStyleFamily,
    fontSize: `${sizes.base}px`,
    '--primary': primaryColor,
  } as React.CSSProperties

  return (
    <>
      {selectedImport && (
        <link rel="stylesheet" href={selectedImport} />
      )}
      <div 
        className={`${marginPaddingClass} bg-white text-slate-850 shadow-sm rounded-lg min-h-[1050px] w-full max-w-[800px] mx-auto ${leadingClass}`}
        style={rootStyle}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-normal text-slate-900 tracking-tight text-center" style={sizes.title2xl}>{personalInfo.fullName || "Your Name"}</h1>
          <p className="italic text-slate-500 text-center mt-1" style={sizes.textXs}>{personalInfo.headline || "Headline / Job Title"}</p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-slate-500 font-sans border-t border-b border-border py-1.5" style={sizes.textXxs}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.address && <span>{personalInfo.address}</span>}
            {personalInfo.portfolio && <a href={personalInfo.portfolio} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.portfolio.replace("https://", "")}</a>}
          </div>
        </div>

        {/* Summary */}
        {summary.visible !== false && summary.text && (
          <div className="mb-6">
            <p className="text-slate-700 italic text-center px-4" style={sizes.textNormal}>{summary.text}</p>
          </div>
        )}

        {/* All sections render sequentially */}
        {sectionOrder.map((sectionId: string) => {
          const section = resumeJson[sectionId]
          if (!section || section.visible === false) return null
          if (sectionId === "personalInfo" || sectionId === "summary") return null

          return (
            <div key={sectionId} className={spaceBetweenSections}>
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-center border-b border-slate-200 pb-1 mb-3" style={sizes.textXs}>{section.title || sectionId}</h3>

              {section.repeatable ? (
                <div className={spaceBetweenItems}>
                  {(section.items || []).map((item: any) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline font-sans font-semibold text-slate-800" style={sizes.textXs}>
                        <div>
                          {item.company || item.institution || item.name || item.title || item.organization}
                          {item.role && <span className="font-normal text-slate-500 italic"> — {item.role}</span>}
                          {item.degree && <span className="font-normal text-slate-500 italic"> — {item.degree}</span>}
                        </div>
                        <span className="text-slate-500 font-normal" style={sizes.textXxs}>
                          {item.startDate} {item.endDate ? ` - ${item.endDate}` : ""} {item.date || ""}
                        </span>
                      </div>
                      {item.companySub && (
                        <p className="text-slate-500 italic font-sans mt-0.5" style={sizes.textXxs}>
                          {item.companySub}
                        </p>
                      )}

                      {item.description && renderDescription(item.description, sizes.textXs, design.lineSpacing)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-650 text-center" style={sizes.textXs}>
                  {section.skills || section.items || Object.entries(section).map(([k, v]) => {
                    if (k === "visible" || k === "title" || k === "repeatable" || k === "custom" || k === "fields") return null
                    return (
                      <span key={k} className="inline-block mx-2">
                        <span className="font-bold">{k}:</span> <span>{String(v)}</span>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ----------------------------------------------------
export function ClassicTemplate({ resumeJson }: TemplateProps) {
  const personalInfo = resumeJson.personalInfo || {}
  const summary = resumeJson.summary || {}
  const sectionOrder = resumeJson.sectionOrder || []

  // Load design config
  const design = resumeJson.design || {}
  const primaryColor = design.themeColor || "#000000"
  const baseFontSize = design.fontSize || "11px"
  const fontStyleFamily = getFontStyleFamily(design.fontFamily, "Times New Roman, Georgia, serif")
  const selectedImport = fontImports[design.fontFamily]

  const headingsBold = design.headingsBold !== false
  const headingsItalic = design.headingsItalic === true
  const headingsUppercase = design.headingsUppercase !== false

  const headingStyleClass = `
    ${headingsBold ? "font-bold" : "font-normal"}
    ${headingsItalic ? "italic" : "not-italic"}
    ${headingsUppercase ? "uppercase" : "normal-case"}
  `

  const {
    spaceBetweenSections,
    spaceBetweenItems,
    leadingClass,
    marginPaddingClass,
    itemMarginBottom
  } = getSpacingAndMargins(design)

  const headerMarginBottom = 
    design.lineSpacing === "extratight" ? "mb-0.5" :
    design.lineSpacing === "tight" ? "mb-2" : 
    "mb-3"

  const sectionHeaderMarginBottom = 
    design.lineSpacing === "extratight" ? "mb-0" :
    design.lineSpacing === "tight" ? "mb-1" : 
    "mb-1.5"

  const itemTopMargin = 
    design.lineSpacing === "extratight" ? "mt-[0px]" : 
    "mt-[1px]"

  // Title Align Mappings
  const alignClass = 
    design.titleAlign === "left" ? "text-left" : 
    design.titleAlign === "right" ? "text-right" : 
    "text-center"
    
  const justifyClass = 
    design.titleAlign === "left" ? "justify-start" : 
    design.titleAlign === "right" ? "justify-end" : 
    "justify-center"

  // Section Header Divider line mappings
  const isCenteredHeader = design.sectionHeaderStyle === "center-line"
  const showDivider = design.sectionHeaderStyle !== "clean"
  const thickness = design.dividerThickness || "1px"

  const sizes = getScaledFontSizes(baseFontSize)

  // Dynamic Font sizing variables
  const nameSizeStyle = {
    fontSize: `${
      design.lineSpacing === "extratight" ? Math.round(sizes.base * 1.7) :
      design.lineSpacing === "tight" ? Math.round(sizes.base * 2.0) :
      Math.round(sizes.base * 2.3)
    }px`,
    color: primaryColor
  }
  const sectionTitleSizeStyle = {
    fontSize: `${
      design.lineSpacing === "extratight" ? Math.round(sizes.base * 0.95 * 10) / 10 :
      Math.round(sizes.base * 1.1 * 10) / 10
    }px`,
    color: primaryColor
  }
  const itemTitleSizeStyle = {
    fontSize: `${
      design.lineSpacing === "extratight" ? Math.round(sizes.base * 0.95 * 10) / 10 :
      Math.round(sizes.base * 1.05 * 10) / 10
    }px`
  }
  const subtitleSizeStyle = {
    fontSize: `${
      design.lineSpacing === "extratight" ? Math.round(sizes.base * 0.85 * 10) / 10 :
      Math.round(sizes.base * 0.95 * 10) / 10
    }px`
  }

  // Generate contact items list
  const contactLinks = []
  if (personalInfo.phone && personalInfo.showPhone !== false) {
    contactLinks.push(
      <span key="phone" className="inline-flex items-center gap-1">
        <Phone className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
        <span>{personalInfo.phone}</span>
      </span>
    )
  }
  if (personalInfo.email && personalInfo.showEmail !== false) {
    contactLinks.push(
      <a key="email" href={`mailto:${personalInfo.email}`} className="inline-flex items-center gap-1 hover:underline underline">
        <Mail className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
        <span>{personalInfo.email}</span>
      </a>
    )
  }
  if (personalInfo.linkedIn && personalInfo.showLinkedIn !== false) {
    contactLinks.push(
      <a key="linkedin" href={personalInfo.linkedIn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline underline">
        <Linkedin className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
        <span>Linkedin</span>
      </a>
    )
  }
  if (personalInfo.github && personalInfo.showGitHub !== false) {
    contactLinks.push(
      <a key="github" href={personalInfo.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline underline">
        <Github className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
        <span>Github</span>
      </a>
    )
  }
  if (personalInfo.portfolio && personalInfo.showPortfolio !== false) {
    contactLinks.push(
      <a key="portfolio" href={personalInfo.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline underline">
        <Code className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
        <span>LeetCode</span>
      </a>
    )
  }
  if (personalInfo.website && personalInfo.showWebsite !== false) {
    contactLinks.push(
      <a key="website" href={personalInfo.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline underline">
        <LinkIcon className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
        <span>GeeksforGeeks</span>
      </a>
    )
  }

  const rootStyle = {
    fontSize: `${sizes.base}px`,
    fontFamily: fontStyleFamily,
    '--primary': primaryColor,
  } as React.CSSProperties

  return (
    <>
      {selectedImport && (
        <link rel="stylesheet" href={selectedImport} />
      )}
      <div 
        className={`${marginPaddingClass} bg-white text-black shadow-sm rounded-lg min-h-[1050px] w-full max-w-[800px] mx-auto ${leadingClass}`}
        style={rootStyle}
      >
        {/* Title Header */}
        <div className={`${alignClass} ${headerMarginBottom}`}>
          <h1 className={`${headingStyleClass}`} style={nameSizeStyle}>
            {personalInfo.fullName || "Your Name"}
          </h1>
          {personalInfo.headline && (
            <p className="text-slate-700 italic mt-0.5" style={subtitleSizeStyle}>{personalInfo.headline}</p>
          )}
          {/* Contact Links Row */}
          <div className={`flex flex-wrap ${justifyClass} items-center gap-x-2.5 gap-y-0.5 ${design.lineSpacing === "extratight" ? "mt-0.5" : "mt-1.5"} font-medium text-black`} style={subtitleSizeStyle}>
            {contactLinks.map((link, idx) => (
              <React.Fragment key={idx}>
                {link}
                {idx < contactLinks.length - 1 && <span className="text-slate-300 select-none">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Summary Section (if visible) */}
        {summary.visible !== false && summary.text && (
          <div className={spaceBetweenSections}>
            <div className={`flex flex-col ${sectionHeaderMarginBottom} ${isCenteredHeader ? "items-center" : "items-start"}`}>
              <h3 className={`${headingStyleClass} w-full ${isCenteredHeader ? "text-center" : "text-left"}`} style={sectionTitleSizeStyle}>
                {summary.title || "Professional Summary"}
              </h3>
              {showDivider && (
                <div className="w-full mt-[1px]" style={{ backgroundColor: primaryColor, height: thickness }} />
              )}
            </div>
            <p className="text-slate-955 leading-normal text-justify" style={sizes.textNormal}>
              {summary.text}
            </p>
          </div>
        )}

        {/* Dynamic Sections */}
        {sectionOrder.map((sectionId: string) => {
          const section = resumeJson[sectionId]
          if (!section || section.visible === false) return null
          if (sectionId === "personalInfo" || sectionId === "summary") return null

          const isRepeatable = section.repeatable || [
            "education",
            "experience",
            "projects",
            "certificates",
            "codingProfiles",
            "languages",
            "references",
            "publications",
            "awards",
            "volunteerWork"
          ].includes(sectionId)

          return (
            <div key={sectionId} className={spaceBetweenSections}>
              {/* Section Header Divider */}
              <div className={`flex flex-col ${sectionHeaderMarginBottom} ${isCenteredHeader ? "items-center" : "items-start"}`}>
                <h3 className={`${headingStyleClass} w-full ${isCenteredHeader ? "text-center" : "text-left"}`} style={sectionTitleSizeStyle}>
                  {section.title || sectionId.replace(/([A-Z])/g, " $1")}
                </h3>
                {showDivider && (
                  <div className="w-full mt-[1px]" style={{ backgroundColor: primaryColor, height: thickness }} />
                )}
              </div>

              {sectionId === "technicalSkills" ? (
                <div className="leading-tight space-y-0.5 text-black" style={sizes.textXs}>
                  {(section.items || []).map((item: any) => (
                    <div key={item.id}>
                      <span className="font-bold">{item.category}: </span>
                      <span>{item.skills}</span>
                    </div>
                  ))}
                </div>
              ) : isRepeatable ? (
                <div className={spaceBetweenItems}>
                  {(section.items || []).map((item: any) => {
                    // 1. EDUCATION RENDERING
                    if (sectionId === "education") {
                      return (
                        <div key={item.id} className={`leading-normal break-inside-avoid ${itemMarginBottom}`} style={sizes.textXs}>
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-black" style={itemTitleSizeStyle}>{item.institution}</span>
                            <span className="font-bold text-black" style={sizes.textXs}>{item.startDate} {item.endDate ? `– ${item.endDate}` : ""}</span>
                          </div>
                          <div className={`flex justify-between items-baseline ${itemTopMargin}`}>
                            <span className="italic text-slate-900" style={subtitleSizeStyle}>
                              {item.degree}
                              {item.fieldOfStudy ? ` - ${item.fieldOfStudy}` : ""}
                              {item.gpa && (
                                <>
                                  {" - "}
                                  <span className="font-bold not-italic">
                                    {item.gpa.toLowerCase().includes("gpa") || item.gpa.toLowerCase().includes("percentage")
                                      ? item.gpa
                                      : `CGPA - ${item.gpa}`}
                                  </span>
                                </>
                              )}
                            </span>
                            <span className="italic text-slate-900" style={subtitleSizeStyle}>{item.location}</span>
                          </div>
                          {item.description && (
                            <div className="pl-4 text-slate-955 whitespace-pre-line">
                              {renderDescription(item.description, sizes.textXs, design.lineSpacing)}
                            </div>
                          )}
                        </div>
                      )
                    }

                    // 2. EXPERIENCE RENDERING
                    if (sectionId === "experience") {
                      return (
                        <div key={item.id} className={`leading-normal break-inside-avoid ${itemMarginBottom}`} style={sizes.textXs}>
                          {/* Line 1: Role, Company (left) | Dates (right) */}
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-black inline-flex items-center gap-1 flex-wrap" style={itemTitleSizeStyle}>
                              {item.role}, {item.company}
                              {item.url && (
                                <a href={item.url} target="_blank" rel="noreferrer" className="inline-block align-middle hover:text-primary">
                                  <LinkIcon className="h-3 w-3 shrink-0" style={{ color: primaryColor }} />
                                </a>
                              )}
                            </span>
                            <span className="font-bold text-black" style={sizes.textXs}>{item.startDate} {item.endDate ? `– ${item.endDate}` : ""}</span>
                          </div>

                          {/* Line 2: Company Subheading (left) | Location (right) */}
                          <div className={`flex justify-between items-baseline ${itemTopMargin}`}>
                            <span className="italic text-slate-900" style={subtitleSizeStyle}>{item.companySub || ""}</span>
                            <span className="italic text-slate-900" style={subtitleSizeStyle}>{item.location}</span>
                          </div>

                          {/* Line 3+: Bullet points description */}
                          {item.description && renderDescription(item.description, sizes.textXs, design.lineSpacing)}
                        </div>
                      )
                    }

                    // 3. PROJECTS RENDERING
                    if (sectionId === "projects") {
                      return (
                        <div key={item.id} className={`leading-normal break-inside-avoid ${itemMarginBottom}`} style={sizes.textXs}>
                          <div className="flex justify-between items-baseline">
                            <span style={sizes.textXs}>
                              <span className="font-bold text-black" style={itemTitleSizeStyle}>{item.name}</span>
                              {item.role && <span className="font-medium text-slate-900"> – {item.role}</span>}
                              {item.url && (
                                <a href={item.url} target="_blank" rel="noreferrer" className="inline-block align-middle ml-1 hover:text-primary">
                                  <LinkIcon className="h-3 w-3 shrink-0 inline" style={{ color: primaryColor }} />
                                </a>
                              )}
                              {item.technologies && (
                                <span className="text-slate-900 font-normal" style={subtitleSizeStyle}>
                                  <span className="mx-1 select-none">|</span>
                                  <span className="italic">{item.technologies}</span>
                                </span>
                              )}
                            </span>
                            <span className="font-bold text-black" style={sizes.textXs}>{item.startDate} {item.endDate ? `– ${item.endDate}` : ""}</span>
                          </div>
                          {item.description && renderDescription(item.description, sizes.textXs, design.lineSpacing)}
                        </div>
                      )
                    }

                    // 4. CERTIFICATES / CERTIFICATIONS RENDERING
                    if (sectionId === "certificates") {
                      return (
                        <div key={item.id} className="leading-tight font-normal break-inside-avoid" style={sizes.textXs}>
                          <div className="flex justify-between items-baseline w-full">
                            <span>
                              <span className="font-bold text-black">• {item.name}</span>
                              {item.issuer && <span> — {item.issuer}</span>}
                              {item.url && (
                                <a href={item.url} target="_blank" rel="noreferrer" className="inline-block align-middle ml-1 hover:text-primary">
                                  <LinkIcon className="h-3 w-3 shrink-0 inline" style={{ color: primaryColor }} />
                                </a>
                              )}
                            </span>
                            <span className="font-bold text-black shrink-0 text-right">{item.date}</span>
                          </div>
                        </div>
                      )
                    }

                    // 5. CODING PLATFORMS / PROFILES RENDERING
                    if (sectionId === "codingProfiles") {
                      const hasSolved = item.username.toLowerCase().includes("solved") || item.platform.toLowerCase().includes("solved")
                      return (
                        <div key={item.id} className="leading-tight flex items-center break-inside-avoid" style={sizes.textXs}>
                          <span className="mr-2">•</span>
                          <span>
                            {hasSolved ? (
                              <span>
                                {parseBoldText(item.username || item.platform)}
                              </span>
                            ) : (
                              <span>
                                <span className="font-bold text-black">{item.platform}:</span> {item.username}
                              </span>
                            )}
                            {item.url && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="inline-block align-middle ml-1 hover:text-primary">
                                <LinkIcon className="h-3 w-3 shrink-0 inline" style={{ color: primaryColor }} />
                              </a>
                            )}
                          </span>
                        </div>
                      )
                    }

                    // General fallback for other repeatable sections
                    return (
                      <div key={item.id} className={`leading-normal break-inside-avoid ${itemMarginBottom}`} style={sizes.textXs}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-black" style={itemTitleSizeStyle}>
                            {item.company || item.institution || item.name || item.title || item.organization || item.platform}
                          </span>
                          <span className="font-semibold text-black">
                            {item.startDate} {item.endDate ? ` - ${item.endDate}` : ""} {item.date || ""}
                          </span>
                        </div>
                        {item.role && <p className="italic text-slate-800" style={subtitleSizeStyle}>{item.role}</p>}
                        {item.description && renderDescription(item.description, sizes.textXs, design.lineSpacing)}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Non-repeatable sections fallback */
                <div className="leading-tight space-y-0.5" style={sizes.textXs}>
                  <div>
                    {section.skills && <p>{section.skills}</p>}
                    {section.items && !Array.isArray(section.items) && <p>{section.items}</p>}
                    {Object.entries(section).map(([k, v]) => {
                      if (k === "visible" || k === "title" || k === "repeatable" || k === "custom" || k === "fields" || k === "items") return null
                      return (
                        <span key={k} className="inline-block mr-4">
                          <span className="font-bold capitalize">{k.replace(/([A-Z])/g, " $1")}:</span> <span>{String(v)}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ----------------------------------------------------
// DYNAMIC COMPILER SELECTOR
// ----------------------------------------------------
export function ResumeTemplateSelector({ resumeJson, templateId }: { resumeJson: Record<string, any>; templateId: string }) {
  switch (templateId) {
    case "classic":
      return <ClassicTemplate resumeJson={resumeJson} />
    case "professional":
      return <ProfessionalTemplate resumeJson={resumeJson} />
    case "developer":
      return <DeveloperTemplate resumeJson={resumeJson} />
    case "minimal":
      return <MinimalTemplate resumeJson={resumeJson} />
    case "modern":
    default:
      return <ModernTemplate resumeJson={resumeJson} />
  }
}
