/**
 * Compact test tile. `Id` is a UUID (conventions §1) — only the first segment
 * is shown, which is enough to correlate with logs without dominating the card.
 */
const TestCard = ({ title, iconURL, meta, Id }) => {
  const shortId = Id ? String(Id).slice(0, 8) : null;

  return (
    <div className="flex gap-4 border border-border p-3 rounded-md bg-bg hover:bg-surface-elevated transition-all duration-200 cursor-pointer">
      <img src={iconURL} alt="" className="w-12 shrink-0" />
      <div className="text-[10px] mt-1 flex flex-col justify-between min-w-0">
        {shortId && <span className="text-success font-mono">{shortId}</span>}
        <p className="text-xs text-start line-clamp-2">{title}</p>
        {meta && <span className="text-text-muted">{meta}</span>}
      </div>
    </div>
  );
};

export default TestCard;
