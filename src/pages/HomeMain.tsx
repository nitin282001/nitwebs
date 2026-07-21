import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate } from "motion/react";
import type { AnimationPlaybackControls } from "motion/react";
import type { IconType } from "react-icons";
import { useIntroAnimation } from "../context/IntroContext";
import {
  Cpu,
  Layers,
  Globe,
  Workflow,
  Cloud,
  Palette,
  Star,
  CheckCircle,
  MessageSquare,
  Lock
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
import ContactSection from "../sections/ContactSection";



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
        className="rounded-full bg-background border border-border shadow-sm flex items-center justify-center cursor-pointer transition-transform duration-200 ease-out group-hover:scale-125"
        style={{ width: ORBIT_ICON_HALF * 2, height: ORBIT_ICON_HALF * 2 }}
      >
        <Icon style={{ color }} className="w-5 h-5" />
      </div>
      <span className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 mt-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

const SERVICES = [
  {
    icon: Cpu,
    title: "AI Engineering",
    desc: "Build intelligent products powered by AI—from custom AI agents and business automation to LLM integrations, chatbots, document intelligence, and workflow optimization.",
  },
  {
    icon: Layers,
    title: "Custom Software & SaaS",
    desc: "Develop enterprise-grade platforms tailored to your business. We build CRMs, ERPs, SaaS products, portals, dashboards, and internal systems that scale effortlessly.",
  },
  {
    icon: Globe,
    title: "Web & Mobile Applications",
    desc: "Create fast, secure, and engaging digital experiences with responsive websites, progressive web apps, and cross-platform mobile applications built for performance.",
  },
  {
    icon: Workflow,
    title: "Automation & System Integration",
    desc: "Eliminate repetitive work by connecting your existing tools through APIs, payment gateways, CRM integrations, ERP systems, messaging platforms, and automated workflows.",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure & DevOps",
    desc: "Deploy confidently with secure, scalable cloud architecture, CI/CD pipelines, Docker containers, database optimization, monitoring, and high-availability infrastructure.",
  },
  {
    icon: Palette,
    title: "UI/UX & Product Design",
    desc: "Design intuitive digital experiences that users love. From research and wireframes to polished interfaces, we create products that are beautiful, functional, and conversion-focused.",
  },
];

const PROCESS_STEPS = [
  { stage: "01", title: "Discovery", desc: "We understand your business goals, users, and requirements to create the right technology strategy." },
  { stage: "02", title: "Design", desc: "We craft intuitive UI/UX and scalable system architecture focused on performance and user experience." },
  { stage: "03", title: "Development", desc: "Our team builds secure custom software, SaaS platforms, websites, and mobile apps using modern technologies." },
  { stage: "04", title: "Launch & Support", desc: "We deploy, monitor, and continuously improve your product to ensure long-term growth and reliability." },
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

const iconMap: { [key: string]: any } = { Cpu, Layers, Globe, Workflow, Cloud, Palette, CheckCircle, MessageSquare, Lock };

export default function HomeMain() {
  const [siteData, setSiteData] = useState<any>(null);
  useGlobalScramble();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/content");
        if (!res.ok) throw new Error("API content failed");
        const data = await res.json();
        setSiteData(data);
      } catch (err) {
        console.warn("Express backend API offline or content empty. Using static content fallbacks.");
      }
    };
    loadContent();
  }, []);

  useEffect(() => {
    if (siteData?.theme?.primaryColor) {
      const hsl = hexToHsl(siteData.theme.primaryColor);
      if (hsl) {
        document.documentElement.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        document.documentElement.style.setProperty("--primary-tint", `${hsl.h} ${hsl.s}% ${Math.min(95, hsl.l + 32)}%`);
      }
    }
  }, [siteData]);

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

  const hero = siteData?.hero || {
    badge: "AI-first software development",
    title: "AI-first software that builds businesses",
    desc: "We engineer AI products, scalable software, SaaS platforms, mobile apps, and automation systems for ambitious companies worldwide."
  };

  const servicesList = siteData?.services || SERVICES;
  const processList = siteData?.process || PROCESS_STEPS;
  const whyUsList = siteData?.whyUs || WHY_US_POINTS;
  const showcaseList = siteData?.showcase || [
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
  const testimonialsList = siteData?.testimonials || TESTIMONIALS;
  const brandsList = siteData?.brands || [
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
      icon: "Hammer"
    },
    {
      title: "Healthcare",
      subheading: "Transforming Patient Care Through Technology",
      desc: "Develop secure healthcare platforms, patient portals, appointment systems, and digital solutions that improve care delivery.",
      icon: "Activity"
    },
    {
      title: "FinTech",
      subheading: "Powering the Future of Financial Services",
      desc: "Build reliable fintech applications, payment platforms, digital wallets, and financial software with enterprise-grade security.",
      icon: "CreditCard"
    },
    {
      title: "Retail & eCommerce",
      subheading: "Creating Seamless Shopping Experiences",
      desc: "Create high-converting eCommerce platforms, inventory systems, customer portals, and omnichannel retail experiences for growth.",
      icon: "ShoppingBag"
    },
    {
      title: "Manufacturing",
      subheading: "Intelligent Systems for Modern Manufacturing",
      desc: "Optimize production workflows, inventory management, operational visibility, and business processes with intelligent manufacturing software.",
      icon: "Factory"
    },
    {
      title: "Logistics & Supply Chain",
      subheading: "Connecting Every Mile of Your Supply Chain",
      desc: "Improve fleet management, shipment tracking, warehouse operations, and logistics efficiency through connected digital platforms.",
      icon: "Truck"
    },
    {
      title: "Real Estate",
      subheading: "Digital Solutions for Modern Real Estate",
      desc: "Develop property management systems, CRM platforms, listing portals, and digital experiences for modern real estate businesses.",
      icon: "Building2"
    },
    {
      title: "Education (EdTech)",
      subheading: "Empowering Learners Through Innovation",
      desc: "Build engaging learning platforms, student portals, virtual classrooms, and education management systems for digital learning.",
      icon: "GraduationCap"
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

        {/* Trusted logos */}
        <div className="relative w-full pt-10 mt-12">
          {/* Full-width edge-to-edge horizontal divider line with corner plus marks */}
          <div className="absolute inset-x-0 top-0 h-px bg-border z-10">
            <div className="max-w-6xl mx-auto relative h-full">
              <span className="text-border select-none leading-none text-[13px] absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2">+</span>
              <span className="text-border select-none leading-none text-[13px] absolute right-0 top-0 translate-x-1/2 -translate-y-1/2">+</span>
            </div>
          </div>

          <Reveal className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-secondary-text text-xs uppercase tracking-widest text-center md:text-left shrink-0">
                Trusted by high-growth startups
              </div>
              <div className="marquee-container w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)] select-none">
                <div className="animate-marquee flex items-center gap-16 py-1">
                  {brandsList.concat(brandsList).map((logo: any, idx: number) => {
                    const BrandIcon = brandIconMap[logo.icon] || SiVercel;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                        {logo.imageUrl ? (
                          <img src={logo.imageUrl} alt={logo.name} className="h-6 max-w-[120px] object-contain" />
                        ) : (
                          <BrandIcon className="w-5 h-5 text-foreground" />
                        )}
                        <span className="text-sm font-semibold text-foreground">{logo.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 px-6">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">OUR EXPERTISE</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
              Building Technology That Powers Modern Businesses
            </h2>
            <p className="text-secondary-text text-lg">
              We combine world-class engineering, AI, cloud infrastructure, and product strategy to build scalable software that helps businesses innovate, automate, and grow with confidence.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((service: any) => {
              const ServiceIcon = typeof service.icon === "string" ? (iconMap[service.icon] || Cpu) : (service.icon || Cpu);
              return (
                <motion.div
                  key={service.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="card-panel group rounded-2xl p-7 flex flex-col gap-4 cursor-default"
                >
                  <div className="w-11 h-11 bg-background text-primary rounded-xl flex items-center justify-center border border-border shadow-sm transition-all duration-300 group-hover:bg-primary-tint/40 group-hover:border-primary/20 group-hover:shadow-md group-hover:scale-105">
                    <ServiceIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                    <p className="text-secondary-text text-sm leading-relaxed">{service.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* About Us Section */}
      <AboutUsSection glitchColors={siteData?.theme?.glitchColors} />

      {/* Process Section */}
      <section id="process" className="relative py-24 px-6 bg-surface/60">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">OUR DEVELOPMENT PROCESS</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
              From Idea to Launch
            </h2>
            <p className="text-secondary-text text-lg">
              We follow a streamlined software development process that delivers scalable, secure, and high-performance digital solutions for businesses across Europe, Australia, and India.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Background connecting line on desktop */}
            <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-border via-primary/30 to-border -z-10" />

            {processList.map((step: any, idx: number) => (
              <motion.div
                key={step.stage}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="card-panel group rounded-2xl p-7 bg-background relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl cursor-default flex flex-col justify-between min-h-[220px]"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-150" />

                {/* Accent indicator line at the top */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-transparent transition-all duration-300 group-hover:bg-primary" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded bg-primary/15 text-primary border border-primary/30 dark:bg-primary/30 dark:text-purple-200 dark:border-primary/50 shadow-sm">
                      STAGE {step.stage}
                    </span>
                    <span className="text-4xl font-bold font-headline select-none text-foreground/5 transition-all duration-500 group-hover:text-primary/10 group-hover:-translate-y-1">
                      {step.stage}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-4 mb-3 transition-colors duration-300 group-hover:text-primary">
                    {step.title}
                  </h3>
                  <p className="text-secondary-text text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Visual indicator of flow (arrow) on desktop */}
                {idx < 3 && (
                  <div className="hidden lg:flex absolute top-[35px] -right-[19px] w-[20px] h-[20px] rounded-full bg-background border border-border items-center justify-center text-[10px] text-secondary-text z-20 transition-all duration-300 group-hover:border-primary group-hover:text-primary">
                    →
                  </div>
                )}
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
                        <div className="border-t border-border pt-4 flex gap-8">
                          {(project.metrics || []).map(([label, val]: [string, string]) => (
                            <div key={label}>
                              <div className="text-[10px] font-mono uppercase text-secondary-text/70">{label}</div>
                              <div className="text-lg font-normal text-foreground font-headline mt-0.5">{val}</div>
                            </div>
                          ))}
                        </div>
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
                    <div className="border-t border-border pt-4 flex gap-8">
                      {(project.metrics || []).map(([label, val]: [string, string]) => (
                        <div key={label}>
                          <div className="text-[10px] font-mono uppercase text-secondary-text/70">{label}</div>
                          <div className="text-lg font-normal text-foreground font-headline mt-0.5">{val}</div>
                        </div>
                      ))}
                    </div>
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

      {/* Contact + CTA Section */}
      <ContactSection />

      {/* Footer */}
      <Footer logoConfig={siteData?.logo} />
    </motion.div>
  );
}
