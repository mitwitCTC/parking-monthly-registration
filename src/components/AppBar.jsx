import "./AppBar.css";

/**
 * @param {{ title: string, onBack?: () => void }} props
 */
export default function AppBar({ title, onBack }) {
  return (
    <header className="app-bar">
      {onBack && (
        <button className="app-bar__back" onClick={onBack} aria-label="返回">
          ←
        </button>
      )}
      <h1 className="app-bar__title">{title}</h1>
    </header>
  );
}
