import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCheckEnrollmentStatusQuery } from '../store/apiSlice.js';
import { Card } from '../components/shared';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { data, isFetching } = useCheckEnrollmentStatusQuery(undefined, {
    pollingInterval: 5000,
    refetchOnFocus: true,
  });

  useEffect(() => {
    if (data?.enrollment_status === 'APPROVED') {
      navigate('/dashboard', { replace: true });
    }
  }, [data, navigate]);

  return (
    <div className="mx-auto max-w-lg py-10">
      <Card variant="surface" padding="lg" className="text-center">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-sm border border-indigo-500/35 bg-indigo-500/10">
          <span className="relative inline-flex h-3 w-3 rounded-sm bg-indigo-400">
            <span className="absolute inset-0 animate-ping rounded-sm bg-indigo-400/50" />
          </span>
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Compliance review in flight
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
          Your LIC identifier is cross-checked against authoritative registers.
          Dashboard ingress unlocks automatically upon approval — manual refresh
          unnecessary.
        </p>

        <ol className="mx-auto mt-10 max-w-xs space-y-4 border-t border-slate-800 pt-8 text-left text-sm text-slate-400">
          <Step done label="Identity provisioned" />
          <Step done label="Cohort + code transmitted" />
          <Step
            label="Administrator attestation"
            sub={isFetching ? 'Polling regulatory queue…' : 'Awaiting verdict'}
            active
          />
          <Step label="Dashboard unlock" />
        </ol>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-600">
          Telemetry refresh / 5s cadence
        </p>
      </Card>
    </div>
  );
};

const Step = ({ label, sub, done, active }) => (
  <li className="flex gap-3">
    <span
      className={[
        'mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-sm border text-[10px] font-bold',
        done
          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
          : active
            ? 'animate-pulse border-indigo-500/50 bg-indigo-500/15 text-indigo-200'
            : 'border-slate-700 bg-slate-900 text-slate-600',
      ].join(' ')}
    >
      {done ? '✓' : ''}
    </span>
    <span>
      <span className={done || active ? 'text-slate-200' : 'text-slate-500'}>
        {label}
      </span>
      {sub && <span className="mt-0.5 block text-[11px] text-slate-500">{sub}</span>}
    </span>
  </li>
);

export default PendingApproval;
