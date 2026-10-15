import { NavLink } from "react-router-dom";
import googleIcon from "../assets/googleIcon.png";
import AuthShell from "../components/auth/AuthShell.jsx";
import LoginCard from "../components/LoginCard.jsx";
import { PORTAL_CARDS } from "../components/auth/portalCards.js";
import LoginForm from "../components/LoginForm.jsx";
import Icon from "../components/ui/Icon.jsx";

const Login = () => (
  <AuthShell
    title="Sign in · licgrow"
    headline="Get Started with Us"
    highlight="Started"
    sub="Complete the login process to get to the Dashboard"
    note="IC-38 · IRDAI exam prep"
    cards={PORTAL_CARDS.map((card, i) => (
      <LoginCard key={card.id} index={i} title={card.title} des={card.des} icon={card.icon} motif={card.motif} />
    ))}
  >
    <div className="rounded-[28px] bg-white p-7 shadow-lift ring-1 ring-ink/[0.06] sm:p-9 short:p-7 tiny:p-6">
      <LoginForm />

      <div className="my-5 flex items-center gap-3 text-xs font-semibold text-plum/50 short:my-4">
        <span className="h-px flex-1 bg-ink/10" />
        or
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      {/*
        No OAuth in the v1 contract — 01-auth.md defines identifier+password
        for all three actors only. Left visible but inert rather than
        implying a sign-in path that doesn't exist.
      */}
      <button
        type="button"
        disabled
        title="Google sign-in isn't part of the v1 API contract"
        className="flex h-12 w-full cursor-not-allowed items-center short:h-11 justify-center gap-2.5 rounded-2xl bg-white text-sm font-semibold text-ink opacity-50 ring-1 ring-ink/10"
      >
        <img src={googleIcon} alt="" className="h-5" />
        Continue with Google
      </button>
    </div>

    <p className="mt-5 text-center text-sm text-plum short:mt-4">
      New here?{" "}
      <NavLink to="/register" className="group inline-flex items-center gap-1 font-semibold text-ember-deep">
        Create an account
        <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.2} />
      </NavLink>
    </p>
  </AuthShell>
);

export default Login;
