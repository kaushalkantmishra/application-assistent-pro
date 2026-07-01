import { create } from "zustand"
import { getInitialResumeJson } from "@/lib/resume-schemas"

export interface ResumeData {
  id: string
  title: string
  templateId: string
  themeId: string
  isFavorite: boolean
  resumeJson: Record<string, any>
}

interface ResumeState {
  resume: ResumeData | null
  past: Record<string, any>[]
  future: Record<string, any>[]
  
  // Actions
  setResume: (resume: ResumeData) => void
  updateMetadata: (updates: Partial<Omit<ResumeData, "resumeJson">>) => void
  
  // Content Actions
  updateField: (sectionId: string, fieldId: string, value: any) => void
  addRepeatableItem: (sectionId: string, initialItem?: Record<string, any>) => void
  updateRepeatableItem: (sectionId: string, itemId: string, fieldId: string, value: any) => void
  removeRepeatableItem: (sectionId: string, itemId: string) => void
  reorderRepeatableItems: (sectionId: string, startIndex: number, endIndex: number) => void
  
  // Section layout actions
  reorderSections: (startIndex: number, endIndex: number) => void
  toggleSectionVisibility: (sectionId: string) => void
  addCustomSection: (sectionId: string, title: string, fields: any[]) => void
  removeCustomSection: (sectionId: string) => void
  
  // History
  undo: () => void
  redo: () => void
  clearHistory: () => void
}

export const useResumeStore = create<ResumeState>((set, get) => {
  const saveToHistory = (newResumeJson: Record<string, any>) => {
    const { resume, past } = get()
    if (!resume) return
    
    // Limit history stack size to 20
    const newPast = [...past, resume.resumeJson].slice(-20)
    
    set({
      past: newPast,
      future: [],
    })
  }

  return {
    resume: null,
    past: [],
    future: [],

    setResume: (resume) => {
      set({
        resume,
        past: [],
        future: [],
      })
    },

    updateMetadata: (updates) => {
      set((state) => {
        if (!state.resume) return {}
        return {
          resume: {
            ...state.resume,
            ...updates,
          },
        }
      })
    },

    updateField: (sectionId, fieldId, value) => {
      const { resume } = get()
      if (!resume) return

      const updatedResumeJson = {
        ...resume.resumeJson,
        [sectionId]: {
          ...resume.resumeJson[sectionId],
          [fieldId]: value,
        },
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    addRepeatableItem: (sectionId, initialItem = {}) => {
      const { resume } = get()
      if (!resume) return

      const section = resume.resumeJson[sectionId] || { items: [], visible: true }
      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...initialItem,
      }

      const updatedResumeJson = {
        ...resume.resumeJson,
        [sectionId]: {
          ...section,
          items: [...(section.items || []), newItem],
        },
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    updateRepeatableItem: (sectionId, itemId, fieldId, value) => {
      const { resume } = get()
      if (!resume) return

      const section = resume.resumeJson[sectionId]
      if (!section || !section.items) return

      const updatedItems = section.items.map((item: any) => {
        if (item.id === itemId) {
          return { ...item, [fieldId]: value }
        }
        return item
      })

      const updatedResumeJson = {
        ...resume.resumeJson,
        [sectionId]: {
          ...section,
          items: updatedItems,
        },
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    removeRepeatableItem: (sectionId, itemId) => {
      const { resume } = get()
      if (!resume) return

      const section = resume.resumeJson[sectionId]
      if (!section || !section.items) return

      const updatedItems = section.items.filter((item: any) => item.id !== itemId)

      const updatedResumeJson = {
        ...resume.resumeJson,
        [sectionId]: {
          ...section,
          items: updatedItems,
        },
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    reorderRepeatableItems: (sectionId, startIndex, endIndex) => {
      const { resume } = get()
      if (!resume) return

      const section = resume.resumeJson[sectionId]
      if (!section || !section.items) return

      const items = [...section.items]
      const [removed] = items.splice(startIndex, 1)
      items.splice(endIndex, 0, removed)

      const updatedResumeJson = {
        ...resume.resumeJson,
        [sectionId]: {
          ...section,
          items,
        },
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    reorderSections: (startIndex, endIndex) => {
      const { resume } = get()
      if (!resume) return

      const sectionOrder = [...(resume.resumeJson.sectionOrder || [])]
      const [removed] = sectionOrder.splice(startIndex, 1)
      sectionOrder.splice(endIndex, 0, removed)

      const updatedResumeJson = {
        ...resume.resumeJson,
        sectionOrder,
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    toggleSectionVisibility: (sectionId) => {
      const { resume } = get()
      if (!resume) return

      const section = resume.resumeJson[sectionId] || { visible: true }
      const updatedResumeJson = {
        ...resume.resumeJson,
        [sectionId]: {
          ...section,
          visible: !section.visible,
        },
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    addCustomSection: (sectionId, title, fields) => {
      const { resume } = get()
      if (!resume) return

      const updatedResumeJson = {
        ...resume.resumeJson,
        sectionOrder: [...(resume.resumeJson.sectionOrder || []), sectionId],
        [sectionId]: {
          title,
          visible: true,
          repeatable: true,
          custom: true,
          fields,
          items: [],
        },
      }

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    removeCustomSection: (sectionId) => {
      const { resume } = get()
      if (!resume) return

      const sectionOrder = (resume.resumeJson.sectionOrder || []).filter((id: string) => id !== sectionId)
      const updatedResumeJson: Record<string, any> = { ...resume.resumeJson, sectionOrder }
      delete updatedResumeJson[sectionId]

      saveToHistory(updatedResumeJson)

      set({
        resume: {
          ...resume,
          resumeJson: updatedResumeJson,
        },
      })
    },

    undo: () => {
      const { resume, past, future } = get()
      if (!resume || past.length === 0) return

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)
      
      set({
        past: newPast,
        future: [resume.resumeJson, ...future],
        resume: {
          ...resume,
          resumeJson: previous,
        },
      })
    },

    redo: () => {
      const { resume, past, future } = get()
      if (!resume || future.length === 0) return

      const next = future[0]
      const newFuture = future.slice(1)

      set({
        past: [...past, resume.resumeJson],
        future: newFuture,
        resume: {
          ...resume,
          resumeJson: next,
        },
      })
    },

    clearHistory: () => {
      set({
        past: [],
        future: [],
      })
    },
  }
})
