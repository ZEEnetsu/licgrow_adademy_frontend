import { Link } from "react-router-dom";

/**
 * Compact grid table.
 *
 * Two things were wrong for a shell whose content column now changes width when
 * the drawer opens:
 *
 *  · cells were `whitespace-nowrap` inside `minmax(0, 1fr)` columns, so text
 *    spilled over its neighbour instead of the table scrolling
 *  · every colour was a fixed `zinc-*`, which meant a dark table sitting on a
 *    light page
 *
 * Columns now have a floor width and the table scrolls horizontally inside its
 * own box, so the page itself never scrolls sideways.
 */
const DataTable = ({
  testData = [],
  title,
  borderColor,
  toAllTests = "/admin/tests",
}) => {
  const headers = testData?.length > 0 ? Object.keys(testData[0]) : [];

  const formatHeaderLabel = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  // a floor per column, so narrow viewports scroll rather than crush the text
  const columns = `repeat(${headers.length}, minmax(7rem, 1fr))`;

  return (
    <div className="text-sm text-text-primary">
      <div className={`p-1 border-l-2 mb-3 ${borderColor}`}>
        <span className="ml-2 font-medium">{title}</span>
      </div>

      <div className="w-full rounded-lg overflow-hidden bg-surface-elevated shadow-elevate">
        <div className="overflow-x-auto">
          <div
            style={{ gridTemplateColumns: columns }}
            className="grid bg-bg text-text-muted font-semibold text-xs uppercase tracking-wider"
          >
            {headers.map((item) => (
              <div key={item} className="text-start px-3 py-3 whitespace-nowrap">
                {formatHeaderLabel(item)}
              </div>
            ))}
          </div>

          <div className="divide-y divide-border text-xs">
            {testData.map((row, idx) => (
              <div
                key={row.Id || idx}
                style={{ gridTemplateColumns: columns }}
                className="grid transition-colors duration-150 hover:bg-surface-hover"
              >
                {headers.map((header) => (
                  <div key={header} className="px-3 py-4 truncate">
                    {row[header]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {toAllTests && (
          <Link
            to={toAllTests}
            className="block w-full p-3 bg-bg text-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-200 border-t border-border"
          >
            View all tests
          </Link>
        )}
      </div>
    </div>
  );
};

export default DataTable;
