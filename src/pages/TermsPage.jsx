import { useState } from "react";
import { useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import BottomButton from "../components/BottomButton.jsx";
import useSiteInfo from "../hooks/useSiteInfo.js";
import "./TermsPage.css";

export default function TermsPage() {
  const { siteCode } = useParams();
  const location = useLocation();
  const { data, loading, error } = useSiteInfo(siteCode, {
    initialData: location.state?.siteInfo ?? null,
  });
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  // 帶著原本 query string（bQz0fX8f）導航
  const goWithSearch = (pathname, options) =>
    navigate({ pathname, search: location.search }, options);

  if (loading) {
    return (
      <div className="terms-page">
        <AppBar title="月租登記" onBack={() => goWithSearch("/")} />
        <p style={{ textAlign: "center", marginTop: 120 }}>載入中...</p>
      </div>
    );
  }

  if (error || !data)
    return <Navigate to={{ pathname: "/", search: location.search }} replace />;

  // 條款為空 → 直接跳到資料登記頁
  if (!data.termContent) {
    return (
      <Navigate
        to={{ pathname: `/form/${siteCode}`, search: location.search }}
        replace
      />
    );
  }

  const { site, terms } = data;

  return (
    <div className="terms-page">
      <AppBar
        title={site.parkName || site.siteName || "月租登記"}
        onBack={() => goWithSearch("/")}
      />

      <main className="terms-page__body">
        <h2 className="terms-page__heading">- 場站條款 -</h2>

        <div className="terms-page__box">
          {terms.map((item, i) =>
            item.text ? (
              <p
                key={i}
                className={`terms-page__line ${item.red ? "terms-page__line--red" : ""}`}
              >
                {item.text}
              </p>
            ) : (
              <br key={i} />
            ),
          )}
        </div>

        <label className="terms-page__checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>我已同意此條款</span>
        </label>
      </main>

      <BottomButton
        disabled={!agreed}
        onClick={() =>
          goWithSearch(`/form/${siteCode}`, {
            state: { siteInfo: data },
          })
        }
      >
        下一步
      </BottomButton>
    </div>
  );
}
