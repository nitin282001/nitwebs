import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate } from "motion/react";
import type { AnimationPlaybackControls } from "motion/react";
import { updatePageSEO } from "../lib/seo";
import type { IconType } from "react-icons";
import { useIntroAnimation } from "../context/IntroContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  Layers,
  Workflow,
  Star,
  CheckCircle,
  MessageSquare,
  Lock,
  ArrowUpRight
} from "lucide-react";
import {
  SiAnthropic,
  SiElevenlabs,
  SiVercel,
  SiLinear,
  SiStripe,
  SiCoinbase,
  SiNextdotjs,
  SiReact,
  SiVuedotjs,
  SiNodedotjs,
  SiLaravel,
  SiPython,
  SiKotlin,
  SiFlutter,
  SiN8N,
  SiAngular,
  SiJavascript,
  SiTailwindcss,
  SiRust,
  SiMongodb,
  SiSolidity,
  SiDigitalocean,
  SiDocker,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa6";
import Lenis from "lenis";

import { useGlobalScramble } from "../hooks/useGlobalScramble";
import GridLines from "../components/GridLines";
import GridDivider from "../components/GridDivider";

import Header from "../components/Header";
import Footer from "../components/Footer";
import AboutUsSection from "../sections/AboutUsSection";
import { Reveal, StaggerGrid, fadeUp, staggerContainer } from "../lib/animations";
import { hexToHsl } from "../lib/utils";
import SpecularButton from "../components/ui/SpecularButton";
import IndustriesOrbit from "../sections/IndustriesOrbit";
import SaasShowcaseSection from "../sections/SaasShowcaseSection";
import TeamGallerySection from "../sections/TeamGallerySection";
import ContactSection from "../sections/ContactSection";
import SpotlightCard from "../components/SpotlightCard";



// Radii (px) of the two rings that carry icons — must match the 580px/720px
// -diameter circles drawn behind the hero headline. Bounded on both sides:
// must stay >= ~269px (the corner-to-corner distance of the centered text
// block, at its current smaller size, once expanded by half an icon on
// every side) so a fully-rotating icon can never cross behind the text —
// measured and verified in-browser, not estimated — and radius + icon size
// must never exceed the hero's own bounds at any angle, so icons are never
// clipped mid-shape either. Kept as small as that allows so the whole
// hero (rings + text) fits in one viewport without scrolling.


interface OrbitIconData {
  name: string;
  icon: IconType;
  color: string;
  // Angle (degrees, clockwise from 12 o'clock) this icon sits at when the
  // ring's shared orbit angle is 0.
  baseAngle: number;
}

// Evenly spaces `count` icons around a full circle, `count` degrees apart,
// starting at `offset` — keeps gaps between adjacent icons uniform and small.
function evenAngles(count: number, offset = 0): number[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => offset + i * step);
}

const MIDDLE_ANGLES = evenAngles(9);
const MIDDLE_RING_ICONS: OrbitIconData[] = [
  { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Vue", icon: SiVuedotjs, color: "#4FC08D" },
  { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
  { name: "Java", icon: FaJava, color: "#f8981d" },
  { name: "n8n", icon: SiN8N, color: "#EA4B71" },
  { name: "Angular", icon: SiAngular, color: "#DD0031" },
  { name: "JavaScript", icon: SiJavascript, color: "#F0DB4F" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
].map((item, i) => ({ ...item, baseAngle: MIDDLE_ANGLES[i] }));

const OUTER_ANGLES = evenAngles(10, 18);
const OUTER_RING_ICONS: OrbitIconData[] = [
  { name: "Laravel", icon: SiLaravel, color: "#FF2D20" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Kotlin", icon: SiKotlin, color: "#7F52FF" },
  { name: "Flutter", icon: SiFlutter, color: "#02569B" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "Rust", icon: SiRust, color: "#000000" },
  { name: "Solidity", icon: SiSolidity, color: "#363636" },
  { name: "DigitalOcean", icon: SiDigitalocean, color: "#0080FF" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
  { name: "AWS", icon: FaAws, color: "#FF9900" },
].map((item, i) => ({ ...item, baseAngle: OUTER_ANGLES[i] }));

// Half-size (px) of each orbit icon circle — kept as a constant so the
// ring-radius safety math (text clearance, container clipping) stays in
// sync with the actual rendered icon size.
const ORBIT_ICON_HALF = 20;

// A single icon on an orbit ring. It sits statically centered (left/top:
// 50%, offset by its own half-size), and its orbit position is applied as a
// `transform: translate()` recomputed every frame from the ring's shared
// angle via plain trigonometry. Using transform (not left/top) keeps this
// on the compositor instead of triggering layout on every frame, which is
// what was causing the jitter. The icon element itself is never rotated, so
// its logo can never render upside down. Hover-scale lives on a separate
// inner element (via group-hover) so it never fights the orbit transform
// for control of the same element's `transform` property.
function OrbitIcon({
  icon: Icon,
  color,
  name,
  radius,
  baseAngle,
  angle,
  onPause,
  onResume,
}: OrbitIconData & { radius: number; angle: ReturnType<typeof useMotionValue<number>>; onPause: () => void; onResume: () => void }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const displayColor =
    isDark && (color === "#000000" || color === "#363636" || color === "#000")
      ? "#ffffff"
      : !isDark && color === "#ffffff"
      ? "#000000"
      : color;

  const x = useTransform(angle, (a: any) => {
    const rad = (((a as number) + baseAngle) * Math.PI) / 180;
    return radius * Math.sin(rad);
  });
  const y = useTransform(angle, (a: any) => {
    const rad = (((a as number) + baseAngle) * Math.PI) / 180;
    return -radius * Math.cos(rad);
  });

  return (
    <motion.div
      className="group absolute pointer-events-auto"
      style={{
        left: "50%",
        top: "50%",
        marginLeft: -ORBIT_ICON_HALF,
        marginTop: -ORBIT_ICON_HALF,
        x,
        y,
      }}
      onHoverStart={onPause}
      onHoverEnd={onResume}
    >
      <div
        className="rounded-full bg-surface/90 border border-border/80 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 ease-out group-hover:scale-125 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] backdrop-blur-md"
        style={{ width: ORBIT_ICON_HALF * 2, height: ORBIT_ICON_HALF * 2 }}
      >
        <Icon style={{ color: displayColor }} className="w-5 h-5 transition-colors duration-200" />
      </div>
      <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 mt-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
        {name}
      </span>
    </motion.div>
  );
}

// A ring of tech-stack icons that orbits its shared center continuously and
// slowly, clockwise, like planets. All icons on a ring share one animated
// angle value, so they move in perfect lockstep; hovering any one of them
// pauses that shared value (and therefore the whole ring) so it's easy to
// read a logo, then resumes from exactly where it left off.
function OrbitRing({ icons, radius, duration }: { icons: OrbitIconData[]; radius: number; duration: number }) {
  const angle = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    controlsRef.current = animate(angle, 360, { duration, repeat: Infinity, ease: "linear" });
    return () => controlsRef.current?.stop();
  }, [angle, duration]);

  const pause = () => controlsRef.current?.pause();
  const resume = () => controlsRef.current?.play();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {icons.map((item) => (
        <OrbitIcon key={item.name} {...item} radius={radius} angle={angle} onPause={pause} onResume={resume} />
      ))}
    </div>
  );
}

const brandIconMap: { [key: string]: any } = {
  SiAnthropic,
  SiElevenlabs,
  SiVercel,
  SiLinear,
  SiStripe,
  SiCoinbase,
  SiNextdotjs,
  SiReact,
  SiVuedotjs,
  SiNodedotjs,
  SiLaravel,
  SiPython,
  SiKotlin,
  SiFlutter,
  SiN8N,
  SiAngular,
  SiJavascript,
  SiTailwindcss,
  SiRust,
  SiMongodb,
  SiSolidity,
  SiDigitalocean,
  SiDocker,
  FaJava,
  FaAws
};


const PROCESS_STEPS = [
  {
    stage: "1",
    shape: "circle",
    title: "Discovery & Technical Alignment",
    desc: "We align on business goals, user needs, and technical constraints to define a clear, execution-ready roadmap."
  },
  {
    stage: "2",
    shape: "leaf",
    title: "UX Strategy & Prototyping",
    desc: "User flows, wireframes, and interactive prototypes that validate assumptions before development begins."
  },
  {
    stage: "3",
    shape: "triangle",
    title: "Agile Development & Quality Assurance",
    desc: "Iterative development with continuous testing, security reviews, and transparent progress updates."
  },
  {
    stage: "4",
    shape: "square",
    title: "Launch, Scale & Continuous Support",
    desc: "Deployment, monitoring, performance optimization, and ongoing enhancements as your product evolves."
  }
];

const WHY_US_POINTS = [
  {
    icon: Cpu,
    title: "Senior Engineering Team",
    desc: "Work with experienced software engineers skilled in Laravel, AI, SaaS, cloud, and enterprise development."
  },
  {
    icon: CheckCircle,
    title: "Quality-First Development",
    desc: "Every project is tested for performance, security, and reliability before deployment."
  },
  {
    icon: Workflow,
    title: "On-Time Delivery",
    desc: "Agile workflows and clear milestones ensure predictable delivery without compromising quality."
  },
  {
    icon: MessageSquare,
    title: "Transparent Communication",
    desc: "Regular updates, dedicated project managers, and complete visibility throughout development."
  },
  {
    icon: Lock,
    title: "Secure & Confidential",
    desc: "Your ideas, source code, and business data are protected with strict NDAs and enterprise-grade security."
  },
  {
    icon: Layers,
    title: "Long-Term Partnership",
    desc: "From launch to future scaling, we provide ongoing support, maintenance, and continuous improvements."
  }
];

function WhyUsList({ points }: { points: typeof WHY_US_POINTS }) {
  const defaultIdx = points.findIndex(p => p.title.toLowerCase().includes("on-time")) !== -1
    ? points.findIndex(p => p.title.toLowerCase().includes("on-time"))
    : 2;
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultIdx);

  return (
    <div className="relative flex flex-col pl-6 border-l border-border/60 ml-2 gap-3">
      {points.map((point, idx) => {
        const isActive = activeIndex === idx;
        const isAnyActive = activeIndex !== null;

        return (
          <motion.div
            key={point.title}
            onClick={() => setActiveIndex(isActive ? defaultIdx : idx)}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(defaultIdx)}
            animate={{
              opacity: isAnyActive ? (isActive ? 1 : 0.65) : 1,
            }}
            transition={{ duration: 0.2 }}
            className="relative py-2.5 cursor-pointer group"
          >
            {/* Morphing Timeline Node on the vertical line */}
            <motion.div
              animate={{
                scale: isActive ? 1.25 : 1,
                backgroundColor: isActive ? "hsl(var(--primary))" : "hsl(var(--background))",
                borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
              className="absolute w-3.5 h-3.5 rounded-full border-2 -left-[32px] top-[16px] z-20 transition-colors duration-200"
              style={{
                backgroundColor: isActive ? "hsl(var(--primary))" : "hsl(var(--background))",
                borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
            />

            <div className="flex items-center justify-between">
              <h3 className={`text-lg sm:text-xl font-headline font-normal tracking-tight transition-colors duration-300 ${isActive ? "text-primary dark:text-purple-400" : "text-foreground/80 dark:text-neutral-200 group-hover:text-primary dark:group-hover:text-purple-300"}`}>
                {point.title}
              </h3>
              <span className={`text-base font-mono transition-colors duration-300 ${isActive ? "text-primary dark:text-purple-400" : "text-neutral-400 dark:text-neutral-500 group-hover:text-primary"}`}>
                {isActive ? "×" : "+"}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-secondary-text text-sm sm:text-base leading-relaxed pt-3 pr-4 font-sans">
                    {point.desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

const TESTIMONIALS = [
  { name: "John Carter", role: "CEO, Zenith SaaS", review: "Nitwebs delivered an AI analytics suite that exceeded our expectations. Extremely responsive team." },
  { name: "Sarah Vance", role: "CTO, Nova Financial", review: "Their developers wrote highly structured TypeScript libraries. Saved our native app rollout timeline." },
  { name: "Devon Reed", role: "VP of Product, Aether CRM", review: "Sprint deliveries were clean, documentation was perfect, staging URLs worked. Five-star partnership." },
  { name: "Elena Rostova", role: "Head of AI, Cirrus Systems", review: "They build genuine serverless architectures. Our uptime stats are incredible now." },
  { name: "Marcus Brody", role: "Operations Lead, Prysma Ltd", review: "Custom automation scripts reduced document search loops down to seconds." },
];

interface HomeMainProps {
  siteData?: any;
}

export default function HomeMain({ siteData: initialSiteData }: HomeMainProps) {
  const [siteData, setSiteData] = useState<any>(initialSiteData || null);
  useGlobalScramble();

  useEffect(() => {
    if (initialSiteData) {
      setSiteData(initialSiteData);
    }
  }, [initialSiteData]);

  useEffect(() => {
    if (siteData?.seo) {
      updatePageSEO(siteData.seo);
    } else if (siteData?.hero?.title) {
      updatePageSEO({
        title: siteData.hero.title,
        description: siteData.hero.desc
      });
    }
    if (siteData?.theme?.primaryColor) {
      const hsl = hexToHsl(siteData.theme.primaryColor);
      if (hsl) {
        document.documentElement.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        document.documentElement.style.setProperty("--primary-tint", `${hsl.h} ${hsl.s}% ${Math.min(95, hsl.l + 32)}%`);
      }
    }
  }, [siteData]);

  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalScroll > 0 ? window.scrollY / totalScroll : 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hero = (siteData?.hero && siteData.hero.title) ? siteData.hero : {
    badge: "AI-first software development",
    title: "Nitwebs",
    desc: "We engineer AI products, scalable software, SaaS platforms, mobile apps, and automation systems for ambitious companies worldwide."
  };

  const processList = (Array.isArray(siteData?.process) && siteData.process.length > 0) ? siteData.process : PROCESS_STEPS;
  const whyUsList = (Array.isArray(siteData?.whyUs) && siteData.whyUs.length > 0) ? siteData.whyUs : WHY_US_POINTS;
  const showcaseList = (Array.isArray(siteData?.showcase) && siteData.showcase.length > 0) ? siteData.showcase : [
    {
      tags: ["SaaS", "Next.js", "Claude API"],
      title: "Zenith Analytics",
      desc: "Predictive financial modeling suite that processes billions of market transactions to render automated investment routes.",
      metrics: [["Latency", "12ms"], ["Throughput", "15k/sec"]],
      image: "/dashboard.png",
    },
    {
      tags: ["Fintech", "React Native", "Stripe"],
      title: "Nova Digital Wallet",
      desc: "Mobile application enabling instant ledger swaps, bank settlement routes, and automated crypto portfolios.",
      metrics: [["Volume Swapped", "$14M+"], ["App Rating", "4.9/5"]],
      image: "/mobile.png",
    }
  ];
  const testimonialsList = (Array.isArray(siteData?.testimonials) && siteData.testimonials.length > 0) ? siteData.testimonials : TESTIMONIALS;
  const brandsList = (Array.isArray(siteData?.brands) && siteData.brands.length > 0) ? siteData.brands : [
    { name: "Anthropic", icon: "SiAnthropic" },
    { name: "ElevenLabs", icon: "SiElevenlabs" },
    { name: "Vercel", icon: "SiVercel" },
    { name: "Linear", icon: "SiLinear" },
    { name: "Stripe", icon: "SiStripe" },
    { name: "Coinbase", icon: "SiCoinbase" },
  ];

  const industriesHeader = siteData?.industriesHeader || {
    badge: "INDUSTRIES WE SERVE",
    title: "Powering Businesses Across Industries",
    desc: "From construction and healthcare to fintech and eCommerce, we build secure, scalable, and innovative software solutions tailored to the unique challenges of every industry."
  };

  const industriesList = siteData?.industries || [
    {
      title: "Construction",
      subheading: "Building Smarter Construction Operations",
      desc: "Streamline project management, workforce operations, scheduling, compliance, and reporting with modern construction software solutions.",
      icon: "Hammer",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Healthcare",
      subheading: "Transforming Patient Care Through Technology",
      desc: "Develop secure healthcare platforms, patient portals, appointment systems, and digital solutions that improve care delivery.",
      icon: "Activity",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "FinTech",
      subheading: "Powering the Future of Financial Services",
      desc: "Build reliable fintech applications, payment platforms, digital wallets, and financial software with enterprise-grade security.",
      icon: "CreditCard",
      image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Retail & eCommerce",
      subheading: "Creating Seamless Shopping Experiences",
      desc: "Create high-converting eCommerce platforms, inventory systems, customer portals, and omnichannel retail experiences for growth.",
      icon: "ShoppingBag",
      image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Manufacturing",
      subheading: "Intelligent Systems for Modern Manufacturing",
      desc: "Optimize production workflows, inventory management, operational visibility, and business processes with intelligent manufacturing software.",
      icon: "Factory",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Logistics & Supply Chain",
      subheading: "Connecting Every Mile of Your Supply Chain",
      desc: "Improve fleet management, shipment tracking, warehouse operations, and logistics efficiency through connected digital platforms.",
      icon: "Truck",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Real Estate",
      subheading: "Digital Solutions for Modern Real Estate",
      desc: "Develop property management systems, CRM platforms, listing portals, and digital experiences for modern real estate businesses.",
      icon: "Building2",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Education (EdTech)",
      subheading: "Empowering Learners Through Innovation",
      desc: "Build engaging learning platforms, student portals, virtual classrooms, and education management systems for digital learning.",
      icon: "GraduationCap",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  // Lazy-initialized (not `false`) so the first render already matches the
  // real viewport: IndustriesOrbit's useScroll binds to a ref that only
  // exists in the desktop-branch JSX, and Motion's ref-pending retry for
  // useScroll only fires once — a false-then-true flip after mount closes
  // that retry window before the ref ever attaches, leaving scroll
  // progress permanently stuck at 0.
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setWindowWidth(window.innerWidth);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const middleRadius = windowWidth < 640 ? 160 : windowWidth < 1024 ? 220 : 290;
  const outerRadius = windowWidth < 640 ? 220 : windowWidth < 1024 ? 290 : 360;

  const showcaseScrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: showcaseScrollY } = useScroll({
    target: showcaseScrollRef,
    offset: ["start start", "end end"]
  });

  const slidePct = showcaseList.length > 2 ? (showcaseList.length - 2) * 51.5 : 0;
  const showcaseX = useTransform(showcaseScrollY, [0, 1], ["0%", `-${slidePct}%`]);

  const { isTransitioned, shouldPlay } = useIntroAnimation();

  return (
    <motion.div
      initial={shouldPlay ? { opacity: 0 } : false}
      animate={{ opacity: !shouldPlay || isTransitioned ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative isolate w-full min-h-screen flex flex-col bg-background text-foreground selection:bg-primary-tint selection:text-foreground"
    >
      {/* Blueprint grid lines */}
      <GridLines />

      {/* Header / Navbar */}
      <Header logoConfig={siteData?.logo} scrollProgress={scrollProgress} />

      {/* Hero Section */}
      <section id="hero" className="light relative w-full pt-16 pb-4 lg:pt-16 lg:pb-12 px-6 overflow-hidden">
        <GridDivider />
        <div className="relative max-w-6xl mx-auto min-h-[540px] sm:min-h-[600px] lg:min-h-[780px] flex items-center justify-center overflow-hidden">
          {/* Decorative concentric rings behind the headline — the middle and
              outer rings each carry an orbiting set of icons. Sized so that
              radius + icon size never exceeds this box, at any angle. */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] rounded-full border border-border/60 shadow-[0_0_15px_rgba(99,102,241,0.04)]" />
            <div className="absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] lg:w-[580px] lg:h-[580px] rounded-full border border-border/80 shadow-[0_0_20px_rgba(99,102,241,0.06)]" />
            <div className="absolute w-[440px] h-[440px] sm:w-[580px] sm:h-[580px] lg:w-[720px] lg:h-[720px] rounded-full border border-border/80 shadow-[0_0_25px_rgba(99,102,241,0.08)]" />
          </div>

          {/* Tech-stack icons orbiting the headline, clockwise, slowly, at two speeds */}
          <OrbitRing icons={MIDDLE_RING_ICONS} radius={middleRadius} duration={100} />
          <OrbitRing icons={OUTER_RING_ICONS} radius={outerRadius} duration={160} />

          <motion.div
            className="relative z-10 flex flex-col items-center text-center max-w-[260px] sm:max-w-md mx-auto"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.h1
              variants={fadeUp}
              className="text-[19px] sm:text-[28px] md:text-[36px] font-normal leading-[1.2] tracking-[-0.02em] font-headline text-foreground"
            >
              {hero.title}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-secondary-text text-xs sm:text-base max-w-[240px] sm:max-w-sm mt-2">
              {hero.desc}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-2 mt-4">
              <SpecularButton
                onClick={() => scrollToSection("contact")}
                size="md"
                radius={12}
                tint="hsl(var(--foreground))"
                tintOpacity={1}
                textColor="hsl(var(--background))"
                lineColor="hsl(var(--primary))"
                baseColor="hsl(var(--border))"
                className="px-6 py-2.5 text-sm font-semibold"
                thickness={2.5}
                intensity={2}
              >
                Start Your Project
              </SpecularButton>
              <SpecularButton
                onClick={() => scrollToSection("showcase")}
                size="md"
                radius={12}
                tint="transparent"
                tintOpacity={0}
                textColor="hsl(var(--foreground))"
                lineColor="hsl(var(--primary))"
                baseColor="hsl(var(--border))"
                className="px-6 py-2.5 text-sm font-semibold"
                thickness={2.5}
              >
                View Our Work
              </SpecularButton>
            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* Trusted logos */}
      <section className="relative py-7 sm:py-8 px-6 bg-transparent">
        <GridDivider />
        <Reveal className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-secondary-text text-xs uppercase tracking-widest text-center md:text-left shrink-0">
              Trusted by high-growth startups
            </div>
            <div className="marquee-container w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)] select-none">
              <div className="animate-marquee flex items-center gap-6 sm:gap-12 py-1">
                {brandsList.concat(brandsList).map((logo: any, idx: number) => {
                  const BrandIcon = brandIconMap[logo.icon] || SiVercel;
                  return (
                    <div key={idx} className="flex items-center justify-center shrink-0 grayscale opacity-100 hover:grayscale-0 transition-all">
                      {logo.imageUrl ? (
                        <img src={logo.imageUrl} alt={logo.name || "Brand logo"} className="h-16 sm:h-20 max-w-[220px] sm:max-w-[300px] object-contain" />
                      ) : (
                        <BrandIcon className="w-16 h-16 sm:w-20 sm:h-20 text-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-16 sm:py-24 px-6 bg-transparent">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">OUR SERVICES</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
              Services Built for Modern Digital Businesses
            </h2>
            <p className="text-secondary-text text-base sm:text-lg font-sans leading-relaxed">
              From product engineering to enterprise platforms and growth enablement, we help teams build, modernize, and scale with confidence.
            </p>
          </Reveal>

          {/* Grid Container with crisp border lines matching reference */}
          <div className="border border-border rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-surface/30 backdrop-blur-md divide-y md:divide-y-0 md:divide-x divide-border">
            {(siteData?.services && siteData.services.length > 0
              ? siteData.services.map((s: any) => {
                  const rawLines = s.desc
                    ? s.desc.split(/\r?\n|•/).map((l: string) => l.trim()).filter(Boolean)
                    : [];
                  return {
                    title: s.title,
                    link: s.link || "",
                    points: rawLines.length > 0
                      ? rawLines.map((line: string) => ({ raw: line }))
                      : [{ bold: s.title, text: "engineering & platform services" }]
                  };
                })
              : [
                  {
                    title: "Product Engineering",
                    link: "",
                    points: [
                      { bold: "Full-cycle product development", text: "(MVP to scale)" },
                      { bold: "Web, mobile, and SaaS", text: "application engineering" },
                      { bold: "Cloud-native, API-first,", text: "and headless architectures" },
                      { bold: "Senior-led delivery", text: "with clear technical ownership" }
                    ]
                  },
                  {
                    title: "Enterprise & Platform Modernization",
                    link: "",
                    points: [
                      { bold: "Legacy system modernization", text: "and re-architecture" },
                      { bold: "ERP implementation", text: "& customization" },
                      { bold: "CMS, platform, and integration", text: "modernization" },
                      { bold: "Cloud migration", text: "and infrastructure optimization" }
                    ]
                  },
                  {
                    title: "UI/UX & Experience Design",
                    link: "",
                    points: [
                      { bold: "Product UX", text: "and interaction design" },
                      { bold: "Design systems", text: "for scalable platforms" },
                      { bold: "User research, usability testing,", text: "and validation" },
                      { bold: "Conversion-focused interfaces", text: "for web and mobile" }
                    ]
                  },
                  {
                    title: "Growth & Digital Enablement",
                    link: "",
                    points: [
                      { bold: "SEO, performance marketing,", text: "and analytics" },
                      { bold: "Branding and digital identity", text: "systems" },
                      { bold: "E-commerce platforms", text: "and MarTech enablement" },
                      { bold: "Experimentation, CRO,", text: "and performance optimization" }
                    ]
                  },
                  {
                    title: "Data, AI & Platform Intelligence",
                    link: "",
                    points: [
                      { bold: "Data architecture, pipelines,", text: "and modern data stacks" },
                      { bold: "Analytics, BI dashboards,", text: "and decision platforms" },
                      { bold: "AI/ML enablement, applied AI,", text: "and workflow automation" }
                    ]
                  },
                  {
                    title: "Dedicated Teams & Technology Partnerships",
                    link: "",
                    points: [
                      { bold: "Dedicated product, platform,", text: "and engineering teams" },
                      { bold: "Staff augmentation", text: "with clear ownership and accountability" },
                      { bold: "Flexible engagement models", text: "aligned to growth stages" }
                    ]
                  }
                ]
            ).map((box: any, idx: number) => {
              const hasLink = Boolean(box.link && String(box.link).trim() !== "");

              const renderInline = (str: string) => {
                if (!str) return null;
                const tokens = str.split(/(\*\*.*?\*\*|\*.*?\*|<b>.*?<\/b>|<i>.*?<\/i>)/g);
                return tokens.map((part, i) => {
                  if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("<b>") && part.endsWith("</b>"))) {
                    const txt = part.startsWith("**") ? part.slice(2, -2) : part.slice(3, -4);
                    return <span key={i} className="font-medium text-foreground">{txt}</span>;
                  }
                  if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("<i>") && part.endsWith("</i>"))) {
                    const txt = part.startsWith("*") ? part.slice(1, -1) : part.slice(3, -4);
                    return <em key={i} className="italic text-foreground">{txt}</em>;
                  }
                  return <span key={i}>{part}</span>;
                });
              };

              return (
                <motion.div
                  key={box.title + idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  onClick={() => {
                    if (hasLink) {
                      const target = box.link.startsWith("/") ? box.link : `/${box.link}`;
                      navigate(target);
                    }
                  }}
                  className={`p-6 sm:p-7 flex flex-col justify-between border-b border-border transition-colors group ${
                    hasLink ? "hover:bg-surface/50 cursor-pointer" : "hover:bg-surface/40"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h3 className="text-lg sm:text-xl font-headline font-normal text-foreground leading-snug group-hover:text-primary transition-colors">
                        {box.title}
                      </h3>
                      {hasLink && (
                        <ArrowUpRight className="w-4 h-4 text-secondary-text group-hover:text-primary transition-colors shrink-0" />
                      )}
                    </div>
                    <ul className="flex flex-col gap-2 font-sans text-xs sm:text-sm text-secondary-text">
                      {box.points.map((pt: any, pIdx: number) => (
                        <li key={pIdx} className="flex items-start gap-2 leading-normal">
                          <span className="text-secondary-text/60 shrink-0 select-none text-xs mt-0.5">•</span>
                          <span>
                            {pt.raw ? (
                              renderInline(pt.raw)
                            ) : (
                              <>
                                <span className="font-medium text-foreground">{pt.bold}</span> {pt.text}
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <AboutUsSection glitchColors={siteData?.theme?.glitchColors} aboutData={siteData?.aboutUs || siteData?.about} />

      {/* Process Section */}
      <section id="process" className="relative py-24 px-6 bg-transparent">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-4xl mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">OUR DEVELOPMENT PROCESS</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
              Our Development Process
            </h2>
            <p className="text-secondary-text text-base sm:text-lg font-sans leading-relaxed">
              A structured, product-first approach designed to reduce risk, ensure clarity, and deliver predictable outcomes.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processList.map((step: any, idx: number) => (
              <motion.div
                key={step.stage}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <SpotlightCard
                  className="h-full flex flex-col gap-4 sm:min-h-[300px] sm:justify-between p-5 sm:p-6 rounded-2xl border border-border/80 shadow-lg hover:border-primary/50 transition-all duration-300 group"
                  spotlightColor="rgba(168, 85, 247, 0.25)"
                >
                  <div>
                    {/* Top Stage Number paired with Geometric Vector Accent */}
                    <div className="flex items-center gap-2.5 mb-3 sm:mb-5">
                      {idx === 0 && (
                        <svg viewBox="0 0 40 40" className="w-7 h-7 fill-primary shrink-0">
                          <path d="M 20 0 A 20 20 0 0 1 20 40 Z" />
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg viewBox="0 0 40 40" className="w-7 h-7 fill-primary shrink-0">
                          <path d="M 0 20 C 0 8.95 8.95 0 20 0 L 40 0 L 40 20 C 40 31.05 31.05 40 20 40 C 8.95 40 0 31.05 0 20 Z" />
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg viewBox="0 0 40 40" className="w-7 h-7 fill-primary shrink-0">
                          <polygon points="0,40 20,0 40,40" />
                        </svg>
                      )}
                      {idx === 3 && (
                        <svg viewBox="0 0 40 40" className="w-7 h-7 fill-primary shrink-0">
                          <rect x="0" y="0" width="36" height="36" rx="4" />
                        </svg>
                      )}
                      <span className="text-4xl sm:text-5xl font-headline font-normal tracking-tight text-white dark:text-foreground select-none">
                        {String(step.stage).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Stage Title */}
                    <h3 className="text-lg sm:text-xl font-headline font-normal text-white dark:text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                  </div>

                  {/* Stage Description */}
                  <p className="text-white/65 dark:text-secondary-text text-xs sm:text-sm font-sans leading-relaxed">
                    {step.desc}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Showcase Section */}
      <section
        id="showcase"
        ref={showcaseScrollRef}
        className={isDesktop && showcaseList.length > 2 ? "relative h-[250vh]" : "relative py-24 px-6"}
      >
        <GridDivider />
        {isDesktop && showcaseList.length > 2 ? (
          <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
            {/* Blueprint grid lines wrapper inside sticky */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="max-w-[1360px] mx-auto h-full relative">
                <div className="absolute inset-y-0 left-0 border-l border-border" />
                <div className="absolute inset-y-0 right-0 border-l border-border" />
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 w-full relative z-10 flex flex-col gap-10">
              <Reveal>
                <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-2">
                  {siteData?.showcaseHeader?.badge || "Portfolio Showcase"}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground leading-[1.15] mb-4">
                  {siteData?.showcaseHeader?.title || "Flagship digital products"}
                </h2>
                <p className="text-secondary-text text-lg max-w-2xl">
                  {siteData?.showcaseHeader?.desc || "A few of the SaaS platforms, fintech gateways, and AI modules we've designed and deployed."}
                </p>
              </Reveal>

              <div className="relative w-full overflow-visible">
                <motion.div
                  style={{ x: showcaseX }}
                  className="flex gap-6 w-full"
                >
                  {showcaseList.map((project: any, pIdx: number) => (
                    <motion.div
                      key={project.title}
                      className="card-panel rounded-2xl overflow-hidden flex flex-col w-[calc(50%-12px)] min-w-[calc(50%-12px)] shrink-0 group transition-all duration-300 hover:shadow-xl hover:border-primary/30"
                    >
                      <div className="p-7 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-wrap gap-2">
                            {(project.tags || []).map((tag: string) => (
                              <span key={tag} className="text-[10px] font-mono uppercase bg-muted text-secondary-text px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-bold font-mono text-primary/30 group-hover:text-primary transition-colors">
                            0{pIdx + 1}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                        <p className="text-secondary-text text-sm mb-4 leading-relaxed">{project.desc}</p>

                      </div>
                      <div className="relative overflow-hidden aspect-video border-t border-border bg-muted">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <Reveal className="max-w-2xl mb-16">
              <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">
                {siteData?.showcaseHeader?.badge || "Portfolio Showcase"}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
                {siteData?.showcaseHeader?.title || "Flagship digital products"}
              </h2>
              <p className="text-secondary-text text-lg">
                {siteData?.showcaseHeader?.desc || "A few of the SaaS platforms, fintech gateways, and AI modules we've designed and deployed."}
              </p>
            </Reveal>

            <div className="flex lg:grid lg:grid-cols-2 gap-6 md:gap-8 overflow-x-auto lg:overflow-x-visible pb-6 lg:pb-0 scrollbar-hide snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0">
              {showcaseList.map((project: any, pIdx: number) => (
                <div
                  key={project.title}
                  className="snap-start w-[85vw] sm:w-[450px] lg:w-auto shrink-0 card-panel rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:border-primary/30"
                >
                  <div className="p-7 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-wrap gap-2">
                        {(project.tags || []).map((tag: string) => (
                          <span key={tag} className="text-[10px] font-mono uppercase bg-muted text-secondary-text px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-bold font-mono text-primary/30 group-hover:text-primary transition-colors">
                        0{pIdx + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                    <p className="text-secondary-text text-sm mb-4 leading-relaxed">{project.desc}</p>

                  </div>
                  <div className="relative overflow-hidden aspect-video border-t border-border bg-neutral-100">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Why Choose Nitwebs? Section */}
      <section id="why-us" className="relative py-24 px-6 overflow-hidden">
        <GridDivider />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column (Sticky Title & Subtext) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full lg:sticky lg:top-28">
              <div>
                <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">
                  WHY CHOOSE NITWEBS?
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-6 leading-tight">
                  Your Trusted <br />Technology Partner
                </h2>
                <p className="text-secondary-text text-base leading-relaxed max-w-md">
                  We build scalable software with transparent communication, modern engineering, and long-term support—helping businesses across Europe, Australia, and India grow with confidence.
                </p>
              </div>
            </div>

            {/* Right Column (Minimal List with Sibling Dimming) */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <WhyUsList points={whyUsList} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 marquee-container overflow-hidden">
        <GridDivider />
        <Reveal className="max-w-6xl mx-auto px-6 mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">
              {siteData?.testimonialsHeader?.badge || "Partner Testimonials"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal font-headline text-foreground leading-[1.15]">
              {siteData?.testimonialsHeader?.title || "Client transformed outcomes"}
            </h2>
            {siteData?.testimonialsHeader?.desc && (
              <p className="text-secondary-text text-base mt-4 leading-relaxed">
                {siteData.testimonialsHeader.desc}
              </p>
            )}
          </div>

          {/* Trust rating badges */}
          <div className="flex flex-wrap gap-4 items-center shrink-0">
            {/* Google Reviews Badge */}
            <div className="flex items-center gap-3 bg-muted/50 backdrop-blur-sm border border-border px-5 py-3 rounded-2xl hover:border-primary/40 hover:bg-background hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default select-none">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-secondary-text uppercase tracking-wider leading-none mb-1">Reviewed on</span>
                <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors leading-none">Google Reviews</span>
              </div>
            </div>

            {/* Trustpilot Badge */}
            <div className="flex items-center gap-3 bg-muted/50 backdrop-blur-sm border border-border px-5 py-3 rounded-2xl hover:border-primary/40 hover:bg-background hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default select-none">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l2.81 6.63 7.19.62-5.46 4.73 1.64 7.03L12 17.27V2z" fill="#00B67A" />
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73-1.64 7.03L12 17.27V2z" fill="#00b67a" opacity="0.6" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-secondary-text uppercase tracking-wider leading-none mb-1">Reviewed on</span>
                <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors leading-none">Trustpilot</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="max-w-6xl mx-auto px-6">
          <div className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] select-none">
            <div className="animate-marquee flex items-center gap-6">
              {testimonialsList.concat(testimonialsList).map((t: any, idx: number) => (
                <div key={idx} className="card-panel rounded-2xl p-6 w-[320px] shrink-0">
                  <div className="flex items-center gap-1 text-primary mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-secondary-text text-sm mb-4">"{t.review}"</p>
                  <div className="border-t border-border pt-3">
                    <span className="text-xs font-bold text-foreground block">{t.name}</span>
                    <span className="text-[10px] text-secondary-text">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve Section (3D Orbit) */}
      <IndustriesOrbit
        header={industriesHeader}
        items={industriesList}
        isDesktop={isDesktop}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* SaaS Specialty Showcase Section */}
      <SaasShowcaseSection data={siteData?.saasShowcase} />

      {/* Life at Nitwebs Team Gallery Section */}
      <TeamGallerySection />

      {/* Contact + CTA Section */}
      <ContactSection />

      {/* Footer */}
      <Footer logoConfig={siteData?.logo} />
    </motion.div>
  );
}
