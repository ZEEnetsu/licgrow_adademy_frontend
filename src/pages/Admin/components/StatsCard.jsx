import more from "../../../assets/more.svg";
import { useState } from "react";
const StatsCard = ({ iconPath, title, value, caption }) => {
  const comparetoData = [
    { id: 1, title: "Last month" },
    { id: 2, title: "Last quarter" },
    { id: 3, title: "last half" },
    { id: 4, title: "last year" },
  ];
  const [toggleMenu, setToggleMenu] = useState(false);
  const [compare, setcompare] = useState(comparetoData[0].title);

  return (
    <div
      className="transition-colors duration-300 hover:bg-surface-hover bg-surface
    border border-border rounded-lg p-4 min-h-32 flex flex-col justify-between gap-4 relative"
    >
      <div className="flex justify-between items-center">
        <img
          src={iconPath}
          alt={iconPath}
          className="bg-bg h-8 p-2 rounded-full"
        />
        <img
          src={more}
          alt=""
          className="h-6 w-6 hover:bg-surface-hover p-1 rounded-full transition-all duration-300 cursor-pointer"
          onClick={() => {
            setToggleMenu(!toggleMenu);
          }}
        />
        {/* anchored under its trigger — at `bottom-0` it sat on top of the figure */}
        <div
          className={`absolute top-11 right-3 z-20 border overflow-hidden
            rounded-lg border-border bg-bg shadow-lg text-xs flex-col
            ${toggleMenu ? "flex" : "hidden"}
            `}
        >
          <div>
            {comparetoData.map((data) => {
              return (
                <div
                  key={data.id}
                  className="px-2 py-1 hover:bg-surface cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setcompare(data.title);
                    setToggleMenu(!toggleMenu);
                  }}
                >
                  {data.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-text-primary font-semibold">{title}</p>
        <p className="text-3xl text-accent font-bold">{value}</p>
        <p className="text-xs text-text-muted">{caption ?? compare}</p>
      </div>
    </div>
  );
};

export default StatsCard;
