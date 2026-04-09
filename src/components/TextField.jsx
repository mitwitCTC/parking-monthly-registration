import { useState } from "react";
import "./TextField.css";

/**
 * @param {{
 *   icon?: string,
 *   label: string,
 *   value: string,
 *   onChange: (v: string) => void,
 *   type?: string,
 *   required?: boolean,
 *   hint?: string,
 *   error?: string,
 *   readOnly?: boolean,
 *   multiline?: boolean,
 *   min?: string,
 *   onClick?: () => void,
 * }} props
 */
export default function TextField({
  icon,
  label,
  value,
  onChange,
  type = "text",
  required,
  hint,
  error,
  readOnly,
  multiline,
  min,
  onClick,
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const Tag = multiline ? "textarea" : "input";
  const isActive = focused || hasValue;

  return (
    <div
      className={[
        "text-field",
        error && "text-field--error",
        isActive && "text-field--active",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon && (
        <span className="text-field__icon">
          <i className={`mdi ${icon}`} />
        </span>
      )}
      <div className="text-field__main">
        <div className="text-field__body" onClick={onClick}>
          <label
            className={`text-field__label ${hasValue ? "text-field__label--float" : ""}`}
          >
            {label}
            {required && "*"}
          </label>
          <Tag
            className="text-field__input"
            type={multiline ? undefined : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            readOnly={readOnly}
            min={multiline ? undefined : min}
            rows={multiline ? 2 : undefined}
          />
        </div>
        {(hint || error) && (
          <span className={`text-field__hint ${error ? "text-field__hint--error" : ""}`}>
            {error || hint}
          </span>
        )}
      </div>
    </div>
  );
}
