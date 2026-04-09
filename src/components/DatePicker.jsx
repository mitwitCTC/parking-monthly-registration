import { useState, useRef, useEffect } from "react";
import "./DatePicker.css";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * @param {{
 *   value: string,
 *   onChange: (v: string) => void,
 *   min?: string,
 *   icon?: string,
 *   label?: string,
 *   required?: boolean,
 *   error?: string,
 * }} props
 */
export default function DatePicker({
  value,
  onChange,
  min,
  icon,
  label,
  required,
  error,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 目前顯示月份
  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? new Date().getMonth(),
  );
  const [prevValue, setPrevValue] = useState(value);

  // value 變更時同步 view（render 期間調整，避免 effect 內 setState 造成 cascading render）
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }

  const todayStr = fmt(new Date());
  const minDate = min || null;

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDate(dateStr) {
    onChange(dateStr);
    setOpen(false);
  }

  // 建立日曆格子
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const cells = [];

  // 前面空白
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const disabled = minDate ? dateStr < minDate : false;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === value;
    cells.push({ day: d, dateStr, disabled, isToday, isSelected });
  }

  const hasValue = value && value.length > 0;
  const monthLabel = `${viewYear} 年 ${viewMonth + 1} 月`;

  return (
    <div
      className={`date-picker ${error ? "date-picker--error" : ""} ${open ? "date-picker--focus" : ""}`}
      ref={ref}
    >
      {icon && (
        <span className="date-picker__icon">
          <i className={`mdi ${icon}`} />
        </span>
      )}
      <div className="date-picker__body" onClick={() => setOpen(!open)}>
        <label
          className={`date-picker__label ${hasValue ? "date-picker__label--float" : ""}`}
        >
          {label}
          {required && "*"}
        </label>
        <div className="date-picker__value">{value || ""}</div>
      </div>

      {open && (
        <div className="date-picker__dropdown">
          <div className="date-picker__header">
            <button
              type="button"
              className="date-picker__nav"
              onClick={prevMonth}
            >
              <i className="mdi mdi-chevron-left" />
            </button>
            <span className="date-picker__month-label">{monthLabel}</span>
            <button
              type="button"
              className="date-picker__nav"
              onClick={nextMonth}
            >
              <i className="mdi mdi-chevron-right" />
            </button>
          </div>

          <div className="date-picker__weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="date-picker__weekday">
                {w}
              </span>
            ))}
          </div>

          <div className="date-picker__grid">
            {cells.map((cell, i) =>
              cell === null ? (
                <span key={`empty-${i}`} className="date-picker__cell" />
              ) : (
                <button
                  key={cell.dateStr}
                  type="button"
                  className={[
                    "date-picker__cell",
                    cell.isSelected && "date-picker__cell--selected",
                    cell.isToday && !cell.isSelected && "date-picker__cell--today",
                    cell.disabled && "date-picker__cell--disabled",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={cell.disabled}
                  onClick={() => selectDate(cell.dateStr)}
                >
                  {cell.day}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {error && <span className="date-picker__error">{error}</span>}
    </div>
  );
}
