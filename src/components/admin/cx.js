/** Joins class names, dropping falsy parts: `cx("a", busy && "opacity-60")`. */
export const cx = (...parts) => parts.filter(Boolean).join(" ");

export default cx;
