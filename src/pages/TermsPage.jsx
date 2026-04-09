import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import BottomButton from "../components/BottomButton.jsx";
import useSiteInfo from "../hooks/useSiteInfo.js";
import "./TermsPage.css";

export default function TermsPage() {
  const { siteCode } = useParams();
  const { data, loading, error } = useSiteInfo(siteCode);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="terms-page">
        <AppBar title="月租登記" onBack={() => navigate("/")} />
        <p style={{ textAlign: "center", marginTop: 120 }}>載入中...</p>
      </div>
    );
  }

  if (error || !data) return <Navigate to="/" replace />;

  const { terms } = data;

  return (
    <div className="terms-page">
      <AppBar title="月租登記" onBack={() => navigate("/")} />

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
        onClick={() => navigate(`/form/${siteCode}`)}
      >
        下一步
      </BottomButton>
    </div>
  );
}
