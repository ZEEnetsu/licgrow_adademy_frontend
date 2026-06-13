import { span } from "framer-motion/client";
import LoginIcon from "../assets/login.svg";
import googleIcon from "../assets/googleIcon.png";
import { useState } from "react";
const LoginForm = ({ isSignUp }) => {

  const signupError = {
     passwordNotMatch:'password does not match',
     minLenght:'password should be atleast 8 characters long',
     emailNotFound:'this email does not exist',
     emailAlreadyExists:'Account with this email already exists',
  }
  const loginError = {
    credetialDoesNotMatch:'invalid user credetials'
  }
  const [error , setError] = useState('');

  const handleSignupSubmit = () =>{
     const pass = document.getElementById('create-pass');
     const confPass = document.getElementById('conf-pass');
     if(!(confPass == pass)){
        setError(signupError.passwordNotMatch);     
     }
     if(pass.value.lenght < 8){
       setError(signupError.minLenght);
     }
  }

  return (
    <div className=" px-5 lg:px-10 py-5">
      <h1 className="text-4xl font-semibold text-zinc-300 mx-auto">
        {isSignUp ? `Create your Account - it's free` : "Login -  Dashboard"}
      </h1>
      <p className="text-zinc-500 text-[15px] mt-3">
        Access your Dashboard , track progress and give Mock test and join Live
        Webinar
      </p>

      {isSignUp ? (
        <form action="" className="mt-5"
        onSubmit={handleSignupSubmit}
        >
          <div className="flex flex-col gap-3">
            <label htmlFor="email" className="text-zinc-300">
              Enter your email
            </label>
            <input
              type="text"
              className="px-4 py-3 bg-black/30 outline-none rounded-md"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="password" id='create-pass' className="text-zinc-300">
              Create Password <span className="text-xs text-zinc-600">(min length : 8)</span>
            </label>
            <input
              type="text"
              className="px-4 py-3 bg-black/30 outline-none rounded-md"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="password" id="conf-pass" className="text-zinc-300">
              confirm Password 
            </label>
            <input
              type="text"
              className="px-4 py-3 bg-black/30 outline-none rounded-md"
            />
          </div>
          <input
            type="submit"
            value="Login"
            className="mt-3 px-6 py-3 text-center w-full rounded-md bg-green-900 hover:bg-green-700 cursor-pointer duration-200 transition-all"
          />
        </form>
      ) : (
        <form action="" className="mt-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="email" className="text-zinc-300">
              Your Email
            </label>
            <input
              type="text"
              className="px-4 py-3 bg-black/30 outline-none rounded-md"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="password" className="text-zinc-300">
              Password
            </label>
            <input
              type="text"
              className="px-4 py-3 bg-black/30 outline-none rounded-md"
            />
          </div>

          <input
            type="submit"
            value="Login"
            className="mt-3 px-6 py-3 text-center w-full rounded-md bg-green-900 hover:bg-green-700 cursor-pointer duration-200 transition-all"
          />
        </form>
      )}
    </div>
  );
};

export default LoginForm;
