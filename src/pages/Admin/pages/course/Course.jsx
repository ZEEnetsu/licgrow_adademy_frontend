import CourceCard from "../../components/CourceCard";
import { course_data } from "../../../../mockData.js";
import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import { Outlet, useParams } from "react-router-dom";

const Course = () => {

  const { courseId } = useParams();

  return (
    <DashboardCompLayout>
      {courseId ? (
        <Outlet />
      ) : (
        <div className="grid grid-cols-4 gap-3 lg:p-3 xl:p-5">
          {Object.values(course_data).map((courses) => {
            const shotdes = String(courses.des).slice(0, 50);
            return (
              <CourceCard
                key={courses.id}
                id={courses.id}
                title={courses.title}
                description={shotdes}
                thumbnail={courses.thumbnail}
                duration={courses.duration}
                instructor={courses.instructor}
              />
            );
          })}
        </div>
      )}
    </DashboardCompLayout>
  );
};

export default Course;