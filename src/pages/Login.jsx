import LoginPageCover from "../assets/loginPageCover.png";
import googleIcon from '../assets/googleIcon.png'

import { NavLink } from "react-router-dom";
import LoginCard from "../components/LoginCard.jsx";
import { title } from "framer-motion/client";
import ShieldMark from "../components/ShieldMark.jsx";
import LoginForm from "../components/LoginForm.jsx";
import { useState } from "react";
const Login = () => {
  const cardData = [
    {
      id: 1,
      title: "Mock test Arena",
      des: "",
    },
    {
      id: 2,
      title: "Live Webinar",
      des: "",
    },
    {
      id: 3,
      title: "Cource Roadmap",
      des: "",
    },
  ];
  const [signUpPage, setSignupPage] = useState(false);
  console.log(signUpPage);
  return (
    <div className="h-screen bg-gradient-to-br from-black via-black/95 to-green-950 text-zinc-100 p-2 grid grid-cols-1 lg:grid lg:grid-cols-2">
      <div
        style={{
          backgroundImage: `url('${LoginPageCover}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="left rounded-xl p-4 items-center justify-between"
      >
        <div className="top text-sm h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-300">
            <ShieldMark/>
            <NavLink to={"/"} className={`hover:text-zinc-400 row-span-1`}>
              {" "}
              <span>{`<`}</span> back home
            </NavLink>
          </div>
          <div className="">
            <h1 className=" mt-10 lg:mt-0 text-5xl font-semibold">Get Started with Us</h1>
            <p className="text-zinc-400/80 mt-2 text-[18px] md:w-1/2">
              Complete the login process to get to the Dashboard
            </p>
            <div className="hidden md:grid grid-cols-3 mt-5 gap-5">
              {cardData.map((card) => {
                return (
                  <LoginCard key={card.id} title={card.title} des={card.des} />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="lg:w-[25em] rounded-xl bg-black/10 flex justify-center flex-cols">
             {
                signUpPage? <LoginForm isSignUp={signUpPage}/> : <LoginForm isSignUp={signUpPage}/>
             }
        </div>
        <div className='grid grid-cols-2 gap-2'>
        <button className='flex items-center gap-2 px-4 py-2 bg-white/90 text-zinc-950 rounded-md mt-3 text-xs font-semibold'>
          <span><img src={googleIcon} alt="" className='h-5' /></span>
          continue with Google
        </button>
        <button className='gap-2 px-4 py-2 bg-white/90 text-zinc-950 rounded-md mt-3 text-xs font-semibold '
        onClick={()=> setSignupPage(!signUpPage)}
        >
          {
            signUpPage?'switch to login':'switch to signup'
          }
        </button>
      </div>
      </div>
    </div>
  );
};

export default Login;
