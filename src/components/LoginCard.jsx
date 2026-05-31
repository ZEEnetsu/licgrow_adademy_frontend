const LoginCard = ({ title, des }) => {
  return (
    <div className="bg-black/25 p-5 border border-zinc-100/10 backdrop-blur-20 h-[25vh] rounded-md">
      <h1 className="text-xl text-zinc-300">{title}</h1>
      <p>{des}</p>
    </div>
  );
};

export default LoginCard;
