import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        aria-pressed={isDark}
        title={label}
        className={`nav-link w-full justify-between group ${className}`}
      >
        <span className="flex items-center gap-3">
          <span className="clay-tile w-8 h-8" aria-hidden="true">
            {isDark ? <Moon size={15} /> : <Sun size={15} />}
          </span>
          <span className="text-sm font-medium">{isDark ? 'Dark mode' : 'Light mode'}</span>
        </span>
        <span className={`switch ${isDark ? 'switch-on' : ''}`} aria-hidden="true">
          <span className="switch-knob" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={`clay-tile w-10 h-10 text-inkbody hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-app ${className}`}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
