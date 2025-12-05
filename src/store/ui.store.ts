import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UiState = {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: 'ui-preferences',
    },
  ),
)

// ✅ Performance optimization: Selective subscriptions
// Components only re-render when their specific slice changes
export const useIsSidebarOpen = () => useUiStore((state) => state.isSidebarOpen)
export const useToggleSidebar = () => useUiStore((state) => state.toggleSidebar)
export const useOpenSidebar = () => useUiStore((state) => state.openSidebar)
export const useCloseSidebar = () => useUiStore((state) => state.closeSidebar)
