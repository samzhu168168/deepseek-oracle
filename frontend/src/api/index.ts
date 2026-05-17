import axios from "axios";

// In production (Vercel), always use relative URLs so /api/* routes hit
// the serverless functions — never call the old Render backend directly.
// In development, respect VITE_API_URL (e.g. http://localhost:5000).
const apiBaseUrl = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_URL || "");

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
});

export async function warmup() {
  try {
    await axios.get(`${apiBaseUrl}/health`, { timeout: 60000 });
  } catch (e) {}
}

warmup();
setInterval(warmup, 3 * 60 * 1000);

export async function analyzeBond(data: any) {
  await warmup();
  const response = await api.post("/api/divination/analyze", data);
  return response.data;
}

export default api;
