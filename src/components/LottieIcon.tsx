import { motion } from "motion/react";
import { Cpu, Layers, Globe, Workflow, Cloud, Palette } from "lucide-react";

// Pre-packaged high-performance Lottie JSON URLs for services
export const SERVICE_LOTTIE_URLS: { [key: string]: string } = {
  "AI Engineering": "https://assets9.lottiefiles.com/packages/lf20_g4y0crk8.json",
  "Custom Software & SaaS": "https://assets5.lottiefiles.com/packages/lf20_w51pcehl.json",
  "Web & Mobile Applications": "https://assets3.lottiefiles.com/packages/lf20_az0lms7z.json",
  "Automation & System Integration": "https://assets10.lottiefiles.com/packages/lf20_5tl102p3.json",
  "Cloud Infrastructure & DevOps": "https://assets9.lottiefiles.com/packages/lf20_ky2n8zpq.json",
  "UI/UX & Product Design": "https://assets1.lottiefiles.com/packages/lf20_dmw31zqn.json",
};

// -----------------------------------------------------------------------------
// 1. Animated Micro-Lottie Component: AI Engineering
// -----------------------------------------------------------------------------
function AiLottieIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className || "w-8 h-8"}`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Outer Ring Pulsing Node */}
        <motion.circle
          cx="18"
          cy="18"
          r="15"
          stroke="hsl(var(--primary))"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        {/* Microchip Body */}
        <rect x="10" y="10" width="16" height="16" rx="4" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        {/* Inner AI Core */}
        <motion.circle
          cx="18"
          cy="18"
          r="3.5"
          fill="hsl(var(--primary))"
          animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Connecting Neural Pins */}
        <motion.path
          d="M18 4V10M18 26V32M4 18H10M26 18H32"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 2. Animated Micro-Lottie Component: Custom Software & SaaS
// -----------------------------------------------------------------------------
function SaasLottieIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className || "w-8 h-8"}`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Bottom Layer */}
        <motion.path
          d="M6 24L18 29L30 24"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 1.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Middle Layer */}
        <motion.path
          d="M6 18L18 23L30 18"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        {/* Top Active SaaS Card Layer */}
        <motion.path
          d="M18 7L6 12L18 17L30 12L18 7Z"
          fill="hsl(var(--primary) / 0.2)"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, -2.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        {/* Floating Sparkle Dot */}
        <motion.circle
          cx="28"
          cy="9"
          r="2"
          fill="hsl(var(--primary))"
          animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 3. Animated Micro-Lottie Component: Web & Mobile Applications
// -----------------------------------------------------------------------------
function WebMobileLottieIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className || "w-8 h-8"}`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Monitor Screen */}
        <rect x="5" y="7" width="20" height="14" rx="2.5" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1.4" />
        <path d="M11 25H19M15 21V25" stroke="hsl(var(--primary))" strokeWidth="1.4" strokeLinecap="round" />
        
        {/* Mobile Phone Overlapping Screen */}
        <motion.rect
          x="20"
          y="13"
          width="11"
          height="17"
          rx="2"
          fill="hsl(var(--background))"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Mobile Screen Notch */}
        <motion.line
          x1="24"
          y1="15"
          x2="27"
          y2="15"
          stroke="hsl(var(--primary))"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 4. Animated Micro-Lottie Component: Automation & System Integration
// -----------------------------------------------------------------------------
function AutomationLottieIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className || "w-8 h-8"}`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Large Gear */}
        <motion.g
          style={{ transformOrigin: "14px 14px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="14" cy="14" r="6" stroke="hsl(var(--primary))" strokeWidth="1.4" fill="hsl(var(--primary) / 0.15)" />
          <path d="M14 6V4M14 24V22M6 14H4M24 14H22M8.3 8.3L6.9 6.9M21.1 21.1L19.7 19.7M8.3 19.7L6.9 21.1M21.1 6.9L19.7 8.3" stroke="hsl(var(--primary))" strokeWidth="1.4" strokeLinecap="round" />
        </motion.g>

        {/* Small Interlocking Gear */}
        <motion.g
          style={{ transformOrigin: "24px 24px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="24" cy="24" r="4.5" stroke="hsl(var(--primary))" strokeWidth="1.3" fill="hsl(var(--primary) / 0.2)" />
          <path d="M24 18V17M24 31V30M18 24H17M31 24H30" stroke="hsl(var(--primary))" strokeWidth="1.3" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 5. Animated Micro-Lottie Component: Cloud Infrastructure & DevOps
// -----------------------------------------------------------------------------
function CloudLottieIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className || "w-8 h-8"}`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Pulsing Cloud Container */}
        <motion.path
          d="M9 24C6.5 24 4.5 22 4.5 19.5C4.5 17.2 6.1 15.3 8.3 15C9.2 11.5 12.4 9 16.2 9C20.6 9 24.2 12.1 24.9 16.3C27.3 16.8 29 18.9 29 21.5C29 24 27 26 24.5 26"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="hsl(var(--primary) / 0.15)"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Upload/Sync Arrow */}
        <motion.path
          d="M16.5 27V18M13 21.5L16.5 18L20 21.5"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 6. Animated Micro-Lottie Component: UI/UX & Product Design
// -----------------------------------------------------------------------------
function DesignLottieIcon({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className || "w-8 h-8"}`}>
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Palette Canvas Ring */}
        <path
          d="M18 6C11.4 6 6 11.4 6 18C6 24.6 11.4 30 18 30C20 30 21 28.5 21 27.5C21 26.6 20.4 26 19.8 25.4C19.2 24.8 18.6 24.1 18.6 23C18.6 21.3 20 20 21.7 20H24.5C27.5 20 30 17.5 30 14.5C30 9.8 24.6 6 18 6Z"
          stroke="hsl(var(--primary))"
          strokeWidth="1.4"
          fill="hsl(var(--primary) / 0.12)"
        />

        {/* Color Swatch Dots */}
        <motion.circle cx="11.5" cy="14" r="1.8" fill="hsl(var(--primary))" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
        <motion.circle cx="16" cy="11.5" r="1.8" fill="hsl(var(--primary))" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
        <motion.circle cx="21.5" cy="13" r="1.8" fill="hsl(var(--primary))" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
      </svg>
    </div>
  );
}

// Dynamic Lottie Vector Components Map
const MICRO_LOTTIE_MAP: { [key: string]: React.ElementType } = {
  "AI Engineering": AiLottieIcon,
  "Custom Software & SaaS": SaasLottieIcon,
  "Web & Mobile Applications": WebMobileLottieIcon,
  "Automation & System Integration": AutomationLottieIcon,
  "Cloud Infrastructure & DevOps": CloudLottieIcon,
  "UI/UX & Product Design": DesignLottieIcon,
};

// Lucide Icon Fallback Map
const FALLBACK_ICONS: { [key: string]: React.ElementType } = {
  "AI Engineering": Cpu,
  "Custom Software & SaaS": Layers,
  "Web & Mobile Applications": Globe,
  "Automation & System Integration": Workflow,
  "Cloud Infrastructure & DevOps": Cloud,
  "UI/UX & Product Design": Palette,
};

interface LottieIconProps {
  title: string;
  lottieUrl?: string;
  className?: string;
}

export default function LottieIcon({ title, className = "w-8 h-8" }: LottieIconProps) {
  // 1. High-performance Built-in Vector Micro-Lottie Component
  const BuiltInLottie = (MICRO_LOTTIE_MAP as Record<string, any>)[title];
  if (BuiltInLottie) {
    const Component = BuiltInLottie;
    return <Component className={className} />;
  }

  // 2. Lucide Fallback Icon
  const FallbackIcon = (FALLBACK_ICONS as Record<string, any>)[title] || Cpu;
  return <FallbackIcon className={`w-5 h-5 text-primary ${className}`} />;
}
