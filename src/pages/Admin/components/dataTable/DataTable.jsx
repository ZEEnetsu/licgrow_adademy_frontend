import { Link } from "react-router-dom"; // Swapped to Link since NavLink isn't needed here

const DataTable = ({
  testData = [],
  title,
  borderColor,
  toAllTests = "/admin/tests",
}) => {
  const headers = testData?.length > 0 ? Object.keys(testData[0]) : [];

  const formatHeaderLabel = (str) => {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="text-sm text-zinc-300">
      <div className={`p-1 border-l-2 mb-3 mx-1 ${borderColor}`}>
        <span className="ml-2 font-medium">{title}</span>
      </div>

      <div className="w-full border border-zinc-100/10 rounded-lg overflow-hidden bg-zinc-950">
        <div
          style={{
            gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))`,
          }}
          className="grid bg-zinc-800 text-zinc-400 font-semibold text-xs uppercase tracking-wider"
        >
          {headers.map((item) => (
            <div key={item} className="text-start px-3 py-3">
              {formatHeaderLabel(item)}
            </div>
          ))}
        </div>
        <div className="divide-y divide-zinc-100/5 text-xs">
          {testData.map((row, idx) => (
            <div
              key={row.Id || idx}
              style={{
                gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))`,
              }}
              className={`grid transition-colors duration-150 hover:bg-zinc-800/30 ${
                idx % 2 === 0 ? "bg-zinc-900/40" : "bg-transparent"
              }`}
            >
              {headers.map((header) => (
                <div key={header} className="px-3 py-4 whitespace-nowrap">
                  {row[header]}
                </div>
              ))}
            </div>
          ))}
        </div>
        {toAllTests && (
          <Link
            to={toAllTests}
            className="block w-full p-3 bg-zinc-800 text-center text-zinc-400 hover:text-white hover:bg-green-900/40 transition-all duration-200 border-t border-zinc-100/5"
          >
            View all tests
          </Link>
        )}
      </div>
    </div>
  );
};

export default DataTable;
