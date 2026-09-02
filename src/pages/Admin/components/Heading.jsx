const Heading = ({ title, children }) => {
  return (
    <div className="flex justify-between">
      <h1 className="text-xl text-text-primary">
      {title}
      </h1>
      <div>{children}</div>
    </div>
  );
};

export default Heading;
