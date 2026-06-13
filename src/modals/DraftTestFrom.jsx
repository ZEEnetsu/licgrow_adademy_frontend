import Btn from "../pages/Admin/components/Btn";
import api from "../hooks/request";
import { useState } from "react";

const DraftTestFrom = ({ onClose }) => {
  const [draftData, setDraftData] = useState({
    description: "",
    title: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fields = [
    { id: "title", label: "Test Name", type: "text", placeholder: "Physics" },
    {
      id: "description",
      label: "Description",
      type: "text",
      placeholder: "Description",
    },
  ];
  console.log("Draft Data Res : ", draftData);

  const handleChange = (e) => {
    setDraftData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/admin/tests", draftData);
      console.log("Draft test Responce : " ,res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      <input
        type="submit"
        value={loading ? "Creating..." : "Submit"}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-green-400 text-zinc-900 rounded-md font-semibold cursor-pointer disabled:opacity-50"
      />
    </form>
  );
};

export default DraftTestFrom;
