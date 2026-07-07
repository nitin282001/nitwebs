import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from "motion/react";
import type { AnimationPlaybackControls } from "motion/react";
import type { IconType } from "react-icons";
import {
  ArrowRight,
  Cpu,
  Layers,
  Globe,
  Workflow,
  Cloud,
  Palette,
  Mail,
  Phone,
  MapPin,
  Star,
  Menu,
  X,
  Send,
  CheckCircle,
  ChevronDown,
  ChevronRight,
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
const EASE = [0.22, 1, 0.36, 1] as const;

// Animation variants shared across sections
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// Scroll-triggered reveal wrapper
function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered staggered grid wrapper
function StaggerGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

// Fixed-width blueprint grid frame — a capped canvas width (not viewport-relative),
// slightly wider than the max-w-6xl content column so lines never collide with
// text, but narrow enough that wide monitors show plain background beyond it —
// matching cal.com, which does not stretch its grid frame to the viewport edge.
const GRID_WIDTH = "max-w-[1360px]";

// Fixed vertical blueprint-grid lines running the full height of the page
function GridLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className={`${GRID_WIDTH} mx-auto h-full relative`}>
        <div className="absolute inset-y-0 left-0 border-l border-border" />
        <div className="absolute inset-y-0 right-0 border-l border-border" />
      </div>
    </div>
  );
}

// Plus-mark glyph used at grid line intersections
function PlusMark({ className }: { className?: string }) {
  return (
    <span className={`text-border select-none leading-none text-[13px] ${className ?? ""}`}>
      +
    </span>
  );
}

// Horizontal section divider aligned to the blueprint grid, with corner plus-marks
function GridDivider() {
  return (
    <div className="absolute inset-x-0 top-0 h-px bg-border z-10">
      <div className={`${GRID_WIDTH} mx-auto relative h-full`}>
        <PlusMark className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
        <PlusMark className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}

// Radii (px) of the two rings that carry icons — must match the 580px/720px
// -diameter circles drawn behind the hero headline. Bounded on both sides:
// must stay >= ~269px (the corner-to-corner distance of the centered text
// block, at its current smaller size, once expanded by half an icon on
// every side) so a fully-rotating icon can never cross behind the text —
// measured and verified in-browser, not estimated — and radius + icon size
// must never exceed the hero's own bounds at any angle, so icons are never
// clipped mid-shape either. Kept as small as that allows so the whole
// hero (rings + text) fits in one viewport without scrolling.
const RING_RADIUS = { middle: 290, outer: 360 };

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
  const x = useTransform(angle, (a) => {
    const rad = ((a + baseAngle) * Math.PI) / 180;
    return radius * Math.sin(rad);
  });
  const y = useTransform(angle, (a) => {
    const rad = ((a + baseAngle) * Math.PI) / 180;
    return -radius * Math.cos(rad);
  });

  return (
    <motion.div
      className="group absolute hidden xl:block pointer-events-auto"
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

const NitwebsLogo = () => (
  <div className="flex items-center gap-2 select-none">
    <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-primary to-indigo-500 rounded-lg">
      <span className="font-normal text-base text-white font-headline">N</span>
    </div>
    <span className="text-lg font-normal tracking-tight text-foreground font-headline">
      nit<span className="text-primary">webs</span>
    </span>
  </div>
);

const BRAND_LOGOS = [
  { name: "Anthropic", icon: SiAnthropic },
  { name: "ElevenLabs", icon: SiElevenlabs },
  { name: "Vercel", icon: SiVercel },
  { name: "Linear", icon: SiLinear },
  { name: "Stripe", icon: SiStripe },
  { name: "Coinbase", icon: SiCoinbase },
];

const SERVICES = [
  {
    icon: Cpu,
    title: "AI Development",
    desc: "Autonomous agents, custom LLM integrations, and neural search systems built for real workflows.",
  },
  {
    icon: Layers,
    title: "Custom Software & SaaS",
    desc: "Tailored applications and multi-tenant platforms engineered for complex, growing businesses.",
  },
  {
    icon: Globe,
    title: "Web & Mobile Apps",
    desc: "Fast, responsive websites and fluid native experiences across every device.",
  },
  {
    icon: Workflow,
    title: "Automation & Data",
    desc: "Connect operations, CRM, and reporting so manual pipelines disappear.",
  },
  {
    icon: Cloud,
    title: "Cloud & Security",
    desc: "Scalable cloud infrastructure with banking-grade security and edge deployment.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "High-fidelity prototypes and design systems that make products feel effortless.",
  },
];

const PROCESS_STEPS = [
  { stage: "01", title: "Discovery", desc: "We align on your goals, users, and constraints before writing a line of code." },
  { stage: "02", title: "Design", desc: "Clean interface prototyping, typography systems, and user-flow mapping." },
  { stage: "03", title: "Build", desc: "Strictly-typed, tested code shipped on predictable weekly sprints." },
  { stage: "04", title: "Launch", desc: "Production deployment, monitoring, and ongoing support as you scale." },
];

const TESTIMONIALS = [
  { name: "John Carter", role: "CEO, Zenith SaaS", review: "Nitwebs delivered an AI analytics suite that exceeded our expectations. Extremely responsive team." },
  { name: "Sarah Vance", role: "CTO, Nova Financial", review: "Their developers wrote highly structured TypeScript libraries. Saved our native app rollout timeline." },
  { name: "Devon Reed", role: "VP of Product, Aether CRM", review: "Sprint deliveries were clean, documentation was perfect, staging URLs worked. Five-star partnership." },
  { name: "Elena Rostova", role: "Head of AI, Cirrus Systems", review: "They build genuine serverless architectures. Our uptime stats are incredible now." },
  { name: "Marcus Brody", role: "Operations Lead, Prysma Ltd", review: "Custom automation scripts reduced document search loops down to seconds." },
];

const FAQS = [
  { q: "How long does a typical software project take?", a: "Standard enterprise applications and AI pipelines are shipped within 8 to 12 weeks. We work on strict bi-weekly sprint delivery periods." },
  { q: "Do you hand over full source repositories?", a: "Yes. Every line of code we write is fully handed over in Git repositories with complete ownership rights." },
  { q: "How does dedicated developer embedding work?", a: "We embed senior programmers directly inside your Slack and GitHub workflows to speed up your roadmap." },
  { q: "What support packages do you offer?", a: "We provide 24/7 monitoring, proactive infrastructure updates, and dedicated maintenance agreements." },
  { q: "Can we start with a small pilot project?", a: "Yes. We offer rapid 4-week prototype pilots to validate architecture and user flows before scaling up." },
];

interface CounterProps {
  value: string;
  suffix?: string;
}

function Counter({ value, suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const end = parseInt(value.replace(/\D/g, ""), 10);
    const controls = animate(0, end, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState(0);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(0);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Global Scroll Listeners (Lenis, Progress Bar, Sticky Navbar)
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
      setScrollProgress(window.scrollY / totalScroll);
      setHeaderSolid(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMsg) return;
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSuccess(true);
      setFormName("");
      setFormEmail("");
      setFormMsg("");
    }, 1500);
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { id: "services", label: "Services" },
    { id: "showcase", label: "Work" },
    { id: "process", label: "Process" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <div className="relative isolate w-full min-h-screen flex flex-col bg-background text-foreground selection:bg-primary-tint selection:text-foreground">
      {/* Blueprint grid lines */}
      <GridLines />

      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-primary z-[999] transition-all duration-75"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Header / Navbar */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          headerSolid ? "bg-background/90 backdrop-blur-sm border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center h-[72px]">
          <a href="#" className="flex items-center mr-10" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <NitwebsLogo />
          </a>

          <nav className="hidden lg:flex items-center gap-7 flex-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-5">
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="btn-primary pl-5 pr-4 py-2.5 text-sm font-semibold cursor-pointer flex items-center gap-1"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground cursor-pointer ml-auto"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="lg:hidden overflow-hidden bg-background border-b border-border"
            >
              <div className="flex flex-col gap-1 px-6 py-6">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      scrollToSection(link.id);
                    }}
                    className="text-base font-medium text-secondary-text hover:text-foreground text-left py-3"
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollToSection("contact");
                  }}
                  className="btn-primary w-full py-3 text-sm font-semibold mt-3 flex items-center justify-center gap-1"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-12 px-6 overflow-hidden">
        <div className="relative max-w-6xl mx-auto min-h-[780px] flex items-center justify-center overflow-hidden">
          {/* Decorative concentric rings behind the headline — the middle and
              outer rings each carry an orbiting set of icons. Sized so that
              radius + icon size never exceeds this box, at any angle. */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <div className="w-[400px] h-[400px] rounded-full border border-border/40" />
            <div className="absolute w-[580px] h-[580px] rounded-full border border-border/70" />
            <div className="absolute w-[720px] h-[720px] rounded-full border border-border/70" />
          </div>

          {/* Tech-stack icons orbiting the headline, clockwise, slowly, at two speeds */}
          <OrbitRing icons={MIDDLE_RING_ICONS} radius={RING_RADIUS.middle} duration={100} />
          <OrbitRing icons={OUTER_RING_ICONS} radius={RING_RADIUS.outer} duration={160} />

          <motion.div
            className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              className="px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-primary-tint/50 border border-primary/20 text-primary mb-3"
            >
              AI-first software development
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="text-[26px] sm:text-[32px] md:text-[36px] font-normal leading-[1.1] tracking-[-0.02em] font-headline text-foreground"
            >
              Build software that
              <br />
              <span className="text-primary">builds businesses</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-secondary-text text-sm sm:text-base max-w-sm mt-3">
              We engineer AI products, scalable software, SaaS platforms, mobile apps, and automation
              systems for ambitious companies worldwide.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-2.5 mt-5">
              <button
                onClick={() => scrollToSection("contact")}
                className="btn-primary px-6 py-2.5 text-sm font-semibold cursor-pointer"
              >
                Start Your Project
              </button>
              <button
                onClick={() => scrollToSection("showcase")}
                className="btn-secondary px-6 py-2.5 text-sm font-semibold cursor-pointer"
              >
                View Our Work
              </button>
            </motion.div>

            <motion.p variants={fadeUp} className="text-secondary-text/70 text-xs mt-3">
              No commitment required &middot; Reply within 4 business hours
            </motion.p>
          </motion.div>
        </div>

        {/* Stats + Trusted logos */}
        <Reveal className="max-w-6xl mx-auto mt-12 flex flex-col gap-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "150", suffix: "+", label: "Projects Delivered" },
              { value: "6", suffix: "+", label: "Years Experience" },
              { value: "20", suffix: "+", label: "Technologies" },
              { value: "98", suffix: "%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span className="text-3xl md:text-4xl font-normal font-headline text-foreground">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-xs text-secondary-text mt-2 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border pt-8">
            <div className="text-secondary-text text-xs uppercase tracking-widest text-center md:text-left shrink-0">
              Trusted by high-growth startups
            </div>
            <div className="marquee-container w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)] select-none">
              <div className="animate-marquee flex items-center gap-16 py-1">
                {BRAND_LOGOS.concat(BRAND_LOGOS).map((logo, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                    <logo.icon className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 px-6">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">Our Expertise</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
              Full-spectrum engineering
            </h2>
            <p className="text-secondary-text text-lg">
              We leverage cloud infrastructure, cognitive AI, and solid engineering to build enterprise-scale products.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="card-panel rounded-2xl p-7 flex flex-col gap-4 cursor-default"
              >
                <div className="w-11 h-11 bg-primary-tint/50 text-primary rounded-xl flex items-center justify-center">
                  <service.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-secondary-text text-sm leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="relative py-24 px-6 bg-surface/60">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">Our Delivery Pipeline</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
              How we work
            </h2>
            <p className="text-secondary-text text-lg">
              A simple four-stage process from first conversation to production launch.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <motion.div key={step.stage} variants={fadeUp} className="card-panel rounded-2xl p-7 bg-background">
                <span className="text-xs font-mono text-primary">STAGE {step.stage}</span>
                <h3 className="text-xl font-bold text-foreground mt-2 mb-2">{step.title}</h3>
                <p className="text-secondary-text text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className="relative py-24 px-6">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="max-w-2xl mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">Portfolio Showcase</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-4">
              Flagship digital products
            </h2>
            <p className="text-secondary-text text-lg">
              A few of the SaaS platforms, fintech gateways, and AI modules we've designed and deployed.
            </p>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
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
              },
            ].map((project) => (
              <motion.div
                key={project.title}
                variants={fadeUp}
                className="card-panel rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="p-7 pb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono uppercase bg-muted text-secondary-text px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{project.title}</h3>
                  <p className="text-secondary-text text-sm mb-4">{project.desc}</p>
                  <div className="border-t border-border pt-4 flex gap-8">
                    {project.metrics.map(([label, val]) => (
                      <div key={label}>
                        <div className="text-[10px] font-mono uppercase text-secondary-text/70">{label}</div>
                        <div className="text-lg font-normal text-foreground font-headline">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative overflow-hidden aspect-video border-t border-border">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                </div>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 marquee-container overflow-hidden">
        <GridDivider />
        <Reveal className="max-w-6xl mx-auto px-6 mb-16">
          <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">Partner Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-normal font-headline text-foreground">
            Client transformed outcomes
          </h2>
        </Reveal>

        <div className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] select-none">
          <div className="animate-marquee flex items-center gap-6">
            {TESTIMONIALS.concat(TESTIMONIALS).map((t, idx) => (
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
      </section>

      {/* Case Study Detail */}
      <section className="relative py-24 px-6 bg-surface/60">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">Case Studies</span>
              <h2 className="text-3xl sm:text-4xl font-normal font-headline text-foreground">
                Transformed partnerships
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveCaseStudy(activeCaseStudy === 0 ? 1 : 0)}
                className="w-11 h-11 rounded-full border border-border text-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all cursor-pointer"
              >
                ←
              </button>
              <button
                onClick={() => setActiveCaseStudy(activeCaseStudy === 0 ? 1 : 0)}
                className="w-11 h-11 rounded-full border border-border text-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all cursor-pointer"
              >
                →
              </button>
            </div>
          </Reveal>

          <div className="card-panel rounded-2xl p-8 sm:p-12 relative overflow-hidden min-h-[380px] bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCaseStudy}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                {activeCaseStudy === 0 ? (
                  <>
                    <div className="flex flex-col gap-6">
                      <div className="flex gap-2">
                        <span className="text-xs font-mono bg-primary-tint/50 text-primary px-3 py-1 rounded-full">AI Integration</span>
                        <span className="text-xs font-mono bg-muted text-secondary-text px-3 py-1 rounded-full">3 Months Build</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                        Optimizing support pipelines for Zenith SaaS
                      </h3>
                      <div className="flex flex-col gap-4 border-l-2 border-primary/30 pl-4 py-1">
                        <div>
                          <span className="text-xs font-bold font-mono text-primary block">THE PROBLEM</span>
                          <p className="text-secondary-text text-sm mt-1">High ticket backlogs and customer churn due to slow support routing.</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold font-mono text-primary block">THE SOLUTION</span>
                          <p className="text-secondary-text text-sm mt-1">Deployed semantic LLM agent routers that solve 75% of basic tickets instantly.</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold font-mono text-primary block">THE OUTCOME</span>
                          <p className="text-success text-sm mt-1 font-semibold">Saved $140,000 in monthly operator bills; ticket latency dropped to 4s.</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
                      <img src="/dashboard.png" alt="SaaS Dashboard Mockup" className="w-full h-full object-cover" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-6">
                      <div className="flex gap-2">
                        <span className="text-xs font-mono bg-primary-tint/50 text-primary px-3 py-1 rounded-full">Web & Mobile</span>
                        <span className="text-xs font-mono bg-muted text-secondary-text px-3 py-1 rounded-full">4 Months Build</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                        Launching Nova's decentralized wallet swap
                      </h3>
                      <div className="flex flex-col gap-4 border-l-2 border-primary/30 pl-4 py-1">
                        <div>
                          <span className="text-xs font-bold font-mono text-primary block">THE PROBLEM</span>
                          <p className="text-secondary-text text-sm mt-1">Slow ledger processing causing high transaction failure rates on mobile.</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold font-mono text-primary block">THE SOLUTION</span>
                          <p className="text-secondary-text text-sm mt-1">Engineered a multi-channel edge gateway handling direct transaction loops.</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold font-mono text-primary block">THE OUTCOME</span>
                          <p className="text-success text-sm mt-1 font-semibold">Ledger swap failures dropped to zero; app acquisition speed tripled.</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
                      <img src="/mobile.png" alt="Fintech Wallet Mockup" className="w-full h-full object-cover" />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="relative py-24 px-6">
        <GridDivider />
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">Common Questions</span>
            <h2 className="text-3xl sm:text-4xl font-normal font-headline text-foreground mb-4">
              Frequently asked questions
            </h2>
            <p className="text-secondary-text text-lg">
              Licensing, sprint integrations, support SLAs, and development capabilities.
            </p>
          </Reveal>

          <StaggerGrid className="flex flex-col gap-3">
            {FAQS.map((faq, idx) => (
              <motion.div key={idx} variants={fadeUp} className="card-panel rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqOpenIdx(faqOpenIdx === idx ? null : idx)}
                  className="w-full text-left p-6 flex justify-between items-center text-foreground font-semibold cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <motion.span
                    animate={{ rotate: faqOpenIdx === idx ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown className="w-5 h-5 text-secondary-text" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {faqOpenIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="p-6 pt-0 text-secondary-text text-sm leading-relaxed border-t border-border">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Contact + CTA Section */}
      <section id="contact" className="relative py-24 px-6 bg-surface/60">
        <GridDivider />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <Reveal>
              <span className="text-xs font-mono text-primary tracking-widest uppercase block mb-3">Get in Touch</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground mb-6 leading-tight">
                Let's build something extraordinary
              </h2>
              <p className="text-secondary-text text-base leading-relaxed mb-10 max-w-md">
                Have an ambitious platform to build? Reach out for a discovery call, project quote, or timeline scope.
              </p>

              <div className="flex flex-col gap-6 text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-tint/50 text-primary rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary-text block uppercase">Email</span>
                    <a href="mailto:hello@nitwebs.com" className="text-foreground hover:text-primary transition-colors font-medium">hello@nitwebs.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-tint/50 text-primary rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary-text block uppercase">Phone</span>
                    <a href="tel:+15550199" className="text-foreground hover:text-primary transition-colors font-medium">+1 (555) 0199</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-tint/50 text-primary rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary-text block uppercase">HQ Office</span>
                    <span className="text-foreground font-medium">San Francisco, CA</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-12 border-t border-border pt-8">
                {["Twitter", "GitHub", "LinkedIn", "Discord"].map((social) => (
                  <a key={social} href="#" className="text-xs text-secondary-text hover:text-foreground transition-colors uppercase tracking-wider">
                    {social}
                  </a>
                ))}
              </div>
            </Reveal>

            <Reveal className="card-panel rounded-2xl p-8 sm:p-10 bg-background">
              {formSuccess ? (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary-tint/50 text-primary rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Message sent</h3>
                  <p className="text-secondary-text text-sm max-w-xs mx-auto">
                    An engineer will follow up in your inbox within 4 business hours.
                  </p>
                  <button
                    onClick={() => setFormSuccess(false)}
                    className="btn-secondary px-6 py-2.5 text-xs font-semibold mt-6 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <label className="text-[10px] text-secondary-text uppercase tracking-widest block mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Alex Carter"
                      className="w-full bg-background border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-secondary-text uppercase tracking-widest block mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. alex@zenith.com"
                      className="w-full bg-background border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-secondary-text uppercase tracking-widest block mb-2">Project Scope</label>
                    <textarea
                      rows={4}
                      required
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      placeholder="Tell us about the software or AI systems you'd like to build..."
                      className="w-full bg-background border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <span className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6">
        <GridDivider />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <NitwebsLogo />
            <p className="text-secondary-text text-xs text-center md:text-left">
              © {new Date().getFullYear()} Nitwebs Inc. All rights reserved.
            </p>
          </div>

          <div className="flex gap-8 text-xs">
            <a href="#" className="text-secondary-text hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-secondary-text hover:text-foreground transition-colors">Terms of Service</a>
          </div>

          <div className="flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-primary" />
            <button onClick={() => scrollToSection("contact")} className="text-xs font-semibold text-foreground hover:text-primary transition-colors">
              Book a discovery call
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
