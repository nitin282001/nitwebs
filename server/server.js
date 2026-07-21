import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads", "resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage for resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${sanitized}`);
  }
});

// Configure file filters (PDF, DOC, DOCX) and limits (5MB)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "nitwebs_secret_key_2026";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nitwebs";

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


let mongod = null;

// Database Connection Helper with in-memory fallback
const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    // Connect with a short timeout to fail fast if MongoDB service is stopped
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to local MongoDB database.");
  } catch (err) {
    console.warn("Local MongoDB connection failed. Launching MongoDB Memory Server with persistent storage fallback...");
    const dbPath = path.join(__dirname, "db_data");
    try {
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: "nitwebs",
          dbPath: dbPath,
          storageEngine: "wiredTiger"
        }
      });
      const uri = mongod.getUri();
      console.log(`In-memory MongoDB Server running at: ${uri}`);
      await mongoose.connect(uri);
      console.log("Connected to in-memory fallback MongoDB database.");
    } catch (memErr) {
      console.warn("Persistent storage MongoMemoryServer failed (e.g. lock file error), cleaning dbPath and trying pure in-memory fallback...", memErr.message);
      try {
        if (fs.existsSync(dbPath)) {
          try {
            fs.rmSync(dbPath, { recursive: true, force: true });
          } catch (e) {
            console.warn("Could not clear dbPath:", e.message);
          }
        }
        mongod = await MongoMemoryServer.create({
          instance: {
            dbName: "nitwebs"
          }
        });
        const uri = mongod.getUri();
        console.log(`Pure in-memory MongoDB Server running at: ${uri}`);
        await mongoose.connect(uri);
        console.log("Connected to pure in-memory fallback MongoDB database.");
      } catch (finalErr) {
        console.error("Critical: Failed to launch pure in-memory MongoDB server:", finalErr);
        process.exit(1);
      }
    }
  }
};

// --- Schemas & Models ---

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model("Admin", adminSchema);

// Contact Submission Schema
const contactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  projectType: { type: String },
  subject: { type: String },
  budget: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const ContactSubmission = mongoose.model("ContactSubmission", contactSubmissionSchema);

// Site Content Schema (Single document representing the dynamic segments)
const siteContentSchema = new mongoose.Schema({
  logo: {
    text: { type: String, default: "nitwebs" },
    imageUrl: { type: String, default: "" },
    darkImageUrl: { type: String, default: "" },
    mode: { type: String, default: "svg" }
  },
  theme: {
    primaryColor: { type: String, default: "#6366f1" },
    glitchColors: { type: [String], default: ["#2b4539", "#61dca3", "#61b3dc"] },
    showThemeToggle: { type: Boolean, default: true }
  },
  showcaseHeader: {
    badge: { type: String, default: "Portfolio Showcase" },
    title: { type: String, default: "Flagship digital products" },
    desc: { type: String, default: "A few of the SaaS platforms, fintech gateways, and AI modules we've designed and deployed." }
  },
  saasShowcase: {
    visible: { type: Boolean, default: true },
    badge: { type: String, default: "Our Specialty" },
    title: { type: String, default: "Engineered for SaaS at Scale" },
    desc: { type: String, default: "Most agencies bolt SaaS features onto products never built to carry them. We ship multi-tenancy, billing, and scale on day one — so the platform you launch with is the same one you grow on." }
  },
  testimonialsHeader: {
    badge: { type: String, default: "Partner Testimonials" },
    title: { type: String, default: "Client transformed outcomes" },
    desc: { type: String, default: "" }
  },
  hero: {
    badge: String,
    title: String,
    desc: String
  },
  services: [{
    icon: String, // icon identifier
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
  industriesHeader: {
    badge: { type: String, default: "INDUSTRIES WE SERVE" },
    title: { type: String, default: "Powering Businesses Across Industries" },
    desc: { type: String, default: "From construction and healthcare to fintech and eCommerce, we build secure, scalable, and innovative software solutions tailored to the unique challenges of every industry." }
  },
  industries: [{
    title: String,
    subheading: String,
    desc: String,
    icon: String,
    tags: [String],
    image: String
  }],
  showcase: [{
    title: String,
    desc: String,
    tags: [String],
    metrics: [[String]],
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
    value: { type: String, default: "" },
    suffix: { type: String, default: "" },
    label: { type: String, default: "" }
  }],
  brands: [{
    name: { type: String, default: "" },
    icon: { type: String, default: "" },
    imageUrl: { type: String, default: "" }
  }]
});
const SiteContent = mongoose.model("SiteContent", siteContentSchema);

// Navigation Schema
const navigationSchema = new mongoose.Schema({
  links: [{
    label: { type: String, required: true },
    type: { type: String, enum: ["scroll", "page", "url"], default: "scroll" },
    target: { type: String, required: true },
    children: [{
      label: String,
      type: { type: String, enum: ["scroll", "page", "url"], default: "page" },
      target: String,
      description: String
    }]
  }],
  ctaLabel: { type: String, default: "Get Started" },
  ctaType: { type: String, enum: ["scroll", "page", "url"], default: "scroll" },
  ctaTarget: { type: String, default: "contact" }
});
const Navigation = mongoose.model("Navigation", navigationSchema);

// Footer Schema
const footerSchema = new mongoose.Schema({
  tagline: { type: String, default: "Building software that builds businesses." },
  columns: [{
    heading: String,
    links: [{
      label: String,
      href: String
    }]
  }],
  social: [{
    platform: String,
    href: String,
    icon: String
  }],
  bottomLinks: [{
    label: String,
    href: String
  }],
  platforms: [{
    name: String,
    imageUrl: String,
    link: String
  }],
  copyright: { type: String, default: "© 2025 Nitwebs Inc. All rights reserved." }
});
const Footer = mongoose.model("Footer", footerSchema);

// Dynamic Page Schema
const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  metaDesc: { type: String, default: "" },
  metaImage: { type: String, default: "" },
  status: { type: String, enum: ["published", "draft"], default: "draft" },
  sections: [{ type: mongoose.Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Page = mongoose.model("Page", pageSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  department: { type: String, default: "" },
  location: { type: String, default: "Remote" },
  employmentType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship"],
    default: "full-time"
  },
  summary: { type: String, default: "" },
  description: { type: String, default: "" },
  requirements: [{ type: String }],
  status: { type: String, enum: ["open", "closed"], default: "open" },
  postedDate: { type: Date, default: Date.now }
});
const Job = mongoose.model("Job", jobSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  jobTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  resumePath: { type: String, required: true }, // relative path under /uploads/resumes/
  coverNote: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now }
});
const Application = mongoose.model("Application", applicationSchema);

// --- Auth Middleware ---
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Serve resumes statically behind admin validation
app.use(
  "/uploads/resumes",
  verifyAdmin,
  express.static(path.join(__dirname, "uploads", "resumes"))
);

// --- Routes ---

// 1. Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login authentication." });
  }
});

// 2. Public: Fetch Site Content
app.get("/api/content", async (req, res) => {
  try {
    const content = await SiteContent.findOne();
    if (!content) {
      return res.status(404).json({ message: "No content found. Please run seed script." });
    }
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching website content." });
  }
});

// 3. Admin: Update Site Content
app.put("/api/content", verifyAdmin, async (req, res) => {
  try {
    let content = await SiteContent.findOne();
    if (!content) {
      content = new SiteContent(req.body);
    } else {
      // Update existing content fields
      content.logo = req.body.logo || content.logo;
      content.theme = req.body.theme || content.theme;
      content.hero = req.body.hero || content.hero;
      content.services = req.body.services || content.services;
      content.process = req.body.process || content.process;
      content.whyUs = req.body.whyUs || content.whyUs;
      content.industriesHeader = req.body.industriesHeader || content.industriesHeader;
      content.industries = req.body.industries || content.industries;
      content.showcase = req.body.showcase || content.showcase;
      content.showcaseHeader = req.body.showcaseHeader || content.showcaseHeader;
      if (req.body.saasShowcase !== undefined) {
        content.saasShowcase = req.body.saasShowcase;
      }
      content.testimonials = req.body.testimonials || content.testimonials;
      content.testimonialsHeader = req.body.testimonialsHeader || content.testimonialsHeader;
      content.faqs = req.body.faqs || content.faqs;
      content.stats = req.body.stats || content.stats;
      content.brands = req.body.brands || content.brands;
    }
    await content.save();
    res.json({ message: "Content updated successfully.", content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating website content." });
  }
});

// --- Navigation Routes ---
app.get("/api/nav", async (req, res) => {
  try {
    let nav = await Navigation.findOne();
    if (!nav) {
      nav = new Navigation({
        links: [
          { label: "Services", type: "scroll", target: "services", children: [] },
          { label: "Work",     type: "scroll", target: "showcase", children: [] },
          { label: "Process",  type: "scroll", target: "process",  children: [] },
          { label: "Platform", type: "scroll", target: "platform", children: [] }
        ],
        ctaLabel: "Get Started",
        ctaType: "scroll",
        ctaTarget: "contact"
      });
      await nav.save();
    }
    res.json(nav);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching navigation content." });
  }
});

app.put("/api/nav", verifyAdmin, async (req, res) => {
  try {
    let nav = await Navigation.findOne();
    if (!nav) {
      nav = new Navigation(req.body);
    } else {
      nav.links = req.body.links || nav.links;
      nav.ctaLabel = req.body.ctaLabel || nav.ctaLabel;
      nav.ctaType = req.body.ctaType || nav.ctaType;
      nav.ctaTarget = req.body.ctaTarget || nav.ctaTarget;
    }
    await nav.save();
    res.json({ message: "Navigation updated successfully.", nav });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating navigation content." });
  }
});

// --- Footer Routes ---
app.get("/api/footer", async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = new Footer({
        tagline: "Building software that builds businesses.",
        columns: [
          {
            heading: "Services",
            links: [
              { label: "AI Engineering", href: "#services" },
              { label: "Custom Software", href: "#services" },
              { label: "Web & Mobile", href: "#services" },
              { label: "Automation", href: "#services" }
            ]
          },
          {
            heading: "Company",
            links: [
              { label: "About Us", href: "#" },
              { label: "Our Work", href: "#showcase" },
              { label: "Process", href: "#process" },
              { label: "Contact", href: "#contact" },
              { label: "Careers", href: "/careers" }
            ]
          }
        ],
        social: [
          { platform: "LinkedIn", href: "#", icon: "Linkedin" },
          { platform: "Twitter",  href: "#", icon: "Twitter" }
        ],
        bottomLinks: [
          { label: "Privacy Policy",  href: "#" },
          { label: "Terms of Service", href: "#" }
        ],
        copyright: "© 2025 Nitwebs Inc. All rights reserved."
      });
      await footer.save();
    } else {
      let updated = false;
      const companyCol = footer.columns.find(col => col.heading === "Company");
      if (companyCol) {
        const hasCareers = companyCol.links.some(link => link.label === "Careers" || link.href === "/careers");
        if (!hasCareers) {
          companyCol.links.push({ label: "Careers", href: "/careers" });
          footer.markModified("columns");
          updated = true;
        }
      }
      if (updated) {
        await footer.save();
        console.log("--> Dynamic Migration: Added Careers link to footer database document.");
      }
    }
    res.json(footer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching footer content." });
  }
});

app.put("/api/footer", verifyAdmin, async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = new Footer(req.body);
    } else {
      footer.tagline = req.body.tagline || footer.tagline;
      footer.columns = req.body.columns || footer.columns;
      footer.social = req.body.social || footer.social;
      footer.bottomLinks = req.body.bottomLinks || footer.bottomLinks;
      footer.platforms = req.body.platforms || footer.platforms;
      footer.copyright = req.body.copyright || footer.copyright;
    }
    await footer.save();
    res.json({ message: "Footer updated successfully.", footer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating footer content." });
  }
});

// 4. Public: Submit Contact Inquiry Form
app.post("/api/contact", async (req, res) => {
  const { name, company, email, phone, projectType, subject, budget, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  try {
    const submission = new ContactSubmission({
      name,
      company,
      email,
      phone,
      projectType,
      subject,
      budget,
      message
    });
    await submission.save();
    res.status(201).json({ message: "Contact request submitted successfully.", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error submitting contact inquiry." });
  }
});

// 5. Admin: Fetch Contact Submissions
app.get("/api/contact", verifyAdmin, async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching contact inquiries." });
  }
});

// --- Pages API Routes ---

// 1. Admin: Fetch all pages
app.get("/api/pages", verifyAdmin, async (req, res) => {
  try {
    const pages = await Page.find().sort({ title: 1 });
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching pages." });
  }
});

// 2. Admin: Create a new page
app.post("/api/pages", verifyAdmin, async (req, res) => {
  const { title, slug, metaDesc, metaImage, status, sections } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ message: "Title and slug are required." });
  }

  // Validate slug formatting (lowercase alphanumeric and hyphens only)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return res.status(400).json({ message: "Slug must be lowercase alphanumeric and hyphens only (e.g. 'about-us')." });
  }

  try {
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ message: "A page with this slug already exists." });
    }

    const newPage = new Page({
      title,
      slug,
      metaDesc: metaDesc || "",
      metaImage: metaImage || "",
      status: status || "draft",
      sections: sections || []
    });

    await newPage.save();
    res.status(201).json({ message: "Page created successfully.", page: newPage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating page." });
  }
});

// 3. Public: Get page by slug
app.get("/api/pages/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) {
      return res.status(404).json({ message: "Page not found." });
    }
    // Only allow viewing published pages publicly
    if (page.status !== "published") {
      return res.status(403).json({ message: "This page is a draft." });
    }
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching page." });
  }
});

// 4. Admin: Update a page
app.put("/api/pages/:slug", verifyAdmin, async (req, res) => {
  const { title, slug, metaDesc, metaImage, status, sections } = req.body;
  
  if (slug) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ message: "Slug must be lowercase alphanumeric and hyphens only." });
    }
  }

  try {
    const page = req.body._id 
      ? await Page.findById(req.body._id)
      : await Page.findOne({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ message: "Page not found." });
    }

    if (slug && slug !== page.slug) {
      const existingPage = await Page.findOne({ slug });
      if (existingPage && existingPage._id.toString() !== page._id.toString()) {
        return res.status(400).json({ message: "A page with this slug already exists." });
      }
      page.slug = slug;
    }

    if (title !== undefined) page.title = title;
    if (metaDesc !== undefined) page.metaDesc = metaDesc;
    if (metaImage !== undefined) page.metaImage = metaImage;
    if (status !== undefined) page.status = status;
    if (sections !== undefined) page.sections = sections;
    page.updatedAt = Date.now();

    await page.save();
    res.json({ message: "Page updated successfully.", page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating page." });
  }
});

// 5. Admin: Delete a page
app.delete("/api/pages/:slug", verifyAdmin, async (req, res) => {
  try {
    const result = await Page.findOneAndDelete({ slug: req.params.slug });
    if (!result) {
      return res.status(404).json({ message: "Page not found." });
    }
    res.json({ message: "Page deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting page." });
  }
});

// --- Careers / Jobs API ---

// 1. Public: Get all open jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .select("title slug department location employmentType summary postedDate")
      .sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching jobs." });
  }
});

// 2. Public: Get job by slug
app.get("/api/jobs/:slug", async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug });
    if (!job || job.status !== "open") {
      return res.status(404).json({ message: "Job opening not found." });
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching job details." });
  }
});

// 3. Public: Submit job application (multipart/form-data)
const resumeUpload = upload.single("resume");
app.post("/api/applications", (req, res) => {
  resumeUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { name, email, phone, coverNote, jobId } = req.body;
    if (!name || !email || !jobId) {
      return res.status(400).json({ message: "Name, email, and Job ID are required." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required." });
    }

    try {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job opening not found." });
      }
      if (job.status !== "open") {
        return res.status(410).json({ message: "This role is no longer accepting applications." });
      }

      const newApplication = new Application({
        jobId,
        jobTitle: job.title,
        name,
        email,
        phone: phone || "",
        resumePath: `/uploads/resumes/${req.file.filename}`,
        coverNote: coverNote || ""
      });

      await newApplication.save();
      res.status(201).json({ message: "Application submitted successfully.", application: newApplication });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ message: "Server error processing application." });
    }
  });
});

// 4. Admin: Get all jobs (any status)
app.get("/api/admin/jobs", verifyAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching admin jobs list." });
  }
});

// 5. Admin: Create job
app.post("/api/admin/jobs", verifyAdmin, async (req, res) => {
  const { title, department, location, employmentType, summary, description, requirements, status } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Job title is required." });
  }

  // Auto-generate slug from title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return res.status(400).json({ message: "Could not generate valid slug. Please check the job title." });
  }

  try {
    const existingJob = await Job.findOne({ slug });
    if (existingJob) {
      return res.status(409).json({ message: "A job with this URL already exists, edit the slug." });
    }

    const newJob = new Job({
      title,
      slug,
      department: department || "",
      location: location || "Remote",
      employmentType: employmentType || "full-time",
      summary: summary || "",
      description: description || "",
      requirements: requirements || [],
      status: status || "open"
    });

    await newJob.save();
    res.status(201).json({ message: "Job created successfully.", job: newJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating job opening." });
  }
});

// 6. Admin: Update job
app.put("/api/admin/jobs/:id", verifyAdmin, async (req, res) => {
  const { title, slug, department, location, employmentType, summary, description, requirements, status } = req.body;
  
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (slug && slug !== job.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ message: "Slug must be lowercase alphanumeric and hyphens only." });
      }

      const existingJob = await Job.findOne({ slug });
      if (existingJob && existingJob._id.toString() !== job._id.toString()) {
        return res.status(409).json({ message: "A job with this URL already exists, edit the slug." });
      }
      job.slug = slug;
    }

    if (title !== undefined) job.title = title;
    if (department !== undefined) job.department = department;
    if (location !== undefined) job.location = location;
    if (employmentType !== undefined) job.employmentType = employmentType;
    if (summary !== undefined) job.summary = summary;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (status !== undefined) job.status = status;

    await job.save();
    res.json({ message: "Job updated successfully.", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating job." });
  }
});

// 7. Admin: Delete job
app.delete("/api/admin/jobs/:id", verifyAdmin, async (req, res) => {
  try {
    const result = await Job.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.json({ message: "Job deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting job." });
  }
});

// 8. Admin: Get all applications
app.get("/api/admin/applications", verifyAdmin, async (req, res) => {
  try {
    const applications = await Application.find({}).sort({ submittedAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching job applications." });
  }
});

// 9. Admin: Delete application
app.delete("/api/admin/applications/:id", verifyAdmin, async (req, res) => {
  try {
    const appDoc = await Application.findById(req.params.id);
    if (!appDoc) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Try to delete the resume file from disk to avoid clutter
    if (appDoc.resumePath) {
      const filename = appDoc.resumePath.replace("/uploads/resumes/", "");
      const fullPath = path.join(uploadDir, filename);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (fileErr) {
          console.warn("Could not delete resume file:", fileErr);
        }
      }
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting application." });
  }
});

// Auto-seed Default Super Admin on startup if none exists
const seedDefaultAdmin = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash("nitwebs2026", 10);
      const defaultAdmin = new Admin({
        username: "admin",
        password: hashedPassword
      });
      await defaultAdmin.save();
      console.log("--> Seeded default super admin: 'admin' / 'nitwebs2026'");
    }
  } catch (err) {
    console.error("Error seeding default admin:", err);
  }
};

const seedData = {
  logo: {
    text: "nitwebs",
    imageUrl: "",
    mode: "text"
  },
  theme: {
    primaryColor: "#6366f1"
  },
  showcaseHeader: {
    badge: "Portfolio Showcase",
    title: "Flagship digital products",
    desc: "A few of the SaaS platforms, fintech gateways, and AI modules we've designed and deployed."
  },
  testimonialsHeader: {
    badge: "Partner Testimonials",
    title: "Client transformed outcomes",
    desc: ""
  },
  hero: {
    badge: "Engineering the Future",
    title: "Building Technology That Powers Modern Businesses",
    desc: "We combine world-class engineering, AI, cloud infrastructure, and product strategy to build scalable software that helps businesses innovate, automate, and grow with confidence."
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
  industriesHeader: {
    badge: "INDUSTRIES WE SERVE",
    title: "Powering Businesses Across Industries",
    desc: "From construction and healthcare to fintech and eCommerce, we build secure, scalable, and innovative software solutions tailored to the unique challenges of every industry."
  },
  industries: [
    {
      title: "Construction",
      subheading: "Building Smarter Construction Operations",
      desc: "Streamline project management, workforce operations, scheduling, compliance, and reporting with modern construction software solutions.",
      icon: "Hammer",
      tags: ["Project Management", "Compliance", "Workforce Ops", "Scheduling"]
    },
    {
      title: "Healthcare",
      subheading: "Transforming Patient Care Through Technology",
      desc: "Develop secure healthcare platforms, patient portals, appointment systems, and digital solutions that improve care delivery.",
      icon: "Activity",
      tags: ["Patient Portals", "HIPAA Secure", "Appointment Systems", "Digital Health"]
    },
    {
      title: "FinTech",
      subheading: "Powering the Future of Financial Services",
      desc: "Build reliable fintech applications, payment platforms, digital wallets, and financial software with enterprise-grade security.",
      icon: "CreditCard",
      tags: ["Payment APIs", "Digital Wallets", "KYC / AML", "Enterprise Security"]
    },
    {
      title: "Retail & eCommerce",
      subheading: "Creating Seamless Shopping Experiences",
      desc: "Create high-converting eCommerce platforms, inventory systems, customer portals, and omnichannel retail experiences for growth.",
      icon: "ShoppingBag",
      tags: ["Omnichannel", "Inventory Systems", "Customer Portals", "High Conversion"]
    },
    {
      title: "Manufacturing",
      subheading: "Intelligent Systems for Modern Manufacturing",
      desc: "Optimize production workflows, inventory management, operational visibility, and business processes with intelligent manufacturing software.",
      icon: "Factory",
      tags: ["ERP Integration", "IoT Systems", "Production Ops", "Inventory Control"]
    },
    {
      title: "Logistics & Supply Chain",
      subheading: "Connecting Every Mile of Your Supply Chain",
      desc: "Improve fleet management, shipment tracking, warehouse operations, and logistics efficiency through connected digital platforms.",
      icon: "Truck",
      tags: ["Fleet Tracking", "Warehouse Ops", "Route Optimization", "Shipment Tracking"]
    },
    {
      title: "Real Estate",
      subheading: "Digital Solutions for Modern Real Estate",
      desc: "Develop property management systems, CRM platforms, listing portals, and digital experiences for modern real estate businesses.",
      icon: "Building2",
      tags: ["Property CRM", "Listing Portals", "Digital Tours", "Lead Management"]
    },
    {
      title: "Education (EdTech)",
      subheading: "Empowering Learners Through Innovation",
      desc: "Build engaging learning platforms, student portals, virtual classrooms, and education management systems for digital learning.",
      icon: "GraduationCap",
      tags: ["LMS Platforms", "Virtual Classrooms", "Student Portals", "Assessment Tools"]
    }
  ],
  showcase: [
    {
      tags: ["SaaS", "Next.js", "Claude API"],
      title: "Zenith Analytics",
      desc: "Predictive financial modeling suite that processes billions of market transactions to render automated investment routes.",
      metrics: [["Latency", "12ms"], ["Throughput", "15k/sec"]],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
    },
    {
      tags: ["Fintech", "React Native", "Stripe"],
      title: "Nova Digital Wallet",
      desc: "Mobile application enabling instant ledger swaps, bank settlement routes, and automated crypto portfolios.",
      metrics: [["Volume Swapped", "$14M+"], ["App Rating", "4.9/5"]],
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
  ]
};

const autoSeedContent = async () => {
  try {
    const count = await SiteContent.countDocuments();
    if (count === 0) {
      const defaultContent = new SiteContent(seedData);
      await defaultContent.save();
      console.log("--> Auto-seeded default site content successfully.");
    }

    // Auto-seed default about page if pages database collection is empty
    const pageCount = await Page.countDocuments();
    if (pageCount === 0) {
      const defaultAboutPage = new Page({
        slug: "about",
        title: "About Us",
        metaDesc: "Learn about Nitwebs, our core values, and engineering approach.",
        status: "published",
        sections: [
          {
            type: "hero",
            badge: "WHO WE ARE",
            title: "We are software architects and AI innovators",
            desc: "Nitwebs was founded with a single mission: to build technology that moves businesses forward. We construct robust architectures, fast interfaces, and secure data layers."
          },
          {
            type: "text",
            title: "Our Engineering Philosophy",
            desc: "We believe in clean code, automated testing, and zero-compromise security. Every project we design is engineered to scale with your traffic, keep data secure, and integrate into existing workflows.",
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
          },
          {
            type: "spacer",
            height: "py-12"
          },
          {
            type: "cta",
            title: "Ready to scale your next product?",
            desc: "Get in touch with our team today to discuss your architecture, timeline, and design goals.",
            btnText: "Book a Strategy Call",
            btnLink: "/contact"
          }
        ]
      });
      await defaultAboutPage.save();
      console.log("--> Auto-seeded default 'about' page successfully.");
    }

    // Auto-seed sample careers job if jobs collection is empty
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      const sampleJob = new Job({
        title: "Senior AI Full-Stack Engineer",
        slug: "senior-ai-full-stack-engineer",
        department: "Engineering",
        location: "Remote",
        employmentType: "full-time",
        summary: "Join our core team to design and ship high-performance AI solutions, custom software backends, and modular CMS integrations.",
        description: "<p>We are seeking a talented Senior AI Full-Stack Engineer to help lead our developer embeds team. You will be coding at the cutting edge of AI agent interfaces, vector indices, and Node/React framework infrastructures.</p>",
        requirements: [
          "5+ years professional software engineering experience with Node.js and React",
          "Deep experience building vector embeddings search, LLM routing pipelines, and agentic workflows",
          "Strong command of MongoDB, Mongoose, Tailwind CSS, and TypeScript",
          "Ability to work autonomously in a fast-paced remote layout environment"
        ],
        status: "open"
      });
      await sampleJob.save();
      console.log("--> Auto-seeded sample careers job successfully.");
    }
  } catch (err) {
    console.error("Error auto-seeding content:", err);
  }
};

app.listen(PORT, async () => {
  await connectDB();
  await seedDefaultAdmin();
  await autoSeedContent();
  console.log(`Server listening on port ${PORT}`);
});
