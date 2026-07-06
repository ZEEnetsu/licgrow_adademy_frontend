import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: {mode: getInitialTheme()},
  reducers: {
    setTheme : (state, action) => {
        state.mode = action.payload;
    },
    toggleTheme : (state) => {
        state.mode  = state.mode  === "light" ? "dark" : "light";
    }
  },
});

export const { toggleTheme , setTheme } = themeSlice.actions;
export const selectTheme  = (state) =>  state.theme.mode;
export default themeSlice.reducer;
