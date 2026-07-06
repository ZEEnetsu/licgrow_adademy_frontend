import { useGetTestsQuery } from "../../../../app/apis/tests.api.js";

const ViewAllTest = () => {
  const { data, isLoading, isError, error } = useGetTestsQuery();
  console.log("Raw RTK query data -> ", data);

  if (isLoading) {
    return <div>Loading Data ...</div>;
  }

  if (isError) {
    console.error("RTK Query Fetch Error:", error);
    return (
      <div className="text-red-400 font-semibold">Error Loading Data X </div>
    );
  };
  const testList = data?.data?.tests || [];
  return (
    <div>
      {testList?.length === 0 ? (
        <p>No tests found.</p>
      ) : (
        testList?.map((item, idx) => (
          <div key={idx} className="flex gap-4 p-2 border-b">
            <p className="font-bold">{item.title}</p>
            <p>{item.description}</p>
            <p>{item.durationMinutes} mins</p>
            <p>{item.totalMarks} Marks</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewAllTest;
