import api from "../../../hooks/request";
import { useState } from "react";
import useApiCall from "../../../hooks/useApiCall";
import DashboardCompLayout from "../../../layouts/DashboardCompLayout";
import { NavLink, useParams } from "react-router-dom";
import { p } from "framer-motion/client";
const TestDetail = () => {

  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const { data, loading, error } = useApiCall(`/admin/tests/${testId}`);

  if (loading) {
    return (
      <DashboardCompLayout>
        <div className="text-zinc-400 p-6">Loading tests...</div>
      </DashboardCompLayout>
    );
  }

  if (error) {
    return (
      <DashboardCompLayout>
        <div className="text-red-400 p-6">Failed to load tests Detail</div>
      </DashboardCompLayout>
    );
  }

  console.log(data);
  return (
    <div>
        <div>
          <DashboardCompLayout>
            <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-4">
              <p className="text-2xl">{data.title}</p>
              <p className="tezt-xs text-zinc-500">
                {String(data.testId).slice(0, 8)}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex gap-2 items-center">
                <p className="">Duration</p>
                <p className="">{data.durationMinutes}</p>
              </div>
              <div className="flex gap-2 items-center">
                <p className="">Total Marks</p>
                <p className="">{data.totalMarks}</p>
              </div>
            </div>
          </div>
          </DashboardCompLayout>
          <div>
            {data.questions.map((q, idx) => {
              return (
                <div key={q.questionId}>
                  <p>
                    {idx + 1}. {q.questionStatement}
                  </p>
                  <div className="grid grid-cols-2">
                    {q.options.map((opt, idx) => {
                      return (
                        <div key={opt.optionId}>
                          {idx + 1}. {opt.optionStatement}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      <DashboardCompLayout>
        <NavLink>Add </NavLink>
      </DashboardCompLayout>
    </div>
  );
};

export default TestDetail;
