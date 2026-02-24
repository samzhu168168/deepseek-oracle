import axios from "axios";

import type { ApiResponse, BondAnalysisRequest, BondAnalysisResponse } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120_000,
});

const isSuccessCode = (code: number | string) => code === 0;

const unwrap = <T>(response: { data: ApiResponse<T> }) => {
  const payload = response.data;
  if (!isSuccessCode(payload.code)) {
    throw new Error(payload.message || "request failed");
  }
  return payload;
};

export const analyzeBond = async (payload: BondAnalysisRequest) => {
  try {
    await axios.get(`${apiBaseUrl}/health`, { timeout: 60_000 });
  } catch {
    // ignore warm-up errors
  }
  return unwrap(await api.post<ApiResponse<BondAnalysisResponse>>("/api/divination/analyze", payload));
};
