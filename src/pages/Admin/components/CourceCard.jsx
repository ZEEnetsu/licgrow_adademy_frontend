import { NavLink } from "react-router-dom";
import Btn from "./Btn";

const CourceCard = ({
  id,
  title,
  description,
  thumbnail,
  duration,
  language,
  instructor,
}) => {
  return (
    <div className="max-w-70 max-h-100 flex flex-col justify-between rounded-t-md overflow-hidden">
      <img src={thumbnail} alt={thumbnail} className="max-h-45 rounded-t-md" />
      <div className="px-2 py-4 text-sm">
        <div>
          <p className="font-semibold text-md text-text-primary">{title}</p>
          <p className="text-text-secondary">{description}...</p>
        </div>
        <div className="text-zinc-400 mt-2">
          <p>
            {" "}
            <span>duration : </span>
            {duration}
          </p>
          <p> instructor : {instructor}</p>
        </div>
      </div>
      <NavLink to={`${id}`} className={`px-3 py-1.5 bg-surface-elevated hover:bg-surface-elevated-hover text-primary
         text-center rounded-b-md`}>Detail</NavLink>
      {/* <Btn title={"Detail"} variant="secondary" /> */}
    </div>
  );
};

export default CourceCard;
