import {create} from 'zustand';
import {THEMES} from '../constants/index.js'; // Assuming you have a file with theme constants

// Function to apply theme to the document
const applyTheme = (theme) => {
  const html = document.documentElement;
  // Remove all theme classes first
  THEMES.forEach(t => {
    html.classList.remove(`theme-${t}`);
    html.removeAttribute(`data-theme-${t}`);
  });
  // Add the new theme class
  html.setAttribute('data-theme', theme);
  // Force a reflow to ensure the theme is applied
  html.style.display = 'none';
  html.offsetHeight; // no need to store this anywhere, the reference is enough
  html.style.display = '';
};

// Initialize theme from localStorage or default
const initialTheme = localStorage.getItem("theme") || "retro";
applyTheme(initialTheme);
export const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    if (THEMES.includes(theme)) {
      localStorage.setItem("theme", theme);
      applyTheme(theme);
      set({ theme });
    }
  },
}));