import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nitwebs";

const siteContentSchema = new mongoose.Schema({
  hero: {
    badge: String,
    title: String,
    desc: String
  },
  services: [{
    icon: String,
    title: String,
    desc: String
  }],
  process: [{
    stage: String,
    title: String,
    desc: String
  }],
  whyUs: [{
    title: String,
    desc: String
  }],
  showcase: [{
    title: String,
    category: String,
    image: String
  }],
  testimonials: [{
    name: String,
    role: String,
    review: String
  }],
  faqs: [{
    q: String,
    a: String
  }],
  stats: [{
    value: String,
    suffix: String,
    label: String
  }],
  brands: [{
    name: String,
    icon: String,
    imageUrl: String
  }]
});

const SiteContent = mongoose.model("SiteContent", siteContentSchema);

const seedData = {
  hero: {
    badge: "AI-first software development",
    title: "AI-first software that builds businesses",
    desc: "We engineer AI products, scalable software, SaaS platforms, mobile apps, and automation systems for ambitious companies worldwide."
  },
  services: [
    {
      icon: "Cpu",
      title: "AI Engineering",
      desc: "Build intelligent products powered by AI—from custom AI agents and business automation to LLM integrations, chatbots, document intelligence, and workflow optimization."
    },
    {
      icon: "Layers",
      title: "Custom Software & SaaS",
      desc: "Develop enterprise-grade platforms tailored to your business. We build CRMs, ERPs, SaaS products, portals, dashboards, and internal systems that scale effortlessly."
    },
    {
      icon: "Globe",
      title: "Web & Mobile Applications",
      desc: "Create fast, secure, and engaging digital experiences with responsive websites, progressive web apps, and cross-platform mobile applications built for performance."
    },
    {
      icon: "Workflow",
      title: "Automation & System Integration",
      desc: "Eliminate repetitive work by connecting your existing tools through APIs, payment gateways, CRM integrations, ERP systems, messaging platforms, and automated workflows."
    },
    {
      icon: "Cloud",
      title: "Cloud Infrastructure & DevOps",
      desc: "Deploy confidently with secure, scalable cloud architecture, CI/CD pipelines, Docker containers, database optimization, monitoring, and high-availability infrastructure."
    },
    {
      icon: "Palette",
      title: "UI/UX & Product Design",
      desc: "Design intuitive digital experiences that users love. From research and wireframes to polished interfaces, we create products that are beautiful, functional, and conversion-focused."
    }
  ],
  process: [
    {
      stage: "01",
      title: "Discovery",
      desc: "We understand your business goals, users, and requirements to create the right technology strategy."
    },
    {
      stage: "02",
      title: "Design",
      desc: "We craft intuitive UI/UX and scalable system architecture focused on performance and user experience."
    },
    {
      stage: "03",
      title: "Development",
      desc: "Our team builds secure custom software, SaaS platforms, websites, and mobile apps using modern technologies."
    },
    {
      stage: "04",
      title: "Launch & Support",
      desc: "We deploy, monitor, and continuously improve your product to ensure long-term growth and reliability."
    }
  ],
  whyUs: [
    {
      title: "Senior Engineering Team",
      desc: "Work with experienced software engineers skilled in Laravel, AI, SaaS, cloud, and enterprise development."
    },
    {
      title: "Quality-First Development",
      desc: "Every project is tested for performance, security, and reliability before deployment."
    },
    {
      title: "On-Time Delivery",
      desc: "Agile workflows and clear milestones ensure predictable delivery without compromising quality."
    },
    {
      title: "Transparent Communication",
      desc: "Regular updates, dedicated project managers, and complete visibility throughout development."
    },
    {
      title: "Secure & Confidential",
      desc: "Your ideas, source code, and business data are protected with strict NDAs and enterprise-grade security."
    },
    {
      title: "Long-Term Partnership",
      desc: "From launch to future scaling, we provide ongoing support, maintenance, and continuous improvements."
    }
  ],
  showcase: [
    {
      title: "Aether Analytics Dashboard",
      category: "AI Engineering",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Nova Core CRM",
      category: "Custom Software & SaaS",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Zenith Mobile Portal",
      category: "Web & Mobile Applications",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800"
    }
  ],
  testimonials: [
    {
      name: "John Carter",
      role: "CEO, Zenith SaaS",
      review: "Nitwebs delivered an AI analytics suite that exceeded our expectations. Extremely responsive team."
    },
    {
      name: "Sarah Vance",
      role: "CTO, Nova Financial",
      review: "Their developers wrote highly structured TypeScript libraries. Saved our native app rollout timeline."
    },
    {
      name: "Devon Reed",
      role: "VP of Product, Aether CRM",
      review: "Sprint deliveries were clean, documentation was perfect, staging URLs worked. Five-star partnership."
    },
    {
      name: "Elena Rostova",
      role: "Head of AI, Cirrus Systems",
      review: "They build genuine serverless architectures. Our uptime stats are incredible now."
    },
    {
      name: "Marcus Brody",
      role: "Operations Lead, Prysma Ltd",
      review: "Custom automation scripts reduced document search loops down to seconds."
    }
  ],
  faqs: [
    {
      q: "How long does a typical software project take?",
      a: "Standard enterprise applications and AI pipelines are shipped within 8 to 12 weeks. We work on strict bi-weekly sprint delivery periods."
    },
    {
      q: "Do you hand over full source repositories?",
      a: "Yes. Every line of code we write is fully handed over in Git repositories with complete ownership rights."
    },
    {
      q: "How does dedicated developer embedding work?",
      a: "We embed senior programmers directly inside your Slack and GitHub workflows to speed up your roadmap."
    },
    {
      q: "What support packages do you offer?",
      a: "We provide 24/7 monitoring, proactive infrastructure updates, and dedicated maintenance agreements."
    },
    {
      q: "Can we start with a small pilot project?",
      a: "Yes. We offer rapid 4-week prototype pilots to validate architecture and user flows before scaling up."
    }
  ],
  stats: [
    { value: "150", suffix: "+", label: "Projects Delivered" },
    { value: "6", suffix: "+", label: "Years Experience" },
    { value: "20", suffix: "+", label: "Technologies" },
    { value: "98", suffix: "%", label: "Satisfaction" }
  ],
  brands: [
    { name: "Anthropic", icon: "SiAnthropic" },
    { name: "ElevenLabs", icon: "SiElevenlabs" },
    { name: "Vercel", icon: "SiVercel" },
    { name: "Linear", icon: "SiLinear" },
    { name: "Stripe", icon: "SiStripe" },
    { name: "Coinbase", icon: "SiCoinbase" }
  ],
  saasShowcase: {
    visible: true,
    badge: "Our Specialty",
    title: "Engineered for SaaS at Scale",
    desc: "Most agencies bolt SaaS features onto products never built to carry them. We ship multi-tenancy, billing, and scale on day one — so the platform you launch with is the same one you grow on."
  }
};

const runSeed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    await SiteContent.deleteMany();
    console.log("Cleared old content.");

    await SiteContent.create(seedData);
    console.log("Seeded database with initial static website content successfully.");

    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

runSeed();
