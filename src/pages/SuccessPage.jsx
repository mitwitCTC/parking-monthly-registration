import { useLocation, useParams, Navigate, useNavigate } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import BottomButton from "../components/BottomButton.jsx";
import useSiteInfo from "../hooks/useSiteInfo.js";
import "./SuccessPage.css";

export default function SuccessPage() {
  const { siteCode } = useParams();
  const { data: siteData } = useSiteInfo(siteCode);
  const location = useLocation();
  const navigate = useNavigate();
  const { form, rental } = location.state || {};

  // 表單資料來自 state（一次性），遺失就導回首頁
  if (!form) return <Navigate to="/" replace />;

  const siteName = siteData?.site?.siteName || "";

  return (
    <div className="success-page">
      <AppBar title={siteName} />

      <main className="success-page__body">
        <div className="success-page__icon">✅</div>
        <h2 className="success-page__heading">登記完成</h2>
        <p className="success-page__sub">
          您的月租登記已完成，後續將由管理員與您聯繫。
        </p>

        <div className="success-page__summary">
          <dl>
            <dt>車主姓名</dt>
            <dd>{form.name}</dd>
            <dt>手機號碼</dt>
            <dd>{form.phone}</dd>
            <dt>車牌號碼</dt>
            <dd>{form.carNumber}</dd>
            <dt>起租日</dt>
            <dd>{form.beginDate}</dd>
            {rental && (
              <>
                <dt>租期</dt>
                <dd>
                  {rental.beginDate} ~ {rental.endDate}
                </dd>
                <dt>應繳金額</dt>
                <dd>NT$ {rental.totalAmount.toLocaleString()}</dd>
              </>
            )}
            {form.email && (
              <>
                <dt>Email</dt>
                <dd>{form.email}</dd>
              </>
            )}
          </dl>
        </div>
      </main>

      <BottomButton onClick={() => navigate("/")}>回首頁</BottomButton>
    </div>
  );
}
