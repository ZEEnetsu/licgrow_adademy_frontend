const BASE_URL = "/api/v1";  

const request = async (endpoint, options = {}) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  console.log("res -> ", res);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Something went wrong");
  }

  return res.json();
};

const api = {
  get:    (endpoint)       => request(endpoint, { method: "GET" }),
  post:   (endpoint, body) => request(endpoint, { method: "POST",  body: JSON.stringify(body) }),
  put:    (endpoint, body) => request(endpoint, { method: "PUT",   body: JSON.stringify(body) }),
  patch:  (endpoint, body) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint)       => request(endpoint, { method: "DELETE" }),
};

export default api;