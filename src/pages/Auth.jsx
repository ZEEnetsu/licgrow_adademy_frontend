import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  useLoginMutation,
  useRegisterMutation,
} from '../store/apiSlice.js';
import { Button, Card, Input } from '../components/shared';
import { stagger, fadeUp } from './landing/motion.js';

const Auth = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isRegister = pathname === '/register';

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
  });
  const [regSuccess, setRegSuccess] = useState(null);

  const [login, { isLoading: loggingIn, error: loginError }] = useLoginMutation();
  const [register, { isLoading: registering, error: registerError }] =
    useRegisterMutation();

  const error = loginError || registerError;
  const isSubmitting = loggingIn || registering;

  useEffect(() => {
    setRegSuccess(null);
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      try {
        const payload = await register({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        }).unwrap();
        setRegSuccess({
          username: payload.username,
          temporaryPassword: payload.temporaryPassword,
        });
      } catch {
        /* surfaced via registerError */
      }
    } else {
      await login({ username: form.username, password: form.password });
    }
  };

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-lic-offwhite to-lic-mint/40 pt-[4.5rem]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.06, 0.12)}
        className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20"
      >
        <motion.div variants={fadeUp} className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lic-teal">
            LICPro Academy
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-lic-charcoal lg:text-4xl">
            {isRegister ? 'Create your free account' : 'Welcome back — ready when you are'}
          </h1>
          <p className="mt-4 leading-relaxed text-lic-body">
            {isRegister
              ? 'Two minutes, no card. You’ll pick your track, then we’ll line up your first mock when you’re ready.'
              : 'Pick up where you left off — mocks, live classes, and your dashboard are all saved.'}
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="surface" padding="lg" className="shadow-card">
            <h2 className="text-xl font-semibold text-lic-charcoal">
              {isRegister ? 'Sign up' : 'Log in'}
            </h2>
            <p className="mt-1 text-sm text-lic-body">
              {isRegister
                ? 'We’ll never spam you — promise.'
                : 'Sign in with the username you registered with.'}
            </p>

            {regSuccess && isRegister ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-card border border-lic-teal/35 bg-lic-mint/60 px-4 py-4 shadow-inner shadow-black/[0.02]">
                  <p className="text-sm font-semibold leading-snug text-lic-charcoal">
                    Registration successful! Please save these credentials and use them to log in.
                  </p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-lic-body">
                        Username
                      </dt>
                      <dd className="mt-1 font-mono font-semibold text-lic-charcoal">
                        {regSuccess.username}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-lic-body">
                        Temporary password
                      </dt>
                      <dd className="mt-1 font-mono font-semibold text-lic-charcoal">
                        {regSuccess.temporaryPassword}
                      </dd>
                    </div>
                  </dl>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="hover:scale-[1.02]"
                  onClick={() => navigate('/login')}
                >
                  Proceed to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {isRegister ? (
                  <>
                    <Input
                      label="Full Name"
                      type="text"
                      value={form.fullName}
                      onChange={update('fullName')}
                      required
                      autoComplete="name"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      required
                      autoComplete="email"
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      required
                      placeholder="+91XXXXXXXXXX"
                      autoComplete="tel"
                    />
                  </>
                ) : (
                  <>
                    <Input
                      label="Username"
                      type="text"
                      value={form.username}
                      onChange={update('username')}
                      required
                      placeholder="LIC-XXXXX"
                      autoComplete="username"
                      spellCheck={false}
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={update('password')}
                      required
                      autoComplete="current-password"
                    />
                  </>
                )}

                {error && (
                  <p className="rounded-card border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error?.data?.message || 'Something went wrong. Try again.'}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  className="hover:scale-[1.02]"
                >
                  {isSubmitting
                    ? 'Please wait…'
                    : isRegister
                      ? 'Create free account'
                      : 'Continue'}
                </Button>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-lic-body">
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-lic-teal hover:underline"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  New here?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-lic-teal hover:underline"
                  >
                    Start for free
                  </Link>
                </>
              )}
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
