import { createSlice } from "@reduxjs/toolkit";

/**
 * Theme state: light or dark, and nothing else.
 *
 * The value is a name, never a colour. It becomes a class on <html>, and every
 * colour downstream resolves from src/styles/theme.css — so no component ever
 * learns which hex it ended up with.
 */

/** Storage throws in some privacy modes; a lost preference is not an error. */
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const getInitialTheme = () => {
  const savedTheme = read("theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: getInitialTheme() },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectTheme = (state) => state.theme.mode;
export default themeSlice.reducer;
