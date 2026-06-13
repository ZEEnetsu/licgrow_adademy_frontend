import { div } from "framer-motion/client";

const Heading = ({ title, children }) => {
  return (
    <div className="flex justify-between">
      <h1 className="text-xl text-zinc-300">
      {title}
      </h1>
      <div>{children}</div>
    </div>
  );
};

export default Heading;
