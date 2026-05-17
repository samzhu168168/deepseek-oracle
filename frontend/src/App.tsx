import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { Layout } from "./components/Layout";
import ArticleListPage from "./pages/ArticleList";
import ArticlePage from "./pages/Article";
import BaZiPage from "./pages/BaZi";
import CompatibilityPage from "./pages/Compatibility";
import ElementCompatibilityPage from "./pages/ElementCompatibility";
import HomePage from "./pages/Home";
import ResultPage from "./pages/Result";
export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/compatibility/elements/:element1-and-:element2" element={<ElementCompatibilityPage />} />
            <Route path="/compatibility/:sign1-and-:sign2" element={<CompatibilityPage />} />
            <Route path="/bazi" element={<BaZiPage />} />
            <Route path="/articles" element={<ArticleListPage />} />
            <Route path="/articles/:slug" element={<ArticlePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
