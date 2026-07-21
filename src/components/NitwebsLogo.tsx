import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";

interface LogoConfig {
  mode?: string;
  text?: string;
  imageUrl?: string;
  darkImageUrl?: string;
}

export default function NitwebsLogo({
  className = "h-7 w-auto",
  logoConfig,
  isDrawing = false,
  isAnimating = false,
}: {
  className?: string;
  logoConfig?: LogoConfig;
  isDrawing?: boolean;
  isAnimating?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const shouldAnimate = isDrawing || isAnimating;

  // Pure Opacity Fade-In: Fades from 0 to 1 smoothly
  const fadeAnimation = shouldAnimate
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 1.0, ease: "easeInOut" as const },
      }
    : {};

  // 1. Dark Mode Image Logo (if dark mode active and darkImageUrl uploaded)
  if (isDark && logoConfig?.darkImageUrl) {
    return (
      <motion.img
        src={logoConfig.darkImageUrl}
        alt={logoConfig?.text || "Nitwebs"}
        className={`object-contain max-h-8 w-auto ${className}`}
        {...fadeAnimation}
      />
    );
  }

  // 2. Light Mode / Default Image Logo (if imageUrl uploaded)
  if (logoConfig?.imageUrl && logoConfig.imageUrl !== "/logo.png") {
    return (
      <motion.img
        src={logoConfig.imageUrl}
        alt={logoConfig?.text || "Nitwebs"}
        className={`object-contain max-h-8 w-auto ${className}`}
        {...fadeAnimation}
      />
    );
  }

  // 3. Clean Modern Brand Typography Text Logo
  const textValue = logoConfig?.text || "Nitwebs";
  const parts = textValue.split(/(webs)/i);

  return (
    <motion.span
      className={`font-headline font-bold text-foreground text-xl tracking-tight inline-flex items-center select-none ${className}`}
      style={{ fontFamily: "'Cal Sans', 'Inter', sans-serif" }}
      {...fadeAnimation}
    >
      {parts.map((part, i) => (
        <span key={i} className={part.toLowerCase() === "webs" ? "text-primary" : "text-foreground"}>
          {part}
        </span>
      ))}
    </motion.span>
  );
}
