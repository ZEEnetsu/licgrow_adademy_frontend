import { form } from "framer-motion/client";

const DraftTestFrom = () => {
  return (
    <form action="" className="border-green-300 border">
      <div>
        <label htmlFor="title">Test name</label>
        <input type="text" id="title" placeholder="test name" required />
      </div>
      <div>
        <label htmlFor="des">Description</label>
        <input type="text" id="des" placeholder="description" />
      </div>    
    </form>
  );
};

export default DraftTestFrom;
