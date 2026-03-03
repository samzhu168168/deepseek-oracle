import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { Layout } from "./components/Layout";
import CompatibilityPage from "./pages/Compatibility";
import HomePage from "./pages/Home";
import ResultPage from "./pages/Result";
export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/compatibility/:sign1-and-:sign2" element={<CompatibilityPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
