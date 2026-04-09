import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import { fetchSiteInfo } from "../api/monthlyRental.js";
import "./SearchPage.css";

export default function SearchPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSearch() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(false);
    try {
      const result = await fetchSiteInfo(trimmed);
      if (result) {
        navigate(`/terms/${result.site.siteCode}`);
      } else {
        setError(true);
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
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
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

        {error && (
          <div className="search-page__alert">
            ⚠ 查<strong>無此場站代碼</strong>
          </div>
        )}
      </main>
    </div>
  );
}
