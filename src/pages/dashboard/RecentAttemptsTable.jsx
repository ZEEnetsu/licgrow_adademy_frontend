import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { formatDateLong } from './formatters.js';
import { shadow, EASE, transitionHover } from './styles.js';

export default function RecentAttemptsTable({ attempts }) {
  const panel = `rounded-[16px] border border-white/[0.05] bg-[#111827] ${shadow.card} ${shadow.cardHover} ${transitionHover} hover:border-white/[0.08] hover:bg-[#161F2E]`;

  return (
    <section className={`${panel} p-5 lg:p-6`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] pb-4">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
          Recent Mock Tests
        </h2>
        <Link
          to="/mock-tests"
          className={`text-[0.75rem] font-semibold text-[#2EBF8A] ${transitionHover} hover:text-[#56CFE1] hover:underline`}
        >
          View All →
        </Link>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-[0.875rem]">
          <thead>
            <tr className="border-b border-white/[0.04] bg-[#161F2E]">
              <th className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Test Name
              </th>
              <th className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Attempt #
              </th>
              <th className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Score
              </th>
              <th className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Percentage
              </th>
              <th className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Result
              </th>
              <th className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Date
              </th>
              <th className="px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((row, i) => (
              <motion.tr
                key={row.attemptId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * i, ease: EASE }}
                className={`border-b border-white/[0.04] bg-[#111827] ${transitionHover} hover:bg-[#161F2E]`}
              >
                <td className="px-4 py-3 font-medium text-[#CBD5E1]">{row.testTitle}</td>
                <td className="px-4 py-3 tabular-nums text-[#64748B]">{row.attemptNumber}</td>
                <td className="px-4 py-3 tabular-nums text-[#F1F5F9]">
                  {row.score}/{row.totalMarks}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${
                      row.passed
                        ? 'border-[#2EBF8A]/20 bg-[#2EBF8A]/10 text-[#2EBF8A]'
                        : 'border-[#F43F5E]/20 bg-[#F43F5E]/10 text-[#F43F5E]'
                    }`}
                  >
                    {Number(row.percentage ?? 0).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      row.passed
                        ? 'border-[#2EBF8A]/20 bg-[#2EBF8A]/10 text-[#2EBF8A]'
                        : 'border-[#F43F5E]/20 bg-[#F43F5E]/10 text-[#F43F5E]'
                    }`}
                  >
                    {row.passed ? 'Passed' : 'Failed'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#64748B]">{formatDateLong(row.submittedAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/mock-tests/${encodeURIComponent(row.testId)}/result?attempt=${encodeURIComponent(row.attemptId)}`}
                    className={`font-semibold text-[#2EBF8A] underline-offset-4 ${transitionHover} hover:text-[#56CFE1] hover:underline`}
                  >
                    View Result
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {attempts.map((row, i) => (
          <motion.li
            key={row.attemptId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * i, ease: EASE }}
            className={`rounded-[16px] border border-white/[0.05] bg-[#111827] p-4 ${shadow.card}`}
          >
            <p className="font-medium text-[#CBD5E1]">{row.testTitle}</p>
            <p className="mt-2 text-[0.75rem] text-[#64748B]">
              Attempt {row.attemptNumber} · {formatDateLong(row.submittedAt)}
            </p>
            <p className="mt-2 tabular-nums text-[#F1F5F9]">
              {row.score}/{row.totalMarks}{' '}
              <span
                className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  row.passed
                    ? 'border-[#2EBF8A]/20 bg-[#2EBF8A]/10 text-[#2EBF8A]'
                    : 'border-[#F43F5E]/20 bg-[#F43F5E]/10 text-[#F43F5E]'
                }`}
              >
                {Number(row.percentage ?? 0).toFixed(1)}%
              </span>
            </p>
            <Link
              to={`/mock-tests/${encodeURIComponent(row.testId)}/result?attempt=${encodeURIComponent(row.attemptId)}`}
              className={`mt-3 inline-flex font-semibold text-[#2EBF8A] ${transitionHover} hover:text-[#56CFE1] hover:underline`}
            >
              View Result
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
