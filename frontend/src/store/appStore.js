import { create } from "zustand";

export const useAppStore = create((set) => ({
  theme: localStorage.getItem("hkick_theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("hkick_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));
