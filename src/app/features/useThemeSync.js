import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "./theme.slice.js";

export function useThemeSync() {
  const mode = useSelector(selectTheme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
  }, [mode]);
}


