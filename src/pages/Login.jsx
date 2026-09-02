import { NavLink } from "react-router-dom";

import LoginPageCover from "../assets/loginPageCover.png";
import googleIcon from "../assets/googleIcon.png";
import LoginCard from "../components/LoginCard.jsx";
import ShieldMark from "../components/ShieldMark.jsx";
import LoginForm from "../components/LoginForm.jsx";

const cardData = [
  { id: 1, title: "Mock Test Arena", des: "Full-length IC-38 papers, timed." },
  { id: 2, title: "Live Webinars", des: "Weekly sessions with mentors." },
  { id: 3, title: "Course Roadmap", des: "Structured path to certification." },
];

const Login = () => (
  <div className="min-h-screen bg-linear-to-br from-black via-black/95 to-green-950 text-zinc-100 p-2 grid grid-cols-1 lg:grid-cols-2">
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
          <ShieldMark />
          <NavLink to="/" className="hover:text-zinc-400">
            <span>{"<"}</span> back home
          </NavLink>
        </div>
        <div>
          <h1 className="mt-10 lg:mt-0 text-5xl font-semibold">
            Get Started with Us
          </h1>
          <p className="text-zinc-400/80 mt-2 text-[18px] md:w-1/2">
            Complete the login process to get to the Dashboard
          </p>
          <div className="hidden md:grid grid-cols-3 mt-5 gap-5">
            {cardData.map((card) => (
              <LoginCard key={card.id} title={card.title} des={card.des} />
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md rounded-xl bg-black/10">
        <LoginForm />
      </div>

      <div className="w-full max-w-md px-5 lg:px-10">
        {/*
          No OAuth in the v1 contract — 01-auth.md defines identifier+password
          for all three actors only. Left visible but inert rather than
          implying a sign-in path that doesn't exist.
        */}
        <button
          type="button"
          disabled
          title="Google sign-in isn't part of the v1 API contract"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white/90 text-zinc-950 rounded-md mt-3 text-xs font-semibold opacity-40 cursor-not-allowed"
        >
          <img src={googleIcon} alt="" className="h-5" />
          Continue with Google
        </button>
        <p className="text-zinc-600 text-[11px] mt-3 text-center">
          Learner sign-up needs <code>POST /auth/register</code> (02-learner.md),
          which isn&apos;t built yet.
        </p>
      </div>
    </div>
  </div>
);

export default Login;
