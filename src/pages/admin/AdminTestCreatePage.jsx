import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  formatMutationError,
  useGetAdminCoursesQuery,
  usePostAdminTestMutation,
} from '../../store/api/index.js';
import AdminDeskLayout from './AdminDeskLayout.jsx';
import { transitionHover } from '../dashboard/styles.js';

function utcLocalInputDefaults() {
  const from = new Date();
  from.setMinutes(from.getMinutes() - from.getTimezoneOffset());
  const until = new Date(from.getTime() + 72 * 60 * 60 * 1000);
  until.setMinutes(until.getMinutes() - until.getTimezoneOffset());
  return { from: from.toISOString().slice(0, 16), until: until.toISOString().slice(0, 16) };
}

export default function AdminTestCreatePage() {
  const navigate = useNavigate();
  const defaults = useMemo(() => utcLocalInputDefaults(), []);

  const { data: courses = [], isLoading: coursesLoading } = useGetAdminCoursesQuery({
    page: 1,
    limit: 200,
  });
  const [postTest, postState] = usePostAdminTestMutation();

  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalMarks, setTotalMarks] = useState(25);
  const [passingMarks, setPassingMarks] = useState(15);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [allowReattempt, setAllowReattempt] = useState(true);
  const [cooldownMinutes, setCooldownMinutes] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState('');
  const [availableFrom, setAvailableFrom] = useState(defaults.from);
  const [availableUntil, setAvailableUntil] = useState(defaults.until);
  const [errorText, setErrorText] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorText(null);
    if (!courseId) {
      setErrorText('Select a course.');
      return;
    }
    try {
      const body = {
        courseId,
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        shuffleQuestions,
        allowReattempt,
        cooldownMinutes: cooldownMinutes === '' ? 0 : Number(cooldownMinutes),
        maxAttempts: maxAttempts === '' ? null : Number(maxAttempts),
        availableFrom: new Date(availableFrom).toISOString(),
        availableUntil: new Date(availableUntil).toISOString(),
      };
      const data = await postTest(body).unwrap();
      const newId = data?.testId ?? data?.test_id;
      if (newId)
        navigate(`/dashboard/admin/tests/${newId}/build`, { replace: true });
      else navigate('/dashboard/admin/tests');
    } catch (err) {
      setErrorText(formatMutationError(err));
    }
  };

  return (
    <AdminDeskLayout
      welcomeTitle="Mock tests"
      tagline="Link each mock to a cohort, then open the builder to attach MCQs."
      primaryCta={{ href: '/dashboard/admin/tests', label: 'All tests' }}
    >
    <div className="mx-auto max-w-3xl">
      <Link
        to="/dashboard/admin"
        className={`inline-flex text-sm text-[#64748B] ${transitionHover} hover:text-[#CBD5E1]`}
      >
        ← Admin overview
      </Link>
      <Link
        to="/dashboard/admin/tests"
        className={`ml-4 inline-flex text-sm text-[#64748B] ${transitionHover} hover:text-[#CBD5E1]`}
      >
        Tests list →
      </Link>

      <h1 className="mt-6 text-[clamp(1.5rem,4vw,1.875rem)] font-bold tracking-tight text-[#F1F5F9]">
        Create draft test
      </h1>
      <p className="mt-2 text-sm text-[#64748B]">
        Creates a draft (POST `/admin/tests`). Questions are attached in the builder next.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-5 rounded-[16px] border border-white/[0.06] bg-[#111827] p-6"
      >
        {errorText ? (
          <p className="rounded-md border border-rose-500/30 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
            {errorText}
          </p>
        ) : null}

        <label className="block text-sm font-medium text-[#CBD5E1]">
          Course
          <select
            required
            value={courseId}
            disabled={coursesLoading}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
          >
            <option value="">
              {coursesLoading ? 'Loading your courses…' : 'Select course'}
            </option>
            {courses.map((c) => {
              const id = c.courseId ?? c.course_id;
              const label = c.title ?? c.name ?? id;
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block text-sm font-medium text-[#CBD5E1]">
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
          />
        </label>

        <label className="block text-sm font-medium text-[#CBD5E1]">
          Description
          <textarea
            value={description}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-[#CBD5E1]">
            Duration (min)
            <input
              type="number"
              min={1}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 tabular-nums text-[#F1F5F9]"
            />
          </label>
          <label className="block text-sm font-medium text-[#CBD5E1]">
            Total marks
            <input
              type="number"
              min={1}
              required
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 tabular-nums text-[#F1F5F9]"
            />
          </label>
          <label className="block text-sm font-medium text-[#CBD5E1]">
            Passing marks
            <input
              type="number"
              min={1}
              required
              value={passingMarks}
              onChange={(e) => setPassingMarks(Number(e.target.value))}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 tabular-nums text-[#F1F5F9]"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-[#CBD5E1]">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
            />
            Shuffle questions
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={allowReattempt}
              onChange={(e) => setAllowReattempt(e.target.checked)}
            />
            Allow reattempt
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#CBD5E1]">
            Cooldown (minutes)
            <input
              type="number"
              min={0}
              value={cooldownMinutes}
              onChange={(e) => setCooldownMinutes(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9]"
            />
          </label>
          <label className="block text-sm font-medium text-[#CBD5E1]">
            Max attempts (blank = unlimited)
            <input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="∞"
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9]"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[#CBD5E1]">
            Available from
            <input
              type="datetime-local"
              required
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9]"
            />
          </label>
          <label className="block text-sm font-medium text-[#CBD5E1]">
            Available until
            <input
              type="datetime-local"
              required
              value={availableUntil}
              onChange={(e) => setAvailableUntil(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={postState.isLoading}
          className={`w-full rounded-[12px] border border-[rgba(46,191,138,0.4)] bg-[#161F2E] py-3 text-sm font-semibold text-[#2EBF8A] disabled:opacity-50 ${transitionHover}`}
        >
          {postState.isLoading ? 'Creating…' : 'Continue to builder'}
        </button>
      </form>
    </div>
    </AdminDeskLayout>
  );
}
