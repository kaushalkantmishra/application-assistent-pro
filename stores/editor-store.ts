import { create } from "zustand"

interface EditorState {
  activeSectionId: string
  panelSizes: number[] // Sizes of [Left panel, Center panel, Right panel]
  expandedItems: Record<string, boolean> // Record of itemId -> boolean
  spellCheckEnabled: boolean
  zoomLevel: number // Zoom percentage for live preview, e.g. 100
  
  // Actions
  setActiveSectionId: (sectionId: string) => void
  setPanelSizes: (sizes: number[]) => void
  toggleItemExpanded: (itemId: string) => void
  setItemExpanded: (itemId: string, expanded: boolean) => void
  toggleSpellCheck: () => void
  setZoomLevel: (level: number) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  activeSectionId: "personalInfo",
  panelSizes: [20, 45, 35],
  expandedItems: {},
  spellCheckEnabled: true,
  zoomLevel: 90,

  setActiveSectionId: (sectionId) => set({ activeSectionId: sectionId }),
  
  setPanelSizes: (sizes) => set({ panelSizes: sizes }),
  
  toggleItemExpanded: (itemId) => set((state) => ({
    expandedItems: {
      ...state.expandedItems,
      [itemId]: !state.expandedItems[itemId],
    }
  })),

  setItemExpanded: (itemId, expanded) => set((state) => ({
    expandedItems: {
      ...state.expandedItems,
      [itemId]: expanded,
    }
  })),

  toggleSpellCheck: () => set((state) => ({ spellCheckEnabled: !state.spellCheckEnabled })),

  setZoomLevel: (level) => set({ zoomLevel: level }),
}))
