import { useState } from "react";
import { useDraftTestMutation } from "../app/apis/tests.api";

const DraftTestFrom = ({ onClose }) => {
  const [draftData, setDraftData] = useState({
    description: "",
    title: "",
  });

  // FIX 1: Call the hook at the TOP LEVEL. 
  // Grab the trigger function (we'll call it 'draftTest') and the status object.
  const [draftTest, { isLoading, error, isSuccess }] = useDraftTestMutation();

  const fields = [
    { id: "title", label: "Test Name", type: "text", placeholder: "Physics" },
    { id: "description", label: "Description", type: "text", placeholder: "Description" },
  ];

  const handleChange = (e) => {
    setDraftData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const responseData = await draftTest(draftData).unwrap();
      
      console.log("Successfully created draft:", responseData);
      
    } catch (err) {
      console.error("Failed to create draft test:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="grid grid-cols-1 gap-3">
        {fields.map((field) => (
          <div className="flex items-baseline gap-3" key={field.id}>
            <label
              className="text-sm text-zinc-300 w-24 shrink-0"
              htmlFor={field.id}
            >
              {field.label}
            </label>
            <input
              className="flex-1 text-sm py-1 px-3 bg-zinc-800 text-zinc-400 rounded-md outline-none"
              type={field.type}
              id={field.id}
              placeholder={field.placeholder}
              value={draftData[field.id]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
      </div>

      {/* FIX 3: You had this commented out. Now that we extracted 'error' from the hook, it will work perfectly! */}
      {error && <p className="text-red-400 text-xs mt-2">Error creating test</p>}
      {isSuccess && <p className="text-green-400 text-xs mt-2 font-semibold">draft created Successfully</p>}

      <input
        type="submit"
        value={isLoading ? "Creating..." : "Create draft test"}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-green-400 text-zinc-900 rounded-md font-semibold cursor-pointer disabled:opacity-50"
      />
    </form>
  );
};

export default DraftTestFrom;