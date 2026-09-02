/**
 * Decorative icon button. `alt` is intentionally empty — these sit alongside
 * text or are purely ornamental, and the previous `alt={imageURL}` announced a
 * bundled file path to screen readers. Pass `label` when the icon is the only
 * thing conveying meaning.
 */
const Icon = ({ imageURL, label, onClick }) => (
  <img
    src={imageURL}
    alt={label ?? ""}
    role={label ? "img" : "presentation"}
    onClick={onClick}
    className="h-8 w-8 p-2 rounded-full bg-surface-elevated hover:bg-surface-elevated-hover cursor-pointer transition-all duration-200"
  />
);

export default Icon;
