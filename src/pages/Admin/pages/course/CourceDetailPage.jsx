import { useParams, useNavigate } from "react-router-dom";
import { course_data } from "../../../../mockData.js";
import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import { div, object } from "framer-motion/client";
import CourseDropdown from "../../components/CourseDropdown.jsx";
import CourseDetailHeader from "../../components/CourseDetailHeader.jsx";
import Heading from "../../components/Heading.jsx";

const CourceDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const structuralKey = `course${courseId}`;
  const targetCourse = course_data[structuralKey];

  if (!targetCourse) {
    return (
      <div className="p-5">
        <p className="text-red-500">Course not found!</p>
        <button
          onClick={() => navigate("/admin/manage-course")}
          className="mt-3 text-blue-500 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-2">
      <button
        onClick={() => navigate("/admin/manage-course")}
        className="mb-4 px-4 py-2 bg-surface-elevated hover:bg-surface-elevated-hover rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        ← Back to Courses
      </button>
      <CourseDetailHeader
        thumbnail={targetCourse.thumbnail}
        title={targetCourse.title}
        des={targetCourse.des}
        totalEnrolled={targetCourse.totalEnrolled}
        instructor={targetCourse.instructor}
        duration={targetCourse.duration}
        language={targetCourse.language}
      />
      <div>
        <h1 className="text-3xl font-semibold border-l-8 border-blue-500 px-4 mt-7 ">Course Structure</h1>
      </div>
      <CourseDropdown data={targetCourse.course_content} />
    </div>
  );
};

export default CourceDetailPage;
