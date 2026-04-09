import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import { fetchSiteInfo, ApiError } from "../api/monthlyRental.js";
import { getCompanyToken } from "../utils/urlParams.js";
import { alertError, alertWarning } from "../utils/alert.js";
import "./SearchPage.css";

export default function SearchPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 一進站檢查網址有沒有 bQz0fX8f
  useEffect(() => {
    if (!getCompanyToken()) {
      alertWarning(
        "請從正確連結進入此頁面。",
        "缺少網址參數",
      );
    }
  }, []);

  async function handleSearch() {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const result = await fetchSiteInfo(trimmed);
      // 帶上原本的 query string（保留 bQz0fX8f），讓後續頁面 refresh 也能用
      const target = result.termContent
        ? `/terms/${result.site.siteCode}`
        : `/form/${result.site.siteCode}`;

      navigate(
        { pathname: target, search: location.search },
        { state: { siteInfo: result } },
      );
    } catch (err) {
      if (err instanceof ApiError) {
        alertError(err.message);
      } else {
        alertError("發生未預期錯誤，請稍後再試。");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="search-page">
      <AppBar title="月租登記" />

      <main className="search-page__body">
        <div className="search-page__row">
          <div className="search-page__input-wrap">
            <i className="mdi mdi-magnify search-page__search-icon" />
            <input
              className="search-page__input"
              placeholder="場站代碼"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <button
            className={`search-page__btn ${loading ? "search-page__btn--loading" : ""}`}
            onClick={handleSearch}
            aria-label="搜尋"
            disabled={loading}
          >
            <i className="mdi mdi-magnify search-page__btn-icon" />
            <span className="search-page__spinner" />
          </button>
        </div>
      </main>
    </div>
  );
}
