import { create } from "zustand"

interface AutosaveState {
  status: "idle" | "saving" | "saved" | "error"
  lastSavedAt: Date | null
  
  // Actions
  setStatus: (status: "idle" | "saving" | "saved" | "error") => void
  setLastSavedAt: (date: Date | null) => void
}

export const useAutosaveStore = create<AutosaveState>((set) => ({
  status: "idle",
  lastSavedAt: null,

  setStatus: (status) => set({ status }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
}))
