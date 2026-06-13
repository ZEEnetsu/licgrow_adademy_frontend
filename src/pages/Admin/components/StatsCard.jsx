import { span } from "framer-motion/client";
import more from "../../../assets/more.svg";
import { useState } from "react";
const StatsCard = ({ iconPath, title, value }) => {
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
      className="transition-colors hover:transition-colors duration-300 hover:duration-300 bg-zinc-900/80
    hover:bg-zinc-800
    border border-zinc-100/5 rounded-lg p-3 min-h-40 flex flex-col justify-between relative shadow-sm shadow-zinc-100/15"
    >
      <div className="flex justify-between items-center">
        <img
          src={iconPath}
          alt={iconPath}
          className="bg-zinc-700/50 h-8 p-2 rounded-full"
        />
        <img
          src={more}
          alt=""
          className="h-6 w-6 hover:bg-zinc-800 p-1 rounded-full transition-all duration-300 cursor-pointer"
          onClick={() => {
            setToggleMenu(!toggleMenu);
          }}
        />
        <div
          className={`absolute bottom-0 right-0 border
            rounded-lg border-zinc-800 bg-zinc-900 text-xs flex-col
            ${toggleMenu ? "flex" : "hidden"}
            `}
        >
          <div>
            {comparetoData.map((data) => {
              return (
                <div
                  key={data.id}
                  className="px-2 py-1 hover:bg-zinc-800 cursor-pointer transition-all duration-200"
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
        <p className="">{title}</p>
        <p className="text-3xl text-green-400 font-bold">{value}</p>
        <p className="text-xs text-zinc-500">{compare}</p>
      </div>
    </div>
  );
};

export default StatsCard;
