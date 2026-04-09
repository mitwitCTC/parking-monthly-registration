import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import BottomButton from "../components/BottomButton.jsx";
import DatePicker from "../components/DatePicker.jsx";
import SelectField from "../components/SelectField.jsx";
import TextField from "../components/TextField.jsx";
import {
  fetchPaymentPlans,
  calculateRental,
  submitRegistration,
} from "../api/monthlyRental.js";
import useSiteInfo from "../hooks/useSiteInfo.js";
import {
  isValidCarNumber,
  isValidCarrier,
  isValidEmail,
  isValidPhone,
  isValidTaxId,
} from "../utils/validators.js";
import "./FormPage.css";

/** yyyy-MM-dd（local time） */
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = fmtDate(new Date());
const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return fmtDate(d);
})();

/* ── 表單驗證：欄位 → error message 對應 ── */
function validate(form) {
  const errors = {};
  if (!form.vehicleType) errors.vehicleType = "請選擇車型類別";
  if (!form.paymentPlan) errors.paymentPlan = "請選擇繳費方式";
  if (!form.name.trim()) errors.name = "請輸入車主姓名";
  if (!form.phone) {
    errors.phone = "請輸入手機號碼";
  } else if (!isValidPhone(form.phone)) {
    errors.phone = "手機號碼格式：09 開頭共 10 碼";
  }
  if (!form.carNumber.trim()) {
    errors.carNumber = "請輸入車牌號碼";
  } else if (!isValidCarNumber(form.carNumber)) {
    errors.carNumber = "格式範例：ABC-1234 或 1234-TT";
  }
  if (!form.beginDate) {
    errors.beginDate = "請選擇起租日";
  } else if (form.beginDate <= today) {
    errors.beginDate = "起租日需為明日(含)之後";
  }
  if (form.email && !isValidEmail(form.email)) {
    errors.email = "Email 格式不正確";
  }
  if (form.carrier && !isValidCarrier(form.carrier)) {
    errors.carrier = "格式：/ 開頭共 8 碼（例：/ABC+123）";
  }
  if (form.taxId && !isValidTaxId(form.taxId)) {
    errors.taxId = "統一編號格式不正確";
  }
  if (form.address && form.address.trim().length < 5) {
    errors.address = "地址至少 5 個字";
  }
  return errors;
}

/* ── Component ── */

export default function FormPage() {
  const { siteCode } = useParams();
  const location = useLocation();
  const { data: siteData, loading: siteLoading, error: siteError } = useSiteInfo(
    siteCode,
    { initialData: location.state?.siteInfo ?? null },
  );
  const navigate = useNavigate();

  // 帶著原本 query string（bQz0fX8f）導航
  const goWithSearch = (pathname, options) =>
    navigate({ pathname, search: location.search }, options);

  // 上一頁：使用 history back，保留之前連同 state 的 entry
  // 避免 push 新 entry 導致重打 API（靈深連條下沒有 state）
  const handleBack = () => {
    // 初始進入點（沒有 history）→ fallback 到首頁
    if (location.key === "default") {
      goWithSearch("/");
    } else {
      navigate(-1);
    }
  };

  const [form, setForm] = useState({
    vehicleType: "",
    paymentPlan: "",
    name: "",
    phone: "",
    carNumber: "",
    address: "",
    beginDate: tomorrow,
    email: "",
    carrier: "",
    taxId: "",
    company: "",
  });
  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [rental, setRental] = useState(null);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ── 車型變更 → 載入繳費方式 ── */
  useEffect(() => {
    if (!form.vehicleType) {
      queueMicrotask(() => {
        setPlans([]);
        setRental(null);
      });
      return;
    }
    let cancelled = false;
    queueMicrotask(() => setPlansLoading(true));
    fetchPaymentPlans(Number(form.vehicleType)).then((data) => {
      if (cancelled) return;
      setPlans(data);
      setPlansLoading(false);
      setForm((prev) => ({ ...prev, paymentPlan: "" }));
      setRental(null);
    });
    return () => {
      cancelled = true;
    };
  }, [form.vehicleType]);

  /* ── 繳費方式 or 起租日變更 → 計算應繳 ── */
  const doCalc = useCallback(() => {
    if (!form.vehicleType || !form.paymentPlan || !form.beginDate) {
      queueMicrotask(() => setRental(null));
      return;
    }
    let cancelled = false;
    queueMicrotask(() => setRentalLoading(true));
    calculateRental({
      vehicleType: Number(form.vehicleType),
      planId: form.paymentPlan,
      beginDate: form.beginDate,
    }).then((result) => {
      if (cancelled) return;
      setRental(result);
      setRentalLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [form.vehicleType, form.paymentPlan, form.beginDate]);

  useEffect(() => {
    doCalc();
  }, [doCalc]);

  /* ── guard ── */
  if (siteLoading) {
    return (
      <div className="form-page">
        <AppBar title="載入中..." onBack={handleBack} />
        <p style={{ textAlign: "center", marginTop: 120 }}>載入中...</p>
      </div>
    );
  }
  if (siteError || !siteData)
    return <Navigate to={{ pathname: "/", search: location.search }} replace />;

  const { site, vehicleTypes } = siteData;
  const vehicleOptions = vehicleTypes.map((v) => ({
    value: String(v.vehicleType),
    label: v.vehicleName,
  }));

  /* ── helpers ── */
  function update(field) {
    return (value) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitRegistration({ ...form, siteCode, rental });
      if (!result.success) return;

      if (result.hasBill && result.billId) {
        window.location.href = `https://rental.mitwit-cre.com.tw/?mid=${result.billId}`;
      } else {
        goWithSearch(`/success/${siteCode}`, {
          state: { form, rental },
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const planOptions = plans.map((p) => ({
    value: p.planId,
    label: `${p.planName}（$${p.amount.toLocaleString()}）`,
  }));
  const selectedPlan = plans.find((p) => p.planId === form.paymentPlan);

  return (
    <div className="form-page">
      <AppBar
        title={site.parkName || site.siteName}
        onBack={handleBack}
      />

      <main className="form-page__body">
        <h2 className="form-page__heading">基本資料</h2>

        <div className="form-page__fields">
          <div className="form-page__full" data-field="vehicleType">
            <SelectField
              icon="mdi-parking"
              label="車型類別"
              required
              value={form.vehicleType}
              onChange={update("vehicleType")}
              options={vehicleOptions}
              error={errors.vehicleType}
            />
          </div>

          {(form.vehicleType || plansLoading) && (
            <div className="form-page__full" data-field="paymentPlan">
              <SelectField
                icon="mdi-credit-card-outline"
                label={plansLoading ? "載入繳費方式..." : "繳費方式"}
                required
                value={form.paymentPlan}
                onChange={update("paymentPlan")}
                options={planOptions}
                error={errors.paymentPlan}
              />
            </div>
          )}

          {selectedPlan && (
            <div className="form-page__full form-page__fee-badge">
              <span className="form-page__fee-label">費率金額</span>
              <span className="form-page__fee-amount">
                NT$ {selectedPlan.amount.toLocaleString()}
              </span>
              <span className="form-page__fee-per">
                ／{selectedPlan.planName}
              </span>
            </div>
          )}

          <div data-field="name">
            <TextField
              icon="mdi-account"
              label="車主姓名"
              required
              value={form.name}
              onChange={update("name")}
              error={errors.name}
            />
          </div>

          <div data-field="phone">
            <TextField
              icon="mdi-cellphone"
              label="手機號碼"
              required
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              error={errors.phone}
              hint="09 開頭共 10 碼"
            />
          </div>

          <div data-field="carNumber">
            <TextField
              icon="mdi-aspect-ratio"
              label="車牌號碼"
              required
              value={form.carNumber}
              onChange={update("carNumber")}
              error={errors.carNumber}
              hint="包含符號，例：ABC-1234"
            />
          </div>

          <div data-field="address" className="form-page__full">
            <TextField
              icon="mdi-home-variant"
              label="聯絡地址"
              multiline
              value={form.address}
              onChange={update("address")}
              error={errors.address}
            />
          </div>

          <div data-field="beginDate">
            <DatePicker
              icon="mdi-pin"
              label="起租日"
              required
              value={form.beginDate}
              onChange={update("beginDate")}
              min={tomorrow}
              error={errors.beginDate}
            />
          </div>

          <div data-field="taxId">
            <TextField
              icon="mdi-ballot"
              label="統一編號"
              value={form.taxId}
              onChange={update("taxId")}
              error={errors.taxId}
              hint="選填，8 碼數字"
            />
          </div>

          <div data-field="company">
            <TextField
              icon="mdi-home-account"
              label="公司抬頭"
              value={form.company}
              onChange={update("company")}
              hint="選填"
            />
          </div>

          <div data-field="email">
            <TextField
              icon="mdi-email-outline"
              label="Email"
              type="email"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
              hint="選填"
            />
          </div>

          <div data-field="carrier">
            <TextField
              icon="mdi-cellphone-text"
              label="手機載具"
              value={form.carrier}
              onChange={update("carrier")}
              error={errors.carrier}
              hint="選填，/ 開頭共 8 碼"
            />
          </div>

          {(rental || rentalLoading) && (
            <div className="form-page__full form-page__rental-card">
              <h3 className="form-page__rental-title">應繳資訊</h3>
              {rentalLoading ? (
                <p className="form-page__rental-loading">計算中...</p>
              ) : (
                rental && (
                  <dl className="form-page__rental-dl">
                    <dt>租期</dt>
                    <dd>
                      {rental.beginDate} ~ {rental.endDate}
                    </dd>
                    <dt>月數</dt>
                    <dd>{rental.months} 個月</dd>
                    <dt>月租單價</dt>
                    <dd>NT$ {rental.unitPrice.toLocaleString()}</dd>
                    <dt>應繳總額</dt>
                    <dd className="form-page__rental-total">
                      NT$ {rental.totalAmount.toLocaleString()}
                    </dd>
                  </dl>
                )
              )}
            </div>
          )}
        </div>
      </main>

      <BottomButton onClick={handleSubmit} disabled={submitting}>
        {submitting ? "送出中..." : "送出資料"}
      </BottomButton>
    </div>
  );
}
