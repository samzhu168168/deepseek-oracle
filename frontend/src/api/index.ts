import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";
const USE_MOCK = false;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
});

// Mock 数据生成
const generateMockReport = () => {
  const elements = ["Fire", "Water", "Wood", "Metal", "Earth"];
  const elementA = elements[Math.floor(Math.random() * elements.length)];
  const elementB = elements[Math.floor(Math.random() * elements.length)];
  const score = Math.floor(Math.random() * 30) + 60;
  
  return {
    teaser: {
      summary: `I see ${elementA} meeting ${elementB} in your chart. This is not a simple match. There's a pattern here—one that repeats. The question isn't 'Will this work?' The question is 'Are you willing to do the work?'`,
      five_element_compatibility: `${elementA} meets ${elementB}`,
      radar_scores: {
        "Elemental Harmony": score + Math.floor(Math.random() * 10) - 5,
        "Soul Resonance": score + Math.floor(Math.random() * 10) - 5,
        "Growth Catalyst": score + Math.floor(Math.random() * 10) - 5,
        "Karmic Bond": score + Math.floor(Math.random() * 10) - 5,
      }
    },
    full_report: null,
    license_valid: false
  };
};

export async function warmup() {
  if (USE_MOCK) return;
  try {
    await axios.get(`${apiBaseUrl}/health`, { timeout: 60000 });
  } catch (e) {}
}

if (!USE_MOCK) {
  warmup();
  setInterval(warmup, 3 * 60 * 1000);
}

export async function analyzeBond(data: any) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return generateMockReport();
  }
  await warmup();
  const response = await api.post("/api/divination/analyze", data);
  return response.data;
}

export default api;
