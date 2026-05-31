import { NavLink } from "react-router-dom";
const Link = ({ name, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        ` py-3 px-3 ${
          isActive
            ? "bg-gradient-to-b from-transparent to-green-600/20 text-zinc-100"
            : ""
        }`
      }
    >
      {name}
    </NavLink>
  );
};
export default Link;
