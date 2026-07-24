import { Sun, Monitor, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme, type Theme } from "../context/ThemeContext";

const OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

interface ThemeToggleProps {
  className?: string;
  layoutId?: string;
  orientation?: "horizontal" | "vertical";
}

export default function ThemeToggle({
  className = "",
  layoutId = "theme-toggle-active",
  orientation = "horizontal"
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`inline-flex ${
        isVertical ? "flex-col gap-1.5 p-1.5" : "flex-row gap-1 p-1"
      } items-center rounded-full border border-border/80 bg-surface/90 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 ${className}`}
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
            title={`${opt.label} theme`}
            onClick={() => setTheme(opt.value)}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 cursor-pointer ${
              isActive ? "text-white" : "text-secondary-text hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
          </button>
        );
      })}
    </div>
  );
}
