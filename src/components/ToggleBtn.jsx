import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, selectTheme } from "../app/features/theme.slice.js";

/**
 * Theme switch.
 *
 * Was a `div` with an `onClick`: no keyboard, no announced state, and a track
 * painted in fixed `zinc-*` that stayed dark under the light theme. It is a
 * real `role="switch"` button now, built from tokens, so it reads correctly in
 * both themes and can be reached with Tab.
 */
const ToggleBtn = () => {
  const dispatch = useDispatch();
  const mode = useSelector(selectTheme);
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={() => dispatch(toggleTheme())}
      className={`outline-none shrink-0 cursor-pointer w-9 h-5 rounded-full p-0.5 flex items-center
        border border-border transition-colors duration-300
        focus:outline-none
        ${isDark ? "bg-accent/25" : "bg-accent/40"}`}
    >
      <span
        aria-hidden
        className={`h-3.5 w-3.5 rounded-full transition-transform duration-300
          ${isDark ? "translate-x-4 bg-accent" : "translate-x-0 bg-text-muted"}`}
      />
    </button>
  );
};

export default ToggleBtn;
