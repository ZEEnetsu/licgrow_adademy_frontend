import { div, p } from "framer-motion/client";
import api from "../../../hooks/request";
import { useState } from "react";
import { useEffect } from "react";

const ViewAllTest = () => {
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Create an async function inside the effect
    const fetchTests = async () => {
      try {
        setLoading(true);
        // Await halts execution until the server successfully responds
        const res = await api.get("/admin/tests");
        console.log(res);

        // Match the exact nesting from your screenshot: res.data.data.tests
        if (res.data && res.data) {
          setTestData(res.data.tests);
        }
      } catch (error) {
        console.error("Failed to fetch tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  return (
    <div>
      {testData.map((item, idx) => {
        return <div key={idx} className="flex gap-4">
          <p>{item.title}</p>
          <p>{item.description}</p>
          <p>{item.durationMinutes}</p>
          <p>{item.totalMarks}</p>
        </div>;
      })}
    </div>
  );
};

export default ViewAllTest;
