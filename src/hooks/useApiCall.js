import { useState, useEffect } from "react";
import api from "../hooks/request.js"; // Assuming this is your axios instance path

// 1. Rename to start with 'use'
const useApiCall = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 2. Clear state on URL change to prevent memory leaks or data bleeding
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await api.get(url);
        // Extracting your nested data wrapper safely
        setData(res.data?.data || res.data); 
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // 3. CRITICAL: Actually invoke the function!
  }, [url]); // Hook triggers automatically whenever the target URL updates

  // Return an object containing loading states so your client UIs can show spinners
  return { data, loading, error };
};

export default useApiCall;