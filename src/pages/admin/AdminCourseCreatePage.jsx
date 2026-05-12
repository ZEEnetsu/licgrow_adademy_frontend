import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { formatMutationError, usePostAdminCourseMutation } from '../../store/api/index.js';
import AdminDeskLayout from './AdminDeskLayout.jsx';
import { transitionHover } from '../dashboard/styles.js';

export default function AdminCourseCreatePage() {
  const navigate = useNavigate();
  const [postCourse, postState] = usePostAdminCourseMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examTarget, setExamTarget] = useState('IRDAI iC-38');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorText, setErrorText] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorText(null);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        examTarget: examTarget.trim(),
        startDate,
        endDate,
      };
      await postCourse(body).unwrap();
      navigate('/dashboard/admin/courses', { replace: false });
    } catch (err) {
      setErrorText(formatMutationError(err));
    }
  };

  return (
    <AdminDeskLayout
      welcomeTitle="Courses"
      tagline="Creates a draft course via POST /admin/courses. Publish later from the courses list."
      primaryCta={{ href: '/dashboard/admin/courses', label: 'View courses' }}
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard/admin"
          className={`inline-flex text-sm text-[#64748B] ${transitionHover} hover:text-[#CBD5E1]`}
        >
          ← Admin overview
        </Link>

        <h1 className="mt-6 text-[clamp(1.5rem,4vw,1.875rem)] font-bold tracking-tight text-[#F1F5F9]">
          Create course
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">Maps to APIdocs `POST /api/v1/admin/courses`.</p>

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
            Title
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="iC-38 Batch May 2026"
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
            />
          </label>

          <label className="block text-sm font-medium text-[#CBD5E1]">
            Description
            <textarea
              required
              value={description}
              rows={4}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
            />
          </label>

          <label className="block text-sm font-medium text-[#CBD5E1]">
            Exam target
            <input
              required
              value={examTarget}
              onChange={(e) => setExamTarget(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#CBD5E1]">
              Start date
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
              />
            </label>
            <label className="block text-sm font-medium text-[#CBD5E1]">
              End date
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-[10px] border border-white/[0.08] bg-[#080C14] px-3 py-2.5 text-[#F1F5F9] outline-none focus:border-[#2EBF8A]/40"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={postState.isLoading}
            className={`w-full rounded-[12px] border border-[rgba(46,191,138,0.4)] bg-[#161F2E] py-3 text-sm font-semibold text-[#2EBF8A] disabled:opacity-50 ${transitionHover}`}
          >
            {postState.isLoading ? 'Creating…' : 'Create draft course'}
          </button>
        </form>
      </div>
    </AdminDeskLayout>
  );
}
