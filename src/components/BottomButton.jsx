import "./BottomButton.css";

/**
 * @param {{ children: React.ReactNode, disabled?: boolean, onClick?: () => void }} props
 */
export default function BottomButton({ children, disabled, onClick }) {
  return (
    <div className="bottom-btn-wrap">
      <button
        className="bottom-btn"
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    </div>
  );
}
