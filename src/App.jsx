import { Routes, Route, Navigate } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import FormPage from "./pages/FormPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/terms/:siteCode" element={<TermsPage />} />
      <Route path="/form/:siteCode" element={<FormPage />} />
      <Route path="/success/:siteCode" element={<SuccessPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
