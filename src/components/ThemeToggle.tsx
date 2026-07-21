import { Sun, Monitor, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme, type Theme } from "../context/ThemeContext";

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

export default function ThemeToggle({ className = "", layoutId = "theme-toggle-active" }: { className?: string; layoutId?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-full border border-border bg-muted/50 ${className}`}
      role="radiogroup"
      aria-label="Color theme"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${opt.label} theme`}
            onClick={() => setTheme(opt.value)}
            className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200 cursor-pointer ${
              isActive ? "text-white" : "text-secondary-text hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
          </button>
        );
      })}
    </div>
  );
}
