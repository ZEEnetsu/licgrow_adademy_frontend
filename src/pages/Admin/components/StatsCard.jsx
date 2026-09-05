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
      className="transition-colors duration-300 bg-accent-solid shadow-elevate
     rounded-3xl p-4 min-h-32 flex flex-col justify-between gap-4 relative"
    >
      <div className="flex justify-between items-center">
        <img
          src={iconPath}
          alt={iconPath}
          className="bg-white/15 h-8 p-2 rounded-full"
        />
        <img
          src={more}
          alt=""
          className="h-8 w-8 hover:bg-white/20 p-1 rounded-full transition-all duration-300 cursor-pointer"
          onClick={() => {
            setToggleMenu(!toggleMenu);
          }}
        />
        {/* anchored under its trigger — at `bottom-0` it sat on top of the figure */}
        <div
          className={`py-1 px-1 text-accent-solid-contrast absolute top-13 right-3 z-20 overflow-hidden
            rounded-lg  bg-black/25 shadow-lg text-xs flex-col
            ${toggleMenu ? "flex" : "hidden"}
            `}
        >
          <div>
            {comparetoData.map((data) => {
              return (
                <div
                  key={data.id}
                  className="p-1 hover:bg-white/20 cursor-pointer transition-all duration-200 rounded-md  "
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
      <div className="text-accent-solid-contrast flex flex-col gap-1">
        <p className="font-semibold">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs">{caption ?? compare}</p>
      </div>
    </div>
  );
};

export default StatsCard;
