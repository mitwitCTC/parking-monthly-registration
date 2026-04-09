import { useState, useRef, useEffect } from "react";
import "./SelectField.css";

/**
 * @param {{
 *   icon?: string,
 *   label: string,
 *   value: string,
 *   onChange: (v: string) => void,
 *   options: { value: string, label: string }[],
 *   required?: boolean,
 *   error?: string,
 * }} props
 */
export default function SelectField({
  icon,
  label,
  value,
  onChange,
  options,
  required,
  error,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hasValue = value !== "";

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div
      className={[
        "select-field",
        error && "select-field--error",
        (open || hasValue) && "select-field--active",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={ref}
    >
      {icon && (
        <span className="select-field__icon">
          <i className={`mdi ${icon}`} />
        </span>
      )}
      <div className="select-field__body" onClick={() => setOpen(!open)}>
        <label
          className={`select-field__label ${hasValue ? "select-field__label--float" : ""}`}
        >
          {label}
          {required && "*"}
        </label>
        <div className="select-field__value">{selectedLabel}</div>
        <span className={`select-field__arrow ${open ? "select-field__arrow--open" : ""}`}>
          ▾
        </span>
        {open && (
          <ul className="select-field__dropdown">
            {options.map((opt) => (
              <li
                key={opt.value}
                className={`select-field__option ${opt.value === value ? "select-field__option--active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <span className="select-field__error">{error}</span>}
    </div>
  );
}
