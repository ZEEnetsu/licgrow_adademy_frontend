import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, selectTheme } from "../app/features/theme.slice";
const ToggleBtn = () => {
  const dispatch = useDispatch();
  const mode = useSelector(selectTheme);
  console.log(mode);
  return (
    <div
      className={`cursor-pointer overflow-hidden transition-all duration-300 bg-gradient-to-t from-zinc-800 via-zinc-700 to-zinc-800 w-8 h-4 rounded-xl flex items-center`}
      onClick={() => dispatch(toggleTheme())}
    >
      <div
        className={`
  transition-all duration-300
  ${
    mode === "dark"
      ? "border-2 border-green-400 bg-gradient-to-br from-green-400 to-green-700 translate-x-4"
      : "border-2 border-zinc-500 bg-gradient-to-br from-zinc-600 to-zinc-800 translate-x-0"
  }
  h-[0.9rem] w-[0.9rem] rounded-full shadow-sm shadow-zinc-950`}
      ></div>
    </div>
  );
};

export default ToggleBtn;
