import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "https://deepseek-oracle-backend.onrender.com";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120000,
});

export async function warmup() {
  try {
    await axios.get(`${apiBaseUrl}/health`, { timeout: 10000 });
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
