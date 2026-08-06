import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Lock, 
  LogOut, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Mail, 
  Briefcase, 
  DollarSign, 
  MessageSquare,
  Phone,
  HelpCircle,
  Users,
  Settings,
  ShieldCheck,
  ChevronDown,
  Palette,
  Layers,
  Building2,
  Menu,
  Globe,
  FileText,
  Eye,
  ArrowUp,
  ArrowDown,
  Inbox,
  Upload,
  GripVertical,
  X,
  Share2,
  Camera,
  KeyRound,
  RefreshCw,
  Send,
  Search,
  Sparkles,
  Code
} from "lucide-react";

import { hexToHsl } from "../lib/utils";

import { API_BASE, getUploadUrl } from "../lib/api";
import { DEFAULT_SITE_DATA } from "../lib/defaultSiteData";

const SECTION_ANCHORS = [
  { id: "hero", label: "Hero Banner (#hero)" },
  { id: "services", label: "Our Services (#services)" },
  { id: "about", label: "About Us (#about)" },
  { id: "process", label: "Agile Process (#process)" },
  { id: "why-us", label: "Why Choose Us (#why-us)" },
  { id: "showcase", label: "Project Showcase (#showcase)" },
  { id: "industries", label: "Industries Served (#industries)" },
  { id: "platform", label: "SaaS Specialty (#platform)" },
  { id: "contact", label: "Contact & CTA (#contact)" },
];

function TargetDestinationInput({ 
  type, 
  value, 
  onChange 
}: { 
  type: string; 
  value: string; 
  onChange: (val: string) => void;
}) {
  if (type === "scroll") {
    const isStandard = SECTION_ANCHORS.some(a => a.id === value);

    return (
      <div className="flex flex-col gap-1.5">
        <select
          value={isStandard ? value : "custom"}
          onChange={(e) => {
            if (e.target.value !== "custom") {
              onChange(e.target.value);
            }
          }}
          className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none cursor-pointer"
        >
          {SECTION_ANCHORS.map((anchor) => (
            <option key={anchor.id} value={anchor.id}>
              {anchor.label}
            </option>
          ))}
          <option value="custom">Custom Anchor ID...</option>
        </select>

        {(!isStandard || value === "custom") && (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type custom section ID..."
            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2 text-xs text-neutral-900 outline-none font-mono"
          />
        )}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={type === "page" ? "/careers" : "https://example.com"}
      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
    />
  );
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("hero");

  // OTP 2FA State
  const [loginStep, setLoginStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");

  // Admin Profile & Security State
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // SMTP Test State
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestMsg, setSmtpTestMsg] = useState("");
  const [smtpTestError, setSmtpTestError] = useState("");
  const [testRecipientEmail, setTestRecipientEmail] = useState("");

  // Content state
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Nav & Footer Content state
  const [navContent, setNavContent] = useState<any>(null);
  const [footerContent, setFooterContent] = useState<any>(null);
  const [navLoading, setNavLoading] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [draggedNavIdx, setDraggedNavIdx] = useState<number | null>(null);
  const [dragOverNavIdx, setDragOverNavIdx] = useState<number | null>(null);

  const moveNavLink = (fromIdx: number, toIdx: number) => {
    if (!navContent?.links || toIdx < 0 || toIdx >= navContent.links.length) return;
    const links = [...navContent.links];
    const [item] = links.splice(fromIdx, 1);
    links.splice(toIdx, 0, item);
    setNavContent({ ...navContent, links });
  };

  const handleDropNav = (targetIdx: number) => {
    if (draggedNavIdx === null || draggedNavIdx === targetIdx || !navContent?.links) return;
    moveNavLink(draggedNavIdx, targetIdx);
    setDraggedNavIdx(null);
    setDragOverNavIdx(null);
  };

  const moveSubLink = (parentIdx: number, fromIdx: number, toIdx: number) => {
    if (!navContent?.links) return;
    const links = [...navContent.links];
    const children = [...(links[parentIdx].children || [])];
    if (toIdx < 0 || toIdx >= children.length) return;
    const [item] = children.splice(fromIdx, 1);
    children.splice(toIdx, 0, item);
    links[parentIdx] = { ...links[parentIdx], children };
    setNavContent({ ...navContent, links });
  };

  // Dynamic Pages states
  const [pages, setPages] = useState<any[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  // Careers States
  const [adminJobs, setAdminJobs] = useState<any[]>([]);
  const [adminJobsLoading, setAdminJobsLoading] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("");
  const [newJobLocation, setNewJobLocation] = useState("Remote");
  const [newJobType, setNewJobType] = useState("full-time");
  const [newJobMinExperience, setNewJobMinExperience] = useState<number>(0);
  const [newJobExperienceLevel, setNewJobExperienceLevel] = useState("");
  const [newJobSalaryRange, setNewJobSalaryRange] = useState("");
  const [newJobSummary, setNewJobSummary] = useState("");
  const [newJobDesc, setNewJobDesc] = useState("");
  const [newJobRequirements, setNewJobRequirements] = useState<string[]>([]);
  const [newJobReqInput, setNewJobReqInput] = useState("");

  const [adminApps, setAdminApps] = useState<any[]>([]);
  const [adminAppsLoading, setAdminAppsLoading] = useState(false);

  // Gallery States
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState("office");

  const fetchGalleryPhotos = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gallery`);
      if (!res.ok) throw new Error("Failed to load gallery photos");
      const data = await res.json();
      setGalleryPhotos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGalleryLoading(false);
    }
  };

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsLoggedIn(true);
      fetchContent();
      fetchSubmissions();
      fetchNav();
      fetchFooter();
      fetchPages();
      fetchAdminJobs();
      fetchAdminApps();
      fetchGalleryPhotos();
      fetchProfileInfo();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (content?.theme?.primaryColor) {
      const hsl = hexToHsl(content.theme.primaryColor);
      if (hsl) {
        document.documentElement.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        document.documentElement.style.setProperty("--primary-tint", `${hsl.h} ${hsl.s}% ${Math.min(95, hsl.l + 32)}%`);
      }
    }
  }, [content?.theme?.primaryColor]);

  const fetchProfileInfo = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth?action=profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfileUsername(data.username || "admin");
        setProfileEmail(data.email || "admin@nitwebs.com");
        setProfileError("");
      } else {
        if (res.status === 401 || res.status === 403) {
          setProfileError(data.message || "Session expired or invalid token. Please log out and sign in again.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setOtpSuccessMsg("");
    try {
      const res = await fetch(`${API_BASE}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error("Auth API Raw Response:", text);
        throw new Error("Server error. Please check PHP backend.");
      }
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      if (data.requireOtp) {
        setOtpEmail(data.email || "");
        setDevOtp(data.devOtp || "");
        setLoginStep("otp");
      } else if (data.token) {
        localStorage.setItem("adminToken", data.token);
        setIsLoggedIn(true);
        fetchContent();
        fetchSubmissions();
        fetchNav();
        fetchFooter();
        fetchProfileInfo();
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setOtpSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", username, otp: otpCode })
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error("Auth API Raw Response:", text);
        throw new Error("Server error during OTP verification.");
      }
      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }
      localStorage.setItem("adminToken", data.token);
      setIsLoggedIn(true);
      fetchContent();
      fetchSubmissions();
      fetchNav();
      fetchFooter();
      fetchPages();
      fetchAdminJobs();
      fetchAdminApps();
      fetchGalleryPhotos();
      fetchProfileInfo();
    } catch (err: any) {
      setLoginError(err.message || "Invalid OTP code.");
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setLoginError("");
    setOtpSuccessMsg("");
    setResendingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-otp", username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }
      if (data.devOtp) setDevOtp(data.devOtp);
      setOtpSuccessMsg(data.message || "New OTP code sent to your email.");
    } catch (err: any) {
      setLoginError(err.message || "Failed to resend OTP.");
    } finally {
      setResendingOtp(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (profileNewPassword && profileNewPassword !== profileConfirmPassword) {
      setProfileError("New passwords do not match.");
      return;
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/auth?action=update-profile`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profileUsername,
          email: profileEmail,
          currentPassword: profileCurrentPassword,
          newPassword: profileNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
      }
      setProfileSuccess(data.message || "Admin profile & security credentials updated successfully.");
      setProfileCurrentPassword("");
      setProfileNewPassword("");
      setProfileConfirmPassword("");
    } catch (err: any) {
      setProfileError(err.message || "An error occurred while updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTestSmtp = async () => {
    setSmtpTestMsg("");
    setSmtpTestError("");
    const recipient = testRecipientEmail || profileEmail || "admin@nitwebs.com";
    if (!recipient) {
      setSmtpTestError("Please specify a recipient email address for testing.");
      return;
    }
    setTestingSmtp(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "test-smtp",
          testEmail: recipient,
          smtp: content?.smtp
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "SMTP test connection failed");
      }
      setSmtpTestMsg(data.message || `Test email sent successfully to ${recipient}!`);
    } catch (err: any) {
      setSmtpTestError(err.message || "Failed to send SMTP test email.");
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    setContent(null);
    setNavContent(null);
    setFooterContent(null);
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/content`);
      if (!res.ok) throw new Error("Failed to load content.");
      const data = await res.json();
      if (data && typeof data === "object" && (data.hero || data.logo)) {
        setContent(data);
      } else {
        setContent(DEFAULT_SITE_DATA);
      }
    } catch (err) {
      console.error(err);
      setContent(DEFAULT_SITE_DATA);
    } finally {
      setLoading(false);
    }
  };

  const fetchNav = async () => {
    setNavLoading(true);
    try {
      const res = await fetch(`${API_BASE}/nav`);
      if (!res.ok) throw new Error("Failed to load navigation.");
      const data = await res.json();
      setNavContent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setNavLoading(false);
    }
  };

  const fetchFooter = async () => {
    setFooterLoading(true);
    try {
      const res = await fetch(`${API_BASE}/footer`);
      if (!res.ok) throw new Error("Failed to load footer.");
      const data = await res.json();
      setFooterContent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFooterLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch contact requests");
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchPages = async () => {
    setPagesLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/pages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load pages.");
      const data = await res.json();
      setPages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPagesLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle || !newPageSlug) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPageTitle,
          slug: newPageSlug,
          status: "draft",
          sections: [
            { type: "hero", badge: "NEW PAGE", title: newPageTitle, desc: "This is a new dynamic page custom-built using the Nitwebs CMS builder." }
          ]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create page");
      }
      setNewPageTitle("");
      setNewPageSlug("");
      setShowNewPageModal(false);
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePage = async (pageToSave: any) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/pages/${pageToSave.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(pageToSave)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save page");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchPages();
    } catch (err: any) {
      setSaveError(err.message || "Error saving page.");
      setTimeout(() => setSaveError(""), 4000);
    }
  };

  const handleDeletePage = async (slugToDelete: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/pages/${slugToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete page");
      if (editingPage?.slug === slugToDelete) {
        setEditingPage(null);
      }
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchAdminJobs = async () => {
    setAdminJobsLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/admin/jobs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setAdminJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminJobsLoading(false);
    }
  };

  const fetchAdminApps = async () => {
    setAdminAppsLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/admin/applications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setAdminApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminAppsLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/admin/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newJobTitle,
          department: newJobDept,
          location: newJobLocation,
          employmentType: newJobType,
          minExperience: newJobMinExperience,
          experienceLevel: newJobExperienceLevel,
          salaryRange: newJobSalaryRange,
          summary: newJobSummary,
          description: newJobDesc,
          requirements: newJobRequirements,
          status: "open"
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create job");
      }
      setNewJobTitle("");
      setNewJobDept("");
      setNewJobLocation("Remote");
      setNewJobType("full-time");
      setNewJobMinExperience(0);
      setNewJobExperienceLevel("");
      setNewJobSalaryRange("");
      setNewJobSummary("");
      setNewJobDesc("");
      setNewJobRequirements([]);
      setNewJobReqInput("");
      setShowNewJobModal(false);
      fetchAdminJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateJob = async (jobToSave: any) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/admin/jobs/${jobToSave._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(jobToSave)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save job");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchAdminJobs();
    } catch (err: any) {
      setSaveError(err.message || "Error saving job.");
      setTimeout(() => setSaveError(""), 4000);
    }
  };

  const handleDeleteJob = async (idToDelete: string) => {
    if (!confirm("Are you sure you want to delete this job opening?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/admin/jobs/${idToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete job");
      if (editingJob?._id === idToDelete) {
        setEditingJob(null);
      }
      fetchAdminJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteApp = async (idToDelete: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/admin/applications/${idToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete application");
      fetchAdminApps();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/content`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update content");
      setContent(data.content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Error saving content.");
    }
  };

  const handleSaveNav = async () => {
    setSaveSuccess(false);
    setSaveError("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/nav`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(navContent)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update navigation");
      setNavContent(data.nav);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Error saving navigation.");
    }
  };

  const handleSaveFooter = async () => {
    setSaveSuccess(false);
    setSaveError("");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/footer`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(footerContent)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update footer");
      setFooterContent(data.footer);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Error saving footer.");
    }
  };

  const handleSaveAll = async () => {
    if (activeTab === "nav") {
      await handleSaveNav();
    } else if (activeTab === "footer") {
      await handleSaveFooter();
    } else if (activeTab === "pages" && editingPage) {
      await handleUpdatePage(editingPage);
    } else if (activeTab === "jobs" && editingJob) {
      await handleUpdateJob(editingJob);
    } else {
      await handleSave();
    }
  };

  // Helper change handlers
  const handleHeroChange = (field: string, val: string) => {
    setContent({
      ...content,
      hero: { ...content.hero, [field]: val }
    });
  };

  const handleListItemChange = (section: string, index: number, field: string, val: any) => {
    const list = [...(content[section] || [])];
    list[index] = { ...list[index], [field]: val };
    setContent({ ...content, [section]: list });
  };



  const addListItem = (section: string, template: any) => {
    const list = [...(content[section] || []), template];
    setContent({ ...content, [section]: list });
  };

  const removeListItem = (section: string, index: number) => {
    const list = [...(content[section] || [])];
    list.splice(index, 1);
    setContent({ ...content, [section]: list });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 relative font-sans">
        {/* Simple Blueprint Dotted Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-xl relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Super Admin Panel</span>
              <h1 className="text-2xl font-normal font-headline text-foreground">
                {loginStep === "credentials" ? "Authenticate" : "Enter Security OTP"}
              </h1>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {loginStep === "credentials" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {loginError && (
                <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 text-sm font-semibold bg-primary text-white rounded-full transition-all duration-200 hover:opacity-90 shadow-md hover:shadow-lg mt-2 cursor-pointer"
              >
                Sign In with Email OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-neutral-700 leading-relaxed">
                <span className="font-bold text-neutral-900 block mb-1">Email 2FA Verification</span>
                We sent a 6-digit verification code to <span className="font-semibold text-primary">{otpEmail || "admin email"}</span>. Please enter it below.
              </div>

              {devOtp && (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-3.5 text-xs font-mono">
                  <span className="font-bold block text-[10px] text-amber-600 uppercase tracking-wider mb-0.5">Local Dev Helper</span>
                  Generated OTP Code: <strong className="text-amber-900 text-sm tracking-widest ml-1">{devOtp}</strong>
                </div>
              )}

              {loginError && (
                <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-xs font-medium">
                  {loginError}
                </div>
              )}

              {otpSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-3.5 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {otpSuccessMsg}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">6-Digit OTP Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-center text-xl font-bold font-mono text-neutral-900 tracking-[0.4em] outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

              <button 
                type="submit"
                disabled={otpSubmitting || otpCode.length < 6}
                className="w-full py-4 text-sm font-semibold bg-primary text-white rounded-full transition-all duration-200 hover:opacity-90 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {otpSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  "Verify & Complete Login"
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendingOtp}
                  className="text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
                  Resend OTP Code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginStep("credentials");
                    setOtpCode("");
                    setLoginError("");
                  }}
                  className="text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors mt-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
          </a>
        </div>
      </div>
    );
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-secondary-text font-mono">Loading CMS engine...</span>
      </div>
    );
  }

  return (
    <div className="light min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans">
      {/* Header bar */}
      <header className="bg-white border-b border-neutral-200 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {content?.logo?.mode === "image" && content?.logo?.imageUrl ? (
              <img src={content.logo.imageUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                {(content?.logo?.text || "N").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">Nitwebs Admin Console</span>
              <span className="text-sm font-bold text-neutral-900">Content Management System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-full hover:opacity-90 shadow-sm cursor-pointer transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-full hover:bg-neutral-50 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main layout container */}
      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-8">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {saveSuccess && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Dynamic site content saved.
            </div>
          )}
          {saveError && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold shadow-sm">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shrink-0 cursor-pointer"
              >
                Re-login
              </button>
            </div>
          )}

          <div className="bg-white border border-border rounded-xl p-3 flex flex-col gap-1 shadow-sm">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-2">Web Content</span>
            {[
              { id: "logo", label: "Logo & Brand", icon: Palette },
              { id: "hero", label: "Hero Banner", icon: Settings },
              { id: "nav", label: "Navigation Links", icon: Menu },
              { id: "about", label: "About Us", icon: FileText },
              { id: "services", label: "Our Services", icon: ShieldCheck },
              { id: "process", label: "Agile Process", icon: Users },
              { id: "whyUs", label: "Why Nitwebs", icon: HelpCircle },
              { id: "saasShowcase", label: "SaaS Specialty", icon: Layers },
              { id: "showcase", label: "Project Showcase", icon: Briefcase },
              { id: "industries", label: "Industries Served", icon: Building2 },
              { id: "testimonials", label: "Testimonials", icon: MessageSquare },
              { id: "gallery", label: "Team Gallery", icon: Camera },
              { id: "faqs", label: "FAQ Center", icon: ChevronDown },
              { id: "socialLinks", label: "Social Links", icon: Share2 },
              { id: "footer", label: "Footer Content", icon: Globe },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}

            <div className="border-t border-border/80 my-2" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-2">Site Pages</span>
            <button
              onClick={() => {
                setActiveTab("pages");
                setEditingPage(null);
                fetchPages();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer w-full ${
                activeTab === "pages" 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Dynamic Pages
            </button>

            <div className="border-t border-border/80 my-2" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-2">Careers Board</span>
            <button
              onClick={() => {
                setActiveTab("jobs");
                setEditingJob(null);
                fetchAdminJobs();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer w-full ${
                activeTab === "jobs" 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Manage Jobs
            </button>
            <button
              onClick={() => {
                setActiveTab("applications");
                fetchAdminApps();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer w-full ${
                activeTab === "applications" 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Inbox className="w-4 h-4" />
              Job Applications
            </button>

            <div className="border-t border-border/80 my-2" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-2">System Leads</span>
            
            <button
              onClick={() => {
                setActiveTab("contact");
                fetchSubmissions();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "contact" 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Mail className="w-4 h-4" />
              Inquiries Inbox
              {submissions.length > 0 && (
                <span className="ml-auto bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                  {submissions.length}
                </span>
              )}
            </button>

            <div className="border-t border-border/80 my-2" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-3 py-2">Security & Settings</span>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer w-full ${
                activeTab === "security" 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Admin Credentials & Mail
            </button>

            <button
              onClick={() => setActiveTab("seo")}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer w-full ${
                activeTab === "seo" 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Search className="w-4 h-4" />
              SEO & Search Indexing
            </button>
          </div>
          
          <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors px-3 py-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to live site
          </a>
        </div>

        {/* Content Details Area */}
        <div className="lg:col-span-9 bg-white border border-border rounded-xl p-6 md:p-8 shadow-sm h-fit">
          
          {/* Tab 0: Logo Section */}
          {activeTab === "logo" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold font-headline text-neutral-900">Logo & Identity</h2>
                <p className="text-xs text-neutral-600 mt-1">Configure your corporate logo settings (text representation or file upload).</p>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Logo Presentation Mode</label>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-800">
                      <input 
                        type="radio" 
                        name="logoMode" 
                        value="text" 
                        checked={content.logo?.mode !== "image"} 
                        onChange={(e) => setContent({ ...content, logo: { ...content.logo, mode: e.target.value } })}
                        className="accent-primary"
                      />
                      Text Logo
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-neutral-800">
                      <input 
                        type="radio" 
                        name="logoMode" 
                        value="image" 
                        checked={content.logo?.mode === "image"} 
                        onChange={(e) => setContent({ ...content, logo: { ...content.logo, mode: e.target.value } })}
                        className="accent-primary"
                      />
                      Image Logo File
                    </label>
                  </div>
                </div>

                {content.logo?.mode !== "image" ? (
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Brand Name (Text)</label>
                    <input 
                      type="text" 
                      value={content.logo?.text || ""}
                      onChange={(e) => setContent({ ...content, logo: { ...content.logo, text: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 text-sm text-neutral-900 outline-none transition-all"
                      placeholder="nitwebs"
                    />
                    <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">
                      In text mode, parts matching "webs" (case-insensitive) will automatically be colored with your brand purple (e.g. nit<span className="text-primary font-bold">webs</span>).
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Upload Light Mode Logo Image</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setContent({ ...content, logo: { ...content.logo, imageUrl: reader.result } });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-sm text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-tint file:text-primary hover:file:opacity-90 cursor-pointer"
                      />
                    </div>

                    {content.logo?.imageUrl && (
                      <div className="border border-border rounded-xl p-4 bg-neutral-50 flex flex-col gap-2 items-center justify-center">
                        <span className="text-[9px] font-mono text-neutral-400">Light Mode Logo Preview:</span>
                        <img 
                          src={content.logo.imageUrl} 
                          alt="Light Mode Logo Preview" 
                          className="h-10 max-w-[200px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setContent({ ...content, logo: { ...content.logo, imageUrl: "" } })}
                          className="text-[10px] font-semibold text-red-500 hover:underline cursor-pointer"
                        >
                          Remove Light Image
                        </button>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border/60">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Upload Dark Mode Logo Image (Optional)</label>
                      <p className="text-xs text-neutral-500 mb-3">If set, this logo will automatically be displayed whenever the website switches to dark mode.</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setContent({ ...content, logo: { ...content.logo, darkImageUrl: reader.result } });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-sm text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:opacity-90 cursor-pointer"
                      />
                    </div>

                    {content.logo?.darkImageUrl && (
                      <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-950 flex flex-col gap-2 items-center justify-center text-white">
                        <span className="text-[9px] font-mono text-neutral-400">Dark Mode Logo Preview:</span>
                        <img 
                          src={content.logo.darkImageUrl} 
                          alt="Dark Mode Logo Preview" 
                          className="h-10 max-w-[200px] object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setContent({ ...content, logo: { ...content.logo, darkImageUrl: "" } })}
                          className="text-[10px] font-semibold text-red-400 hover:underline cursor-pointer"
                        >
                          Remove Dark Image
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6 mt-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 font-headline mb-1">Brand Theme Color</h3>
                  <p className="text-xs text-secondary-text mb-4">Set the primary accent color used across buttons, indicators, and highlights.</p>

                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={content.theme?.primaryColor || "#6366f1"}
                      onChange={(e) => setContent({ ...content, theme: { ...content.theme, primaryColor: e.target.value } })}
                      className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={content.theme?.primaryColor || "#6366f1"}
                      onChange={(e) => setContent({ ...content, theme: { ...content.theme, primaryColor: e.target.value } })}
                      className="bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none w-32 font-mono"
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>

              {/* Favicon Upload Section */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6 mt-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-800 font-headline mb-1">Website Favicon</h3>
                  <p className="text-xs text-secondary-text mb-4">Upload a custom favicon image (.png, .ico, .svg, .webp) displayed in web browser tabs.</p>

                  <div className="flex flex-col gap-4">
                    <input 
                      type="file" 
                      accept="image/png, image/x-icon, image/vnd.microsoft.icon, image/svg+xml, image/jpeg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const faviconUrl = reader.result as string;
                            setContent({ ...content, logo: { ...content.logo, faviconUrl } });
                            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                            if (!link) {
                              link = document.createElement("link");
                              link.rel = "icon";
                              document.getElementsByTagName("head")[0].appendChild(link);
                            }
                            link.href = faviconUrl;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-sm text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-tint file:text-primary hover:file:opacity-90 cursor-pointer"
                    />

                    {content.logo?.faviconUrl && (
                      <div className="border border-border rounded-xl p-4 bg-neutral-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 p-2 flex items-center justify-center shadow-sm shrink-0">
                            <img 
                              src={content.logo.faviconUrl} 
                              alt="Favicon Preview" 
                              className="w-6 h-6 object-contain"
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">Favicon Active</span>
                            <span className="text-[10px] text-neutral-500 font-mono">Displayed in browser tab</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setContent({ ...content, logo: { ...content.logo, faviconUrl: "" } });
                            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                            if (link) link.href = "/favicon.svg";
                          }}
                          className="text-xs font-semibold text-red-500 hover:underline cursor-pointer shrink-0"
                        >
                          Remove Favicon
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Light/Dark Mode Switcher Visibility Toggle */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 flex items-center justify-between shadow-sm mt-6">
                <div>
                  <span className="text-sm font-bold text-neutral-900 block">Show Light/Dark Mode Switcher</span>
                  <p className="text-xs text-neutral-500 mt-0.5">Toggle to show or completely remove the theme switcher (Light/System/Dark) from the header and mobile menu.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.theme?.showThemeToggle !== false}
                    onChange={(e) => setContent({
                      ...content,
                      theme: { ...content.theme, showThemeToggle: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Under Construction Visibility Toggle */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 flex items-center justify-between shadow-sm mt-6">
                <div>
                  <span className="text-sm font-bold text-neutral-900 block">Under Construction Mode</span>
                  <p className="text-xs text-neutral-500 mt-0.5">Lock the website and show an elegant under construction landing page. (Admin dashboard remains accessible at /admin).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.theme?.underConstruction === true}
                    onChange={(e) => setContent({
                      ...content,
                      theme: { ...content.theme, underConstruction: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6 mt-6">
                <div>
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 font-headline mb-1">About Us LetterGlitch Colors</h3>
                      <p className="text-xs text-secondary-text">Customize the dynamic scrambled colors rendered inside the LetterGlitch component.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const colors = [...(content.theme?.glitchColors || ["#2b4539", "#61dca3", "#61b3dc"])];
                        colors.push("#8b5cf6");
                        setContent({ ...content, theme: { ...content.theme, glitchColors: colors } });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Color
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3">
                    {(content.theme?.glitchColors || ["#2b4539", "#61dca3", "#61b3dc"]).map((color: string, cIdx: number) => (
                      <div key={cIdx} className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/80 rounded-xl p-2 shrink-0">
                        <input 
                          type="color" 
                          value={color.startsWith("hsl") ? "#6366f1" : color}
                          disabled={color.startsWith("hsl")}
                          onChange={(e) => {
                            const colors = [...(content.theme?.glitchColors || ["#2b4539", "#61dca3", "#61b3dc"])];
                            colors[cIdx] = e.target.value;
                            setContent({ ...content, theme: { ...content.theme, glitchColors: colors } });
                          }}
                          className="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer p-0.5 bg-white"
                        />
                        <input 
                          type="text" 
                          value={color}
                          onChange={(e) => {
                            const colors = [...(content.theme?.glitchColors || ["#2b4539", "#61dca3", "#61b3dc"])];
                            colors[cIdx] = e.target.value;
                            setContent({ ...content, theme: { ...content.theme, glitchColors: colors } });
                          }}
                          className="bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-2 py-1 text-xs text-neutral-900 outline-none w-28 font-mono"
                          placeholder="#61dca3"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const colors = [...(content.theme?.glitchColors || ["#2b4539", "#61dca3", "#61b3dc"])];
                            colors.splice(cIdx, 1);
                            setContent({ ...content, theme: { ...content.theme, glitchColors: colors } });
                          }}
                          className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-3 leading-relaxed">
                    You can use CSS hex values (e.g. <code>#61dca3</code>) or CSS variables (e.g. <code>hsl(var(--primary))</code>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Hero Section */}
          {activeTab === "hero" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold font-headline text-foreground">Hero Section</h2>
                <p className="text-xs text-secondary-text mt-1">Configure landing values shown above the fold.</p>
              </div>
              
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Category Badge</label>
                  <input 
                    type="text" 
                    value={content.hero.badge || ""}
                    onChange={(e) => handleHeroChange("badge", e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3.5 text-sm text-neutral-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Main Headline</label>
                  <textarea 
                    rows={2}
                    value={content.hero.title || ""}
                    onChange={(e) => handleHeroChange("title", e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Hero Description</label>
                  <textarea 
                    rows={4}
                    value={content.hero.desc || ""}
                    onChange={(e) => handleHeroChange("desc", e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Stats Subsection */}
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex justify-between items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 font-headline">Hero Stats Counter</h3>
                    <p className="text-xs text-secondary-text mt-0.5">Edit stats displayed under the hero ring.</p>
                  </div>
                  <button
                    onClick={() => addListItem("stats", { value: "100", suffix: "+", label: "New Stat" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Stat
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {(content.stats || []).map((item: any, idx: number) => (
                    <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-4 flex gap-4 relative items-end">
                      <button 
                        onClick={() => removeListItem("stats", idx)}
                        className="absolute top-2 right-2 text-neutral-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-20">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Value</label>
                        <input 
                          type="text" 
                          value={item.value || ""}
                          onChange={(e) => handleListItemChange("stats", idx, "value", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 outline-none"
                          placeholder="150"
                        />
                      </div>

                      <div className="w-16">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Suffix</label>
                        <input 
                          type="text" 
                          value={item.suffix || ""}
                          onChange={(e) => handleListItemChange("stats", idx, "suffix", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 outline-none"
                          placeholder="+"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Label</label>
                        <input 
                          type="text" 
                          value={item.label || ""}
                          onChange={(e) => handleListItemChange("stats", idx, "label", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 outline-none"
                          placeholder="Projects Delivered"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Brands Subsection */}
              <div className="border-t border-border pt-6 mt-6">
                <div className="flex justify-between items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 font-headline">Trusted Brands Marquee</h3>
                    <p className="text-xs text-secondary-text mt-0.5">Edit company logos shown in the scrolling marquee.</p>
                  </div>
                  <button
                    onClick={() => addListItem("brands", { name: "New Brand", icon: "SiVercel" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Brand
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {(content.brands || []).map((item: any, idx: number) => (
                    <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-4 relative">
                      <button 
                        onClick={() => removeListItem("brands", idx)}
                        className="absolute top-2 right-2 text-neutral-400 hover:text-red-500 transition-colors p-1 z-10"
                        title="Remove Brand"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center justify-between gap-4 pr-6">
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Upload Custom Logo</label>
                          <div className="flex items-center gap-3">
                            <label className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-primary/50 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 shadow-sm">
                              <Upload className="w-3.5 h-3.5 text-primary" />
                              <span>Upload Image</span>
                              <input 
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      handleListItemChange("brands", idx, "imageUrl", reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>

                            {item.imageUrl && (
                              <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-2 py-1 shadow-sm">
                                <img src={item.imageUrl} alt={item.name || "Brand logo"} className="h-5 max-w-[60px] object-contain" />
                                <button
                                  type="button"
                                  onClick={() => handleListItemChange("brands", idx, "imageUrl", "")}
                                  className="text-neutral-400 hover:text-red-500 text-xs transition-colors p-0.5"
                                  title="Remove logo image"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* About Us Tab */}
          {activeTab === "about" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold font-headline text-neutral-900">About Us Section</h2>
                <p className="text-xs text-neutral-600 mt-1">Configure company summary, mission, and headlines displayed in the landing page About section.</p>
              </div>

              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Category Badge</label>
                  <input 
                    type="text" 
                    value={content?.aboutUs?.badge || content?.about?.badge || "About Us"}
                    onChange={(e) => setContent({ ...content, aboutUs: { ...content?.aboutUs, badge: e.target.value } })}
                    placeholder="About Us"
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Main Section Heading</label>
                  <input 
                    type="text" 
                    value={content?.aboutUs?.title || content?.about?.title || "We Engineer the Future of Software"}
                    onChange={(e) => setContent({ ...content, aboutUs: { ...content?.aboutUs, title: e.target.value } })}
                    placeholder="We Engineer the Future of Software"
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-headline text-base"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">First Paragraph</label>
                  <textarea 
                    rows={4}
                    value={content?.aboutUs?.paragraph1 || content?.about?.paragraph1 || "At Nitwebs, we combine world-class engineering, artificial intelligence, and strategic design to construct premium digital products. Our team builds secure, scalable platforms that resolve complex operational challenges for high-growth enterprises globally."}
                    onChange={(e) => setContent({ ...content, aboutUs: { ...content?.aboutUs, paragraph1: e.target.value } })}
                    placeholder="At Nitwebs, we combine world-class engineering..."
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Second Paragraph</label>
                  <textarea 
                    rows={4}
                    value={content?.aboutUs?.paragraph2 || content?.about?.paragraph2 || "From custom SaaS architectures and automated system integrations to cutting-edge AI models, we embed quality-first engineering into every line of code. We partner with ambitious organizations to deliver measurable, transformative outcomes."}
                    onChange={(e) => setContent({ ...content, aboutUs: { ...content?.aboutUs, paragraph2: e.target.value } })}
                    placeholder="From custom SaaS architectures..."
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">CTA Button Label</label>
                  <input 
                    type="text" 
                    value={content?.aboutUs?.ctaText || content?.about?.ctaText || "Learn More"}
                    onChange={(e) => setContent({ ...content, aboutUs: { ...content?.aboutUs, ctaText: e.target.value } })}
                    placeholder="Learn More"
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Services Section */}
          {activeTab === "services" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">Services Section</h2>
                  <p className="text-xs text-secondary-text mt-1">Configure expertise categories and details.</p>
                </div>
                <button
                  onClick={() => addListItem("services", { icon: "Cpu", title: "New Service", desc: "Service description text." })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Service
                </button>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                {content.services.map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    <button 
                      onClick={() => removeListItem("services", idx)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Icon Name</label>
                        <select 
                          value={item.icon || "Cpu"}
                          onChange={(e) => handleListItemChange("services", idx, "icon", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none cursor-pointer"
                        >
                          <option value="Cpu">Cpu (AI)</option>
                          <option value="Layers">Layers (SaaS)</option>
                          <option value="Globe">Globe (Web/Mobile)</option>
                          <option value="Workflow">Workflow (Integration)</option>
                          <option value="Cloud">Cloud (Devops)</option>
                          <option value="Palette">Palette (UI/UX)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Service Title</label>
                        <input 
                          type="text" 
                          value={item.title || ""}
                          onChange={(e) => handleListItemChange("services", idx, "title", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Description & Bullet Points</label>
                        <div className="flex items-center gap-1 bg-neutral-200/80 p-1 rounded-lg">
                          <button
                            type="button"
                            title="Add Bold Text"
                            onClick={() => {
                              const prev = item.desc || "";
                              handleListItemChange("services", idx, "desc", prev + " **bold text**");
                            }}
                            className="px-2 py-0.5 text-xs font-bold bg-white text-neutral-800 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            title="Add Italic Text"
                            onClick={() => {
                              const prev = item.desc || "";
                              handleListItemChange("services", idx, "desc", prev + " *italic text*");
                            }}
                            className="px-2 py-0.5 text-xs italic font-serif bg-white text-neutral-800 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            title="Add Bullet Point"
                            onClick={() => {
                              const prev = item.desc || "";
                              const prefix = prev.endsWith("\n") || !prev ? "" : "\n";
                              handleListItemChange("services", idx, "desc", prev + prefix + "• ");
                            }}
                            className="px-2.5 py-0.5 text-xs font-sans bg-white text-neutral-800 rounded hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>•</span> <span>Bullet</span>
                          </button>
                        </div>
                      </div>
                      <textarea 
                        rows={4}
                        placeholder={"• Full-cycle product development (MVP to scale)\n• Web, mobile, and SaaS application engineering\n• Cloud-native, API-first architectures"}
                        value={item.desc || ""}
                        onChange={(e) => handleListItemChange("services", idx, "desc", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none font-sans leading-relaxed"
                      />
                      <p className="text-[11px] text-neutral-400 mt-1">Each line or '•' becomes a bullet point on the website. Use **bold** or *italic* for formatted text.</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Page Link / URL (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. /services/ai-engineering or https://..."
                        value={item.link || ""}
                        onChange={(e) => handleListItemChange("services", idx, "link", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      />
                      <p className="text-[11px] text-neutral-400 mt-1">If set, this link will be applied to the service card on the front page and added to the slide drawer menu.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Process Section */}
          {activeTab === "process" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">Development Process</h2>
                  <p className="text-xs text-secondary-text mt-1">Configure step stages and milestones.</p>
                </div>
                <button
                  onClick={() => addListItem("process", { stage: "05", title: "New Stage", desc: "Stage milestone details." })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Stage
                </button>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                {content.process.map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    <button 
                      onClick={() => removeListItem("process", idx)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Stage Index</label>
                        <input 
                          type="text" 
                          value={item.stage || ""}
                          onChange={(e) => handleListItemChange("process", idx, "stage", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none text-center"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Stage Title</label>
                        <input 
                          type="text" 
                          value={item.title || ""}
                          onChange={(e) => handleListItemChange("process", idx, "title", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Description</label>
                      <textarea 
                        rows={2}
                        value={item.desc || ""}
                        onChange={(e) => handleListItemChange("process", idx, "desc", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Why Us Section */}
          {activeTab === "whyUs" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">Why Choose Nitwebs</h2>
                  <p className="text-xs text-secondary-text mt-1">Configure timeline bullet points.</p>
                </div>
                <button
                  onClick={() => addListItem("whyUs", { title: "Why Point Title", desc: "Why Point description." })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Point
                </button>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                {content.whyUs.map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    <button 
                      onClick={() => removeListItem("whyUs", idx)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Point Title</label>
                      <input 
                        type="text" 
                        value={item.title || ""}
                        onChange={(e) => handleListItemChange("whyUs", idx, "title", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Description</label>
                      <textarea 
                        rows={2}
                        value={item.desc || ""}
                        onChange={(e) => handleListItemChange("whyUs", idx, "desc", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Showcase Section */}
          {activeTab === "showcase" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">Project Showcase</h2>
                  <p className="text-xs text-secondary-text mt-1">Configure showcase cards, tags, descriptions, and metrics.</p>
                </div>
                <button
                  onClick={() => addListItem("showcase", { title: "New Project", desc: "Project description.", tags: ["SaaS"], image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {/* Showcase Headers Card Panel */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-4">
                <span className="text-xs font-bold text-neutral-800 font-headline">Section Header Configuration</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Category Badge</label>
                    <input 
                      type="text" 
                      value={content.showcaseHeader?.badge || ""}
                      onChange={(e) => setContent({ ...content, showcaseHeader: { ...content.showcaseHeader, badge: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Main Heading</label>
                    <input 
                      type="text" 
                      value={content.showcaseHeader?.title || ""}
                      onChange={(e) => setContent({ ...content, showcaseHeader: { ...content.showcaseHeader, title: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Description</label>
                  <textarea 
                    rows={2}
                    value={content.showcaseHeader?.desc || ""}
                    onChange={(e) => setContent({ ...content, showcaseHeader: { ...content.showcaseHeader, desc: e.target.value } })}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                {content.showcase.map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    <button 
                      onClick={() => removeListItem("showcase", idx)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Project Name</label>
                        <input 
                          type="text" 
                          value={item.title || ""}
                          onChange={(e) => handleListItemChange("showcase", idx, "title", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Tags (comma-separated)</label>
                        <input 
                          type="text" 
                          value={(item.tags || []).join(", ")}
                          onChange={(e) => handleListItemChange("showcase", idx, "tags", e.target.value.split(",").map(s => s.trim()))}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Project Description</label>
                      <textarea 
                        rows={2}
                        value={item.desc || ""}
                        onChange={(e) => handleListItemChange("showcase", idx, "desc", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>



                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Project Image</label>
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <input 
                          type="text" 
                          placeholder="Image URL"
                          value={item.image || ""}
                          onChange={(e) => handleListItemChange("showcase", idx, "image", e.target.value)}
                          className="flex-1 bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none w-full"
                        />
                        <span className="text-xs text-neutral-400 font-semibold uppercase">Or</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleListItemChange("showcase", idx, "image", reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary-tint file:text-primary hover:file:opacity-90 cursor-pointer"
                        />
                      </div>

                      {item.image && (
                        <div className="mt-3 relative w-32 aspect-video rounded-lg overflow-hidden border border-border bg-neutral-100 group/img">
                          <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleListItemChange("showcase", idx, "image", "")}
                            className="absolute inset-0 bg-red-600/80 text-white text-[10px] font-bold opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Testimonials Section */}
          {activeTab === "testimonials" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">Partner Testimonials</h2>
                  <p className="text-xs text-secondary-text mt-1">Configure client review cards.</p>
                </div>
                <button
                  onClick={() => addListItem("testimonials", { name: "Client Name", role: "CEO, Company", review: "Great partnership details." })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Review
                </button>
              </div>

              {/* Testimonials Headers Card Panel */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-4">
                <span className="text-xs font-bold text-neutral-800 font-headline">Section Header Configuration</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Category Badge</label>
                    <input 
                      type="text" 
                      value={content.testimonialsHeader?.badge || ""}
                      onChange={(e) => setContent({ ...content, testimonialsHeader: { ...content.testimonialsHeader, badge: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Main Heading</label>
                    <input 
                      type="text" 
                      value={content.testimonialsHeader?.title || ""}
                      onChange={(e) => setContent({ ...content, testimonialsHeader: { ...content.testimonialsHeader, title: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Description / Subtext</label>
                  <textarea 
                    rows={2}
                    value={content.testimonialsHeader?.desc || ""}
                    onChange={(e) => setContent({ ...content, testimonialsHeader: { ...content.testimonialsHeader, desc: e.target.value } })}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                    placeholder="Optional subtext description under the heading..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                {content.testimonials.map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    <button 
                      onClick={() => removeListItem("testimonials", idx)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Author Name</label>
                        <input 
                          type="text" 
                          value={item.name || ""}
                          onChange={(e) => handleListItemChange("testimonials", idx, "name", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Author Title / Role</label>
                        <input 
                          type="text" 
                          value={item.role || ""}
                          onChange={(e) => handleListItemChange("testimonials", idx, "role", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Review Comment</label>
                      <textarea 
                        rows={3}
                        value={item.review || ""}
                        onChange={(e) => handleListItemChange("testimonials", idx, "review", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: SaaS Specialty Section */}
          {activeTab === "saasShowcase" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">SaaS Specialty Section</h2>
                  <p className="text-xs text-secondary-text mt-1">Control visibility and content for the "Engineered for SaaS at Scale" section.</p>
                </div>
              </div>

              {/* Visibility Toggle Card */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-sm font-bold text-neutral-900 block">Show Section on Website</span>
                  <p className="text-xs text-neutral-500 mt-0.5">Toggle to display or hide the "Engineered for SaaS at Scale" section on the homepage.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={content.saasShowcase?.visible !== false}
                    onChange={(e) => setContent({
                      ...content,
                      saasShowcase: {
                        ...content.saasShowcase,
                        visible: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Section Header Content */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
                <h3 className="text-sm font-bold text-neutral-900">Header Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Badge Text</label>
                    <input 
                      type="text" 
                      value={content.saasShowcase?.badge || "Our Specialty"}
                      onChange={(e) => setContent({
                        ...content,
                        saasShowcase: {
                          ...content.saasShowcase,
                          badge: e.target.value
                        }
                      })}
                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Title</label>
                    <input 
                      type="text" 
                      value={content.saasShowcase?.title || "Engineered for SaaS at Scale"}
                      onChange={(e) => setContent({
                        ...content,
                        saasShowcase: {
                          ...content.saasShowcase,
                          title: e.target.value
                        }
                      })}
                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Description Paragraph</label>
                  <textarea 
                    rows={3}
                    value={content.saasShowcase?.desc || "Most agencies bolt SaaS features onto products never built to carry them..."}
                    onChange={(e) => setContent({
                      ...content,
                      saasShowcase: {
                        ...content.saasShowcase,
                        desc: e.target.value
                      }
                    })}
                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Industries Served */}
          {activeTab === "industries" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">Industries Served</h2>
                  <p className="text-xs text-secondary-text mt-1">Configure industrial domains and sector descriptions.</p>
                </div>
                <button
                  onClick={() => addListItem("industries", { title: "New Industry", desc: "Industry details and operations.", icon: "Hammer", tags: [] })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Industry
                </button>
              </div>

              {/* Industries Headers Card Panel */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-4">
                <span className="text-xs font-bold text-neutral-800 font-headline">Section Header Configuration</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Category Badge</label>
                    <input 
                      type="text" 
                      value={content.industriesHeader?.badge || ""}
                      onChange={(e) => setContent({ ...content, industriesHeader: { ...content.industriesHeader, badge: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Main Heading</label>
                    <input 
                      type="text" 
                      value={content.industriesHeader?.title || ""}
                      onChange={(e) => setContent({ ...content, industriesHeader: { ...content.industriesHeader, title: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Description</label>
                  <textarea 
                    rows={2}
                    value={content.industriesHeader?.desc || ""}
                    onChange={(e) => setContent({ ...content, industriesHeader: { ...content.industriesHeader, desc: e.target.value } })}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                {(content.industries || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    <button 
                      onClick={() => removeListItem("industries", idx)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Industry Name</label>
                        <input
                          type="text"
                          value={item.title || ""}
                          onChange={(e) => handleListItemChange("industries", idx, "title", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Industry Icon</label>
                        <select
                          value={item.icon || "Hammer"}
                          onChange={(e) => handleListItemChange("industries", idx, "icon", e.target.value)}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none cursor-pointer"
                        >
                          <option value="Hammer">Hammer (Construction)</option>
                          <option value="Activity">Activity (Healthcare)</option>
                          <option value="CreditCard">CreditCard (FinTech)</option>
                          <option value="ShoppingBag">ShoppingBag (Retail & eCommerce)</option>
                          <option value="Factory">Factory (Manufacturing)</option>
                          <option value="Truck">Truck (Logistics & Supply Chain)</option>
                          <option value="Building2">Building2 (Real Estate)</option>
                          <option value="GraduationCap">GraduationCap (Education)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Subheading</label>
                      <input
                        type="text"
                        value={item.subheading || ""}
                        onChange={(e) => handleListItemChange("industries", idx, "subheading", e.target.value)}
                        placeholder="e.g. Building Smarter Construction Operations"
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Industry Description</label>
                      <textarea 
                        rows={2}
                        value={item.desc || ""}
                        onChange={(e) => handleListItemChange("industries", idx, "desc", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Capability Tags <span className="normal-case font-normal text-neutral-400">(comma-separated)</span></label>
                      <input
                        type="text"
                        value={(item.tags || []).join(", ")}
                        onChange={(e) => handleListItemChange("industries", idx, "tags", e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean))}
                        placeholder="e.g. Payment APIs, Digital Wallets, KYC / AML"
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1.5">These appear as capability chips in the side drawer and homepage. Separate each tag with a comma.</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Industry Page Link / URL (Optional)</label>
                      <input
                        type="text"
                        value={item.link || ""}
                        onChange={(e) => handleListItemChange("industries", idx, "link", e.target.value)}
                        placeholder="e.g. /industries/construction or https://..."
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">If set, clicking tags or cards for this industry in the side drawer and homepage will open this page URL.</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Showcase Image</label>
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <input 
                          type="text" 
                          placeholder="Image URL or Base64 string"
                          value={item.image || ""}
                          onChange={(e) => handleListItemChange("industries", idx, "image", e.target.value)}
                          className="flex-1 bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none w-full"
                        />
                        <span className="text-xs text-neutral-400 font-semibold uppercase">Or</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleListItemChange("industries", idx, "image", reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary-tint file:text-primary hover:file:opacity-90 cursor-pointer"
                        />
                      </div>

                      {item.image && (
                        <div className="mt-3 relative w-32 aspect-video rounded-lg overflow-hidden border border-border bg-neutral-100 group/img">
                          <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleListItemChange("industries", idx, "image", "")}
                            className="absolute inset-0 bg-red-600/80 text-white text-[10px] font-bold opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 7: FAQ Center */}
          {activeTab === "faqs" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">FAQ Center</h2>
                  <p className="text-xs text-secondary-text mt-1">Configure questions and answers accordion.</p>
                </div>
                <button
                  onClick={() => addListItem("faqs", { q: "New Question?", a: "Answer detail text." })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              <div className="flex flex-col gap-6 border-t border-border pt-4">
                {content.faqs.map((item: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                    <button 
                      onClick={() => removeListItem("faqs", idx)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Question Title</label>
                      <input 
                        type="text" 
                        value={item.q || ""}
                        onChange={(e) => handleListItemChange("faqs", idx, "q", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Answer Text</label>
                      <textarea 
                        rows={3}
                        value={item.a || ""}
                        onChange={(e) => handleListItemChange("faqs", idx, "a", e.target.value)}
                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 8: Inquiries Inbox */}
          {activeTab === "contact" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold font-headline text-foreground">Inquiries Inbox</h2>
                <p className="text-xs text-secondary-text mt-1">View list of client submissions sent from the website contact page.</p>
              </div>

              {submissionsLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-neutral-200 rounded-xl">
                  <p className="text-sm text-secondary-text">No inquiries received yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5 border-t border-border pt-4">
                  {submissions.map((sub: any) => (
                    <div key={sub._id} className="border border-border/80 rounded-xl p-5 flex flex-col gap-4 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/40 pb-3">
                        <div>
                          <span className="text-sm font-bold text-foreground block">{sub.name}</span>
                          <span className="text-xs text-neutral-500">{sub.email}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            {new Date(sub.createdAt).toLocaleString()}
                          </span>
                          {sub.budget && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-1">
                              <DollarSign className="w-3 h-3" /> Budget: {sub.budget}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {sub.company && (
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span><strong>Company:</strong> {sub.company}</span>
                          </div>
                        )}
                        {sub.phone && (
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span><strong>Phone:</strong> {sub.phone}</span>
                          </div>
                        )}
                        {sub.projectType && (
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span><strong>Type:</strong> {sub.projectType}</span>
                          </div>
                        )}
                        {sub.subject && (
                          <div className="flex items-center gap-2 text-neutral-700">
                            <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span><strong>Subject:</strong> {sub.subject}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-white border border-border/60 rounded-xl p-4 text-sm text-neutral-800 leading-relaxed">
                        {sub.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Navigation Links */}
          {activeTab === "nav" && (
            <div className="flex flex-col gap-6">
              {navLoading || !navContent ? (
                <div className="py-12 flex justify-center items-center">
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-bold font-headline text-foreground">Navigation Links</h2>
                    <p className="text-xs text-secondary-text mt-1">Configure header links, submenus, and main call-to-action button.</p>
                  </div>

                  <div className="flex flex-col gap-5 border-t border-border pt-4">
                    {/* CTA Configuration */}
                    <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-foreground">Call-To-Action (CTA) Button</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">CTA Label</label>
                          <input 
                            type="text" 
                            value={navContent.ctaLabel || ""} 
                            onChange={(e) => setNavContent({ ...navContent, ctaLabel: e.target.value })}
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">CTA Link Type</label>
                          <select 
                            value={navContent.ctaType || "scroll"} 
                            onChange={(e) => setNavContent({ ...navContent, ctaType: e.target.value })}
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                          >
                            <option value="scroll">Scroll Section Anchor</option>
                            <option value="page">React Router Page Route</option>
                            <option value="url">External Website URL</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">CTA Target Destination</label>
                          <TargetDestinationInput
                            type={navContent.ctaType || "scroll"}
                            value={navContent.ctaTarget || ""}
                            onChange={(val) => setNavContent({ ...navContent, ctaTarget: val })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex justify-between items-center mt-2">
                      <h3 className="text-sm font-bold text-foreground">Menu Items</h3>
                      <button 
                        onClick={() => {
                          const links = [...(navContent.links || [])];
                          links.push({ label: "New Link", type: "scroll", target: "", children: [] });
                          setNavContent({ ...navContent, links });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Menu Item
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {(navContent.links || []).map((link: any, idx: number) => (
                        <div 
                          key={idx} 
                          draggable
                          onDragStart={(e) => {
                            setDraggedNavIdx(idx);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverNavIdx(idx);
                          }}
                          onDragLeave={() => setDragOverNavIdx(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDropNav(idx);
                          }}
                          onDragEnd={() => {
                            setDraggedNavIdx(null);
                            setDragOverNavIdx(null);
                          }}
                          className={`border rounded-xl p-5 bg-white flex flex-col gap-4 relative transition-all duration-200 ${
                            draggedNavIdx === idx ? "opacity-40 border-dashed border-primary scale-[0.99]" : "border-border/80"
                          } ${
                            dragOverNavIdx === idx && draggedNavIdx !== idx ? "border-2 border-primary bg-primary/5 shadow-md" : ""
                          }`}
                        >
                          {/* Header Bar with Drag Handle & Action Controls */}
                          <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 cursor-grab active:cursor-grabbing select-none group/drag">
                              <GripVertical className="w-4 h-4 text-neutral-400 group-hover/drag:text-primary transition-colors" />
                              <span className="font-mono text-[11px] text-neutral-400">Pos 0{idx + 1}</span>
                              <span className="text-neutral-300 font-normal">|</span>
                              <span className="text-neutral-800 font-semibold">{link.label || "Untitled Link"}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Move Up Button */}
                              <button 
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveNavLink(idx, idx - 1)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-primary hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Move Down Button */}
                              <button 
                                type="button"
                                disabled={idx === (navContent.links.length - 1)}
                                onClick={() => moveNavLink(idx, idx + 1)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-primary hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              <div className="w-px h-3.5 bg-border/60 mx-1" />

                              {/* Delete Link Button */}
                              <button 
                                type="button"
                                onClick={() => {
                                  const links = [...navContent.links];
                                  links.splice(idx, 1);
                                  setNavContent({ ...navContent, links });
                                }}
                                className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Link Label</label>
                              <input 
                                type="text" 
                                value={link.label || ""} 
                                onChange={(e) => {
                                  const links = [...navContent.links];
                                  links[idx] = { ...links[idx], label: e.target.value };
                                  setNavContent({ ...navContent, links });
                                }}
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Link Type</label>
                              <select 
                                value={link.type || "scroll"} 
                                onChange={(e) => {
                                  const links = [...navContent.links];
                                  links[idx] = { ...links[idx], type: e.target.value };
                                  setNavContent({ ...navContent, links });
                                }}
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none cursor-pointer"
                              >
                                <option value="scroll">Scroll Section Anchor</option>
                                <option value="page">React Router Page Route</option>
                                <option value="url">External Website URL</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Target Destination</label>
                              <TargetDestinationInput
                                type={link.type || "scroll"}
                                value={link.target || ""}
                                onChange={(val) => {
                                  const links = [...navContent.links];
                                  links[idx] = { ...links[idx], target: val };
                                  setNavContent({ ...navContent, links });
                                }}
                              />
                            </div>
                          </div>

                          {/* Submenu Children links */}
                          <div className="border-t border-dashed border-border/80 pt-4 mt-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Dropdown Submenu Links ({link.children?.length || 0})</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  const links = [...navContent.links];
                                  const children = [...(links[idx].children || [])];
                                  children.push({ label: "Sub Link", type: "page", target: "", description: "" });
                                  links[idx] = { ...links[idx], children };
                                  setNavContent({ ...navContent, links });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-semibold rounded transition-colors cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Sub-link
                              </button>
                            </div>

                            <div className="flex flex-col gap-3">
                              {(link.children || []).map((child: any, cIdx: number) => (
                                <div key={cIdx} className="bg-neutral-50 border border-neutral-200/50 rounded-xl p-4 flex flex-col gap-3 relative">
                                  {/* Sublink Top Header Bar */}
                                  <div className="flex items-center justify-between border-b border-neutral-200/40 pb-2 mb-1">
                                    <span className="text-[10px] font-bold text-neutral-500 font-mono">Sub-link #{cIdx + 1}</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        disabled={cIdx === 0}
                                        onClick={() => moveSubLink(idx, cIdx, cIdx - 1)}
                                        className="p-0.5 rounded text-neutral-400 hover:text-primary disabled:opacity-30 cursor-pointer"
                                        title="Move Sub-link Up"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={cIdx === link.children.length - 1}
                                        onClick={() => moveSubLink(idx, cIdx, cIdx + 1)}
                                        className="p-0.5 rounded text-neutral-400 hover:text-primary disabled:opacity-30 cursor-pointer"
                                        title="Move Sub-link Down"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const links = [...navContent.links];
                                          const children = [...links[idx].children];
                                          children.splice(cIdx, 1);
                                          links[idx] = { ...links[idx], children };
                                          setNavContent({ ...navContent, links });
                                        }}
                                        className="p-0.5 text-neutral-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                                        title="Delete Sub-link"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Sub Link Label</label>
                                      <input 
                                        type="text" 
                                        value={child.label || ""} 
                                        onChange={(e) => {
                                          const links = [...navContent.links];
                                          const children = [...links[idx].children];
                                          children[cIdx] = { ...children[cIdx], label: e.target.value };
                                          links[idx] = { ...links[idx], children };
                                          setNavContent({ ...navContent, links });
                                        }}
                                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Sub Link Type</label>
                                      <select 
                                        value={child.type || "page"} 
                                        onChange={(e) => {
                                          const links = [...navContent.links];
                                          const children = [...links[idx].children];
                                          children[cIdx] = { ...children[cIdx], type: e.target.value };
                                          links[idx] = { ...links[idx], children };
                                          setNavContent({ ...navContent, links });
                                        }}
                                        className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none cursor-pointer"
                                      >
                                        <option value="scroll">Scroll Section Anchor</option>
                                        <option value="page">React Router Page Route</option>
                                        <option value="url">External Website URL</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Sub Link Target</label>
                                      <TargetDestinationInput
                                        type={child.type || "page"}
                                        value={child.target || ""}
                                        onChange={(val) => {
                                          const links = [...navContent.links];
                                          const children = [...links[idx].children];
                                          children[cIdx] = { ...children[cIdx], target: val };
                                          links[idx] = { ...links[idx], children };
                                          setNavContent({ ...navContent, links });
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Sub Link Description (Optional)</label>
                                    <input 
                                      type="text" 
                                      value={child.description || ""} 
                                      onChange={(e) => {
                                        const links = [...navContent.links];
                                        const children = [...links[idx].children];
                                        children[cIdx] = { ...children[cIdx], description: e.target.value };
                                        links[idx] = { ...links[idx], children };
                                        setNavContent({ ...navContent, links });
                                      }}
                                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                                      placeholder="Brief text summarizing link purpose"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Footer Content */}
          {activeTab === "footer" && (
            <div className="flex flex-col gap-6">
              {footerLoading || !footerContent ? (
                <div className="py-12 flex justify-center items-center">
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-xl font-bold font-headline text-foreground">Footer Content</h2>
                    <p className="text-xs text-secondary-text mt-1">Configure company tagline, columns structure, social accounts, and legally required links.</p>
                  </div>

                  <div className="flex flex-col gap-6 border-t border-border pt-4">
                    {/* General properties */}
                    <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Corporate Tagline / Description</label>
                        <textarea 
                          rows={2}
                          value={footerContent.tagline || ""} 
                          onChange={(e) => setFooterContent({ ...footerContent, tagline: e.target.value })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Copyright Line</label>
                        <input 
                          type="text" 
                          value={footerContent.copyright || ""} 
                          onChange={(e) => setFooterContent({ ...footerContent, copyright: e.target.value })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Columns structure */}
                    <div className="flex justify-between items-center mt-2">
                      <h3 className="text-sm font-bold text-foreground">Content Columns ({footerContent.columns?.length || 0})</h3>
                      <button 
                        onClick={() => {
                          const columns = [...(footerContent.columns || [])];
                          columns.push({ heading: "New Column", links: [] });
                          setFooterContent({ ...footerContent, columns });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Column
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(footerContent.columns || []).map((col: any, idx: number) => (
                        <div key={idx} className="border border-border/80 rounded-xl p-5 bg-white flex flex-col gap-4 relative">
                          <button 
                            onClick={() => {
                              const columns = [...footerContent.columns];
                              columns.splice(idx, 1);
                              setFooterContent({ ...footerContent, columns });
                            }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Column Header</label>
                            <input 
                              type="text" 
                              value={col.heading || ""} 
                              onChange={(e) => {
                                  const columns = [...footerContent.columns];
                                  columns[idx] = { ...columns[idx], heading: e.target.value };
                                  setFooterContent({ ...footerContent, columns });
                              }}
                              className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                            />
                          </div>

                          {/* Links in Column */}
                          <div className="border-t border-dashed border-border/80 pt-4 mt-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Links ({col.links?.length || 0})</span>
                              <button 
                                onClick={() => {
                                  const columns = [...footerContent.columns];
                                  const links = [...(columns[idx].links || [])];
                                  links.push({ label: "Link Item", href: "#" });
                                  columns[idx] = { ...columns[idx], links };
                                  setFooterContent({ ...footerContent, columns });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-semibold rounded transition-colors cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Link
                              </button>
                            </div>

                            <div className="flex flex-col gap-2">
                              {(col.links || []).map((link: any, lIdx: number) => (
                                <div key={lIdx} className="flex gap-2 items-center">
                                  <input 
                                    type="text" 
                                    placeholder="Label"
                                    value={link.label || ""} 
                                    onChange={(e) => {
                                      const columns = [...footerContent.columns];
                                      const links = [...columns[idx].links];
                                      links[lIdx] = { ...links[lIdx], label: e.target.value };
                                      columns[idx] = { ...columns[idx], links };
                                      setFooterContent({ ...footerContent, columns });
                                    }}
                                    className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Href Destination"
                                    value={link.href || ""} 
                                    onChange={(e) => {
                                      const columns = [...footerContent.columns];
                                      const links = [...columns[idx].links];
                                      links[lIdx] = { ...links[lIdx], href: e.target.value };
                                      columns[idx] = { ...columns[idx], links };
                                      setFooterContent({ ...footerContent, columns });
                                    }}
                                    className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                                  />
                                  <button 
                                    onClick={() => {
                                      const columns = [...footerContent.columns];
                                      const links = [...columns[idx].links];
                                      links.splice(lIdx, 1);
                                      columns[idx] = { ...columns[idx], links };
                                      setFooterContent({ ...footerContent, columns });
                                    }}
                                    className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Social links */}
                    <div className="border-t border-border pt-4 mt-2">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-foreground">Social Accounts</h3>
                        <button 
                          onClick={() => {
                            const social = [...(footerContent.social || [])];
                            social.push({ platform: "LinkedIn", href: "#", icon: "linkedin" });
                            setFooterContent({ ...footerContent, social });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Social Icon
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {(footerContent.social || []).map((soc: any, idx: number) => (
                          <div key={idx} className="bg-white border border-border/80 rounded-xl p-4 flex gap-4 items-center relative">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                              <div>
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Platform Name</label>
                                <input 
                                  type="text" 
                                  value={soc.platform || ""} 
                                  onChange={(e) => {
                                    const social = [...footerContent.social];
                                    social[idx] = { ...social[idx], platform: e.target.value };
                                    setFooterContent({ ...footerContent, social });
                                  }}
                                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Brand Icon Class Name</label>
                                <select 
                                  value={soc.icon || "globe"} 
                                  onChange={(e) => {
                                    const social = [...footerContent.social];
                                    social[idx] = { ...social[idx], icon: e.target.value };
                                    setFooterContent({ ...footerContent, social });
                                  }}
                                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                                >
                                  <option value="linkedin">LinkedIn</option>
                                  <option value="twitter">Twitter</option>
                                  <option value="xtwitter">X (Twitter)</option>
                                  <option value="github">GitHub</option>
                                  <option value="instagram">Instagram</option>
                                  <option value="youtube">YouTube</option>
                                  <option value="globe">Globe (Generic)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Profile URL / Href</label>
                                <input 
                                  type="text" 
                                  value={soc.href || ""} 
                                  onChange={(e) => {
                                    const social = [...footerContent.social];
                                    social[idx] = { ...social[idx], href: e.target.value };
                                    setFooterContent({ ...footerContent, social });
                                  }}
                                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                                />
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => {
                                const social = [...footerContent.social];
                                social.splice(idx, 1);
                                setFooterContent({ ...footerContent, social });
                              }}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legal bottom links */}
                    <div className="border-t border-border pt-4 mt-2">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-foreground">Bottom Legal Links</h3>
                        <button 
                          onClick={() => {
                            const bottomLinks = [...(footerContent.bottomLinks || [])];
                            bottomLinks.push({ label: "Terms of Service", href: "#" });
                            setFooterContent({ ...footerContent, bottomLinks });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Link
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {(footerContent.bottomLinks || []).map((link: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              placeholder="Label"
                              value={link.label || ""} 
                              onChange={(e) => {
                                const bottomLinks = [...footerContent.bottomLinks];
                                bottomLinks[idx] = { ...bottomLinks[idx], label: e.target.value };
                                setFooterContent({ ...footerContent, bottomLinks });
                              }}
                              className="flex-1 bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                            />
                            <input 
                              type="text" 
                              placeholder="Href Destination"
                              value={link.href || ""} 
                              onChange={(e) => {
                                const bottomLinks = [...footerContent.bottomLinks];
                                bottomLinks[idx] = { ...bottomLinks[idx], href: e.target.value };
                                setFooterContent({ ...footerContent, bottomLinks });
                              }}
                              className="flex-1 bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                            />
                            <button 
                              onClick={() => {
                                const bottomLinks = [...footerContent.bottomLinks];
                                bottomLinks.splice(idx, 1);
                                setFooterContent({ ...footerContent, bottomLinks });
                              }}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Platform / listing badges (e.g. Glassdoor, Clutch, Crunchbase) */}
                    <div className="border-t border-border pt-4 mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Platform Listings</h3>
                          <p className="text-xs text-secondary-text mt-0.5">Logos shown in the "As featured on" row of the footer, e.g. Glassdoor, Clutch, Crunchbase, GoodFirms.</p>
                        </div>
                        <button
                          onClick={() => {
                            const platforms = [...(footerContent.platforms || [])];
                            platforms.push({ name: "New Platform", imageUrl: "", link: "" });
                            setFooterContent({ ...footerContent, platforms });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Platform
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 mt-3">
                        {(footerContent.platforms || []).map((item: any, idx: number) => (
                          <div key={idx} className="bg-white border border-border/80 rounded-xl p-4 flex gap-4 items-end relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                              <div>
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Platform Name</label>
                                <input
                                  type="text"
                                  placeholder="Clutch"
                                  value={item.name || ""}
                                  onChange={(e) => {
                                    const platforms = [...footerContent.platforms];
                                    platforms[idx] = { ...platforms[idx], name: e.target.value };
                                    setFooterContent({ ...footerContent, platforms });
                                  }}
                                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Profile URL</label>
                                <input
                                  type="text"
                                  placeholder="https://clutch.co/profile/nitwebs"
                                  value={item.link || ""}
                                  onChange={(e) => {
                                    const platforms = [...footerContent.platforms];
                                    platforms[idx] = { ...platforms[idx], link: e.target.value };
                                    setFooterContent({ ...footerContent, platforms });
                                  }}
                                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                                />
                              </div>

                              <div className="md:col-span-2 flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Logo Image</label>
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-primary/50 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 shadow-sm">
                                    <Upload className="w-3.5 h-3.5 text-primary" />
                                    <span>Upload Logo</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const platforms = [...footerContent.platforms];
                                            platforms[idx] = { ...platforms[idx], imageUrl: reader.result };
                                            setFooterContent({ ...footerContent, platforms });
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>

                                  {item.imageUrl && (
                                    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-2 py-1 shadow-sm">
                                      <img src={item.imageUrl} alt={item.name || "Platform logo"} className="h-5 max-w-[80px] object-contain" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const platforms = [...footerContent.platforms];
                                          platforms[idx] = { ...platforms[idx], imageUrl: "" };
                                          setFooterContent({ ...footerContent, platforms });
                                        }}
                                        className="text-neutral-400 hover:text-red-500 text-xs transition-colors p-0.5"
                                        title="Remove logo image"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                const platforms = [...footerContent.platforms];
                                platforms.splice(idx, 1);
                                setFooterContent({ ...footerContent, platforms });
                              }}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Social Links */}
          {activeTab === "socialLinks" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-foreground">Social Links</h2>
                  <p className="text-xs text-secondary-text mt-1">Manage your social profile links. These are used site-wide — footer, drawer, and anywhere else they appear.</p>
                </div>
                <button
                  onClick={() => {
                    const updated = [...(content.socialLinks || [])];
                    updated.push({ platform: "LinkedIn", href: "https://linkedin.com/company/nitwebs", icon: "linkedin" });
                    setContent({ ...content, socialLinks: updated });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Social Link
                </button>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 sm:p-6 flex flex-col gap-4">
                {(!content.socialLinks || content.socialLinks.length === 0) && (
                  <p className="text-xs text-secondary-text text-center py-6">No social links added yet. Click "Add Social Link" to get started.</p>
                )}
                {(content.socialLinks || []).map((soc: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50 border border-border/80 rounded-xl p-4 flex gap-4 items-center relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                      <div>
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Platform Name</label>
                        <input
                          type="text"
                          value={soc.platform || ""}
                          onChange={(e) => {
                            const updated = [...content.socialLinks];
                            updated[idx] = { ...updated[idx], platform: e.target.value };
                            setContent({ ...content, socialLinks: updated });
                          }}
                          placeholder="e.g. LinkedIn"
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Icon</label>
                        <select
                          value={soc.icon || "linkedin"}
                          onChange={(e) => {
                            const updated = [...content.socialLinks];
                            updated[idx] = { ...updated[idx], icon: e.target.value };
                            setContent({ ...content, socialLinks: updated });
                          }}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none cursor-pointer"
                        >
                          <option value="linkedin">LinkedIn</option>
                          <option value="twitter">Twitter</option>
                          <option value="xtwitter">X (Twitter)</option>
                          <option value="github">GitHub</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="globe">Globe (Generic)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Profile URL</label>
                        <input
                          type="url"
                          value={soc.href || ""}
                          onChange={(e) => {
                            const updated = [...content.socialLinks];
                            updated[idx] = { ...updated[idx], href: e.target.value };
                            setContent({ ...content, socialLinks: updated });
                          }}
                          placeholder="https://linkedin.com/company/..."
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-lg px-3 py-1.5 text-xs text-neutral-900 outline-none font-mono"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = [...content.socialLinks];
                        updated.splice(idx, 1);
                        setContent({ ...content, socialLinks: updated });
                      }}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-full hover:opacity-90 shadow-sm cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Save Social Links
              </button>
            </div>
          )}

          {/* Tab: Dynamic Pages Builder */}

          {activeTab === "pages" && (
            <div className="flex flex-col gap-6">
              {!editingPage ? (
                /* List View */
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-headline text-foreground">Dynamic Pages</h2>
                      <p className="text-xs text-secondary-text mt-1">Manage dynamic client pages, status, and metadata SEO configurations.</p>
                    </div>
                    <button
                      onClick={() => setShowNewPageModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Page
                    </button>
                  </div>

                  {pagesLoading ? (
                    <div className="py-12 flex justify-center items-center">
                      <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : pages.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-neutral-200 rounded-xl">
                      <p className="text-sm text-secondary-text">No dynamic pages created yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full border-collapse text-left text-xs text-neutral-900">
                        <thead className="bg-neutral-50 border-b border-border text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Page Title</th>
                            <th className="px-6 py-4">URL Path (Slug)</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {pages.map((p) => (
                            <tr key={p._id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-foreground">{p.title}</td>
                              <td className="px-6 py-4 font-mono text-neutral-500">/{p.slug}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === "published" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingPage(JSON.parse(JSON.stringify(p)))}
                                  className="p-1 text-neutral-600 hover:text-primary transition-colors cursor-pointer"
                                  title="Edit Page Sections"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <a
                                  href={`/${p.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-neutral-600 hover:text-primary transition-colors"
                                  title="Preview Page"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeletePage(p.slug)}
                                  className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete Page"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Create Page Modal */}
                  {showNewPageModal && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                      <div className="bg-white border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div>
                          <h3 className="text-base font-bold text-foreground font-headline">Create Dynamic Page</h3>
                          <p className="text-xs text-neutral-500 mt-1">Initialize a page. Slugs must be alphanumeric lowercase words separated by dashes.</p>
                        </div>
                        <form onSubmit={handleCreatePage} className="flex flex-col gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Page Title</label>
                            <input
                              type="text"
                              required
                              value={newPageTitle}
                              onChange={(e) => {
                                setNewPageTitle(e.target.value);
                                // Generate matching slug automatically
                                setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                              }}
                              placeholder="e.g. Services Overview"
                              className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Page Slug (URL Path)</label>
                            <input
                              type="text"
                              required
                              value={newPageSlug}
                              onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                              placeholder="e.g. services-overview"
                              className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all font-mono"
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewPageModal(false);
                                setNewPageTitle("");
                                setNewPageSlug("");
                              }}
                              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all cursor-pointer"
                            >
                              Create Page
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit & Section Builder View */
                <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center gap-4">
                    <button
                      onClick={() => setEditingPage(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to list
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdatePage(editingPage)}
                        className="btn-primary pl-4 pr-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-bold font-headline text-foreground">Editing: {editingPage.title}</h2>
                      <p className="text-xs text-neutral-500 mt-1">Configure slug, SEO properties, and add or sort content sections.</p>
                    </div>

                    {/* Page Properties form */}
                    <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Page Title</label>
                        <input
                          type="text"
                          value={editingPage.title || ""}
                          onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Page Slug (Validated)</label>
                        <input
                          type="text"
                          value={editingPage.slug || ""}
                          onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Meta SEO Description</label>
                        <textarea
                          rows={2}
                          value={editingPage.metaDesc || ""}
                          onChange={(e) => setEditingPage({ ...editingPage, metaDesc: e.target.value })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Publication Status</label>
                        <select
                          value={editingPage.status || "draft"}
                          onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none cursor-pointer"
                        >
                          <option value="draft">Draft (Visible to admins only)</option>
                          <option value="published">Published (Visible to all public visitors)</option>
                        </select>
                      </div>
                    </div>

                    {/* Section Builder Canvas */}
                    <div className="flex justify-between items-center mt-4">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Page Sections List ({editingPage.sections?.length || 0})</h3>
                      <button
                        onClick={() => {
                          const sections = [...(editingPage.sections || [])];
                          sections.push({ type: "spacer", height: "py-12" });
                          setEditingPage({ ...editingPage, sections });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Section Block
                      </button>
                    </div>

                    <div className="flex flex-col gap-5 border-t border-border pt-4">
                      {(editingPage.sections || []).map((sec: any, idx: number) => {
                        const moveSection = (direction: "up" | "down") => {
                          const list = [...editingPage.sections];
                          if (direction === "up" && idx > 0) {
                            [list[idx], list[idx - 1]] = [list[idx - 1], list[idx]];
                          } else if (direction === "down" && idx < list.length - 1) {
                            [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
                          }
                          setEditingPage({ ...editingPage, sections: list });
                        };

                        const deleteSection = () => {
                          const list = [...editingPage.sections];
                          list.splice(idx, 1);
                          setEditingPage({ ...editingPage, sections: list });
                        };

                        const handleFieldChange = (field: string, value: any) => {
                          const list = [...editingPage.sections];
                          list[idx] = { ...list[idx], [field]: value };
                          setEditingPage({ ...editingPage, sections: list });
                        };

                        return (
                          <div key={idx} className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4 relative">
                            {/* Section Header Controls */}
                            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                                  #{idx + 1} {sec.type}
                                </span>
                                <select
                                  value={sec.type}
                                  onChange={(e) => handleFieldChange("type", e.target.value)}
                                  className="bg-transparent text-xs text-neutral-500 font-bold border-0 cursor-pointer focus:outline-none uppercase"
                                >
                                  <option value="hero">Hero Block</option>
                                  <option value="text">Text & Image Block</option>
                                  <option value="cards">Capabilities Cards</option>
                                  <option value="stats">Stats Counter Row</option>
                                  <option value="cta">CTA Banner</option>
                                  <option value="faq">FAQ Accordion</option>
                                  <option value="contact">Contact Form Block</option>
                                  <option value="testimonials">Testimonials Block</option>
                                  <option value="spacer">Blank Spacer</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => moveSection("up")}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-neutral-200 rounded text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSection("down")}
                                  disabled={idx === editingPage.sections.length - 1}
                                  className="p-1 hover:bg-neutral-200 rounded text-neutral-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={deleteSection}
                                  className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Section Form Fields based on Type */}
                            {sec.type === "hero" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Badge Text</label>
                                  <input
                                    type="text"
                                    value={sec.badge || ""}
                                    onChange={(e) => handleFieldChange("badge", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Button Call-To-Action Link</label>
                                  <input
                                    type="text"
                                    value={sec.btnLink || ""}
                                    onChange={(e) => handleFieldChange("btnLink", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none font-mono"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Hero Headline</label>
                                  <input
                                    type="text"
                                    value={sec.title || ""}
                                    onChange={(e) => handleFieldChange("title", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Description Paragraph</label>
                                  <textarea
                                    rows={3}
                                    value={sec.desc || ""}
                                    onChange={(e) => handleFieldChange("desc", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Button Call-To-Action Text</label>
                                  <input
                                    type="text"
                                    value={sec.btnText || ""}
                                    onChange={(e) => handleFieldChange("btnText", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.type === "text" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Badge Sub-line</label>
                                  <input
                                    type="text"
                                    value={sec.badge || ""}
                                    onChange={(e) => handleFieldChange("badge", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Image Alignment</label>
                                  <select
                                    value={sec.imagePosition || "right"}
                                    onChange={(e) => handleFieldChange("imagePosition", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none cursor-pointer"
                                  >
                                    <option value="right">Image on Right Column</option>
                                    <option value="left">Image on Left Column</option>
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Headline</label>
                                  <input
                                    type="text"
                                    value={sec.title || ""}
                                    onChange={(e) => handleFieldChange("title", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Description</label>
                                  <textarea
                                    rows={3}
                                    value={sec.desc || ""}
                                    onChange={(e) => handleFieldChange("desc", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Image URL (Optional)</label>
                                  <input
                                    type="text"
                                    value={sec.image || ""}
                                    onChange={(e) => handleFieldChange("image", e.target.value)}
                                    placeholder="Image link URL"
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none font-mono"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.type === "cards" && (
                              <div className="flex flex-col gap-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Badge Text</label>
                                    <input
                                      type="text"
                                      value={sec.badge || ""}
                                      onChange={(e) => handleFieldChange("badge", e.target.value)}
                                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Headline</label>
                                    <input
                                      type="text"
                                      value={sec.title || ""}
                                      onChange={(e) => handleFieldChange("title", e.target.value)}
                                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Description</label>
                                  <input
                                    type="text"
                                    value={sec.desc || ""}
                                    onChange={(e) => handleFieldChange("desc", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>

                                <div className="border-t border-dashed border-border/80 pt-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Cards Grid ({sec.cards?.length || 0})</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cards = [...(sec.cards || [])];
                                        cards.push({ icon: "Cpu", title: "New Capability", desc: "Capability details text." });
                                        handleFieldChange("cards", cards);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[9px] font-bold rounded transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-2.5 h-2.5" /> Add Card
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {(sec.cards || []).map((card: any, cIdx: number) => {
                                      const changeCardField = (cf: string, cv: any) => {
                                        const cards = [...sec.cards];
                                        cards[cIdx] = { ...cards[cIdx], [cf]: cv };
                                        handleFieldChange("cards", cards);
                                      };
                                      const deleteCard = () => {
                                        const cards = [...sec.cards];
                                        cards.splice(cIdx, 1);
                                        handleFieldChange("cards", cards);
                                      };
                                      return (
                                        <div key={cIdx} className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-col md:flex-row gap-3 relative">
                                          <div className="w-full md:w-1/4">
                                            <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Lucide Icon Name</label>
                                            <input
                                              type="text"
                                              value={card.icon || "Cpu"}
                                              onChange={(e) => changeCardField("icon", e.target.value)}
                                              className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-xs font-mono"
                                            />
                                          </div>
                                          <div className="w-full md:w-1/4">
                                            <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Card Title</label>
                                            <input
                                              type="text"
                                              value={card.title || ""}
                                              onChange={(e) => changeCardField("title", e.target.value)}
                                              className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-xs"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Card Description</label>
                                            <input
                                              type="text"
                                              value={card.desc || ""}
                                              onChange={(e) => changeCardField("desc", e.target.value)}
                                              className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-xs"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={deleteCard}
                                            className="text-neutral-400 hover:text-red-500 p-1 self-end md:self-center cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {sec.type === "stats" && (
                              <div className="flex flex-col gap-4 text-xs">
                                <div className="border-b border-dashed border-neutral-200 pb-2 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Stats counters list ({sec.stats?.length || 0})</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const stats = [...(sec.stats || [])];
                                      stats.push({ value: "100", suffix: "+", label: "New Stat Metric" });
                                      handleFieldChange("stats", stats);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[9px] font-bold rounded transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Add Metric
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {(sec.stats || []).map((stat: any, sIdx: number) => {
                                    const changeStatField = (sf: string, sv: any) => {
                                      const stats = [...sec.stats];
                                      stats[sIdx] = { ...stats[sIdx], [sf]: sv };
                                      handleFieldChange("stats", stats);
                                    };
                                    const deleteStat = () => {
                                      const stats = [...sec.stats];
                                      stats.splice(sIdx, 1);
                                      handleFieldChange("stats", stats);
                                    };
                                    return (
                                      <div key={sIdx} className="bg-white border border-neutral-200 rounded-xl p-3 flex gap-3 relative items-center">
                                        <div className="w-20">
                                          <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Number</label>
                                          <input
                                            type="text"
                                            value={stat.value || ""}
                                            onChange={(e) => changeStatField("value", e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs"
                                          />
                                        </div>
                                        <div className="w-16">
                                          <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Suffix</label>
                                          <input
                                            type="text"
                                            value={stat.suffix || ""}
                                            onChange={(e) => changeStatField("suffix", e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-mono"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Label Text</label>
                                          <input
                                            type="text"
                                            value={stat.label || ""}
                                            onChange={(e) => changeStatField("label", e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={deleteStat}
                                          className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {sec.type === "cta" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">CTA Banner Title</label>
                                  <input
                                    type="text"
                                    value={sec.title || ""}
                                    onChange={(e) => handleFieldChange("title", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">CTA Link Destination</label>
                                  <input
                                    type="text"
                                    value={sec.btnLink || ""}
                                    onChange={(e) => handleFieldChange("btnLink", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none font-mono"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">CTA Banner Description</label>
                                  <input
                                    type="text"
                                    value={sec.desc || ""}
                                    onChange={(e) => handleFieldChange("desc", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Button Text Label</label>
                                  <input
                                    type="text"
                                    value={sec.btnText || ""}
                                    onChange={(e) => handleFieldChange("btnText", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.type === "faq" && (
                              <div className="flex flex-col gap-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Badge Text</label>
                                    <input
                                      type="text"
                                      value={sec.badge || ""}
                                      onChange={(e) => handleFieldChange("badge", e.target.value)}
                                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">FAQ Headline</label>
                                    <input
                                      type="text"
                                      value={sec.title || ""}
                                      onChange={(e) => handleFieldChange("title", e.target.value)}
                                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">FAQ Description</label>
                                  <input
                                    type="text"
                                    value={sec.desc || ""}
                                    onChange={(e) => handleFieldChange("desc", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>

                                <div className="border-t border-dashed border-border/80 pt-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">FAQs List ({sec.faqs?.length || 0})</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const faqs = [...(sec.faqs || [])];
                                        faqs.push({ q: "New Question?", a: "Details response text." });
                                        handleFieldChange("faqs", faqs);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[9px] font-bold rounded transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-2.5 h-2.5" /> Add FAQ
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {(sec.faqs || []).map((faq: any, fIdx: number) => {
                                      const changeFaqField = (ff: string, fv: any) => {
                                        const faqs = [...sec.faqs];
                                        faqs[fIdx] = { ...faqs[fIdx], [ff]: fv };
                                        handleFieldChange("faqs", faqs);
                                      };
                                      const deleteFaq = () => {
                                        const faqs = [...sec.faqs];
                                        faqs.splice(fIdx, 1);
                                        handleFieldChange("faqs", faqs);
                                      };
                                      return (
                                        <div key={fIdx} className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-col gap-2 relative">
                                          <div className="flex gap-2 items-center justify-between">
                                            <input
                                              type="text"
                                              placeholder="Question text?"
                                              value={faq.q || ""}
                                              onChange={(e) => changeFaqField("q", e.target.value)}
                                              className="flex-1 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-semibold"
                                            />
                                            <button
                                              type="button"
                                              onClick={deleteFaq}
                                              className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <textarea
                                            rows={2}
                                            placeholder="Answer detail text"
                                            value={faq.a || ""}
                                            onChange={(e) => changeFaqField("a", e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {sec.type === "contact" && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Badge Text</label>
                                  <input
                                    type="text"
                                    value={sec.badge || ""}
                                    onChange={(e) => handleFieldChange("badge", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Contact Headline</label>
                                  <input
                                    type="text"
                                    value={sec.title || ""}
                                    onChange={(e) => handleFieldChange("title", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Contact Paragraph Description</label>
                                  <input
                                    type="text"
                                    value={sec.desc || ""}
                                    onChange={(e) => handleFieldChange("desc", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            {sec.type === "testimonials" && (
                              <div className="flex flex-col gap-4 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Badge Text</label>
                                    <input
                                      type="text"
                                      value={sec.badge || ""}
                                      onChange={(e) => handleFieldChange("badge", e.target.value)}
                                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Headline</label>
                                    <input
                                      type="text"
                                      value={sec.title || ""}
                                      onChange={(e) => handleFieldChange("title", e.target.value)}
                                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Section Description</label>
                                  <input
                                    type="text"
                                    value={sec.desc || ""}
                                    onChange={(e) => handleFieldChange("desc", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none"
                                  />
                                </div>

                                <div className="border-t border-dashed border-border/80 pt-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Testimonials List ({sec.testimonials?.length || 0})</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const testimonials = [...(sec.testimonials || [])];
                                        testimonials.push({ name: "Client Name", role: "Role, Company", review: "Great review feedback." });
                                        handleFieldChange("testimonials", testimonials);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[9px] font-bold rounded transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-2.5 h-2.5" /> Add Review
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {(sec.testimonials || []).map((t: any, tIdx: number) => {
                                      const changeTestField = (tf: string, tv: any) => {
                                        const testimonials = [...sec.testimonials];
                                        testimonials[tIdx] = { ...testimonials[tIdx], [tf]: tv };
                                        handleFieldChange("testimonials", testimonials);
                                      };
                                      const deleteTest = () => {
                                        const testimonials = [...sec.testimonials];
                                        testimonials.splice(tIdx, 1);
                                        handleFieldChange("testimonials", testimonials);
                                      };
                                      return (
                                        <div key={tIdx} className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-col gap-2 relative">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input
                                              type="text"
                                              placeholder="Client Name"
                                              value={t.name || ""}
                                              onChange={(e) => changeTestField("name", e.target.value)}
                                              className="bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                                            />
                                            <div className="flex gap-2 items-center">
                                              <input
                                                type="text"
                                                placeholder="Role / Title, Company"
                                                value={t.role || ""}
                                                onChange={(e) => changeTestField("role", e.target.value)}
                                                className="flex-1 bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-xs"
                                              />
                                              <button
                                                type="button"
                                                onClick={deleteTest}
                                                className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                          <textarea
                                            rows={2}
                                            placeholder="Review quote text"
                                            value={t.review || ""}
                                            onChange={(e) => changeTestField("review", e.target.value)}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {sec.type === "spacer" && (
                              <div className="grid grid-cols-1 gap-4 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Spacer Padding Size</label>
                                  <select
                                    value={sec.height || "py-12"}
                                    onChange={(e) => handleFieldChange("height", e.target.value)}
                                    className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-neutral-900 outline-none cursor-pointer"
                                  >
                                    <option value="py-4">Small - 16px (py-4)</option>
                                    <option value="py-8">Medium - 32px (py-8)</option>
                                    <option value="py-12">Standard - 48px (py-12)</option>
                                    <option value="py-16">Large - 64px (py-16)</option>
                                    <option value="py-24">Extra Large - 96px (py-24)</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Jobs Board Manager */}
          {activeTab === "jobs" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              {!editingJob ? (
                /* List View */
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold font-headline text-foreground">Careers Job Board</h2>
                      <p className="text-xs text-secondary-text mt-1">Configure open job postings, metadata, requirements, and status.</p>
                    </div>
                    <button
                      onClick={() => setShowNewJobModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Job Opening
                    </button>
                  </div>

                  {adminJobsLoading ? (
                    <div className="py-12 flex justify-center items-center">
                      <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : adminJobs.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                      <p className="text-sm text-secondary-text">No job openings created yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full border-collapse text-left text-xs text-neutral-900">
                        <thead className="bg-neutral-50 border-b border-border text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Job Title</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Location / Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {adminJobs.map((j) => (
                            <tr key={j._id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-foreground">{j.title}</td>
                              <td className="px-6 py-4 text-neutral-500">{j.department || "N/A"}</td>
                              <td className="px-6 py-4 font-sans text-neutral-500">
                                {j.location} • <span className="uppercase text-[10px] font-bold text-primary">{j.employmentType}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  j.status === "open" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                                }`}>
                                  {j.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingJob(JSON.parse(JSON.stringify(j)))}
                                  className="p-1 text-neutral-600 hover:text-primary transition-colors cursor-pointer"
                                  title="Edit Job Details"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <a
                                  href={`/careers/${j.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-neutral-600 hover:text-primary transition-colors"
                                  title="View Public Link"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteJob(j._id)}
                                  className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete Job"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Create Job Modal */}
                  {showNewJobModal && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                      <div className="bg-white border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div>
                          <h3 className="text-base font-bold text-foreground font-headline">Create Job Opening</h3>
                          <p className="text-xs text-neutral-500 mt-1">Configure metadata and candidate requirements details.</p>
                        </div>
                        <form onSubmit={handleCreateJob} className="flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Job Title *</label>
                              <input
                                type="text"
                                required
                                value={newJobTitle}
                                onChange={(e) => setNewJobTitle(e.target.value)}
                                placeholder="e.g. Senior Backend Engineer"
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Department</label>
                              <input
                                type="text"
                                value={newJobDept}
                                onChange={(e) => setNewJobDept(e.target.value)}
                                placeholder="e.g. Engineering"
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Location</label>
                              <div className="flex flex-col gap-1.5">
                                <select
                                  value={["Onsite", "Remote", "Hybrid", "Ludhiana, Punjab", "Greater Noida, UP"].includes(newJobLocation) ? newJobLocation : "Custom"}
                                  onChange={(e) => {
                                    if (e.target.value !== "Custom") setNewJobLocation(e.target.value);
                                  }}
                                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3 py-1.5 text-xs text-neutral-900 outline-none cursor-pointer"
                                >
                                  <option value="Onsite">Onsite</option>
                                  <option value="Remote">Remote</option>
                                  <option value="Hybrid">Hybrid</option>
                                  <option value="Ludhiana, Punjab">Ludhiana, Punjab</option>
                                  <option value="Greater Noida, UP">Greater Noida, UP</option>
                                  <option value="Custom">Custom Location...</option>
                                </select>
                                <input
                                  type="text"
                                  value={newJobLocation}
                                  onChange={(e) => setNewJobLocation(e.target.value)}
                                  placeholder="e.g. Onsite, Remote, or city"
                                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-1.5 text-xs text-neutral-900 outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Employment Type</label>
                              <select
                                value={newJobType}
                                onChange={(e) => setNewJobType(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3 py-2 text-xs text-neutral-900 outline-none cursor-pointer"
                              >
                                <option value="full-time">Full-Time</option>
                                <option value="part-time">Part-Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Min Experience (Years Required)</label>
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={newJobMinExperience}
                                onChange={(e) => setNewJobMinExperience(parseInt(e.target.value) || 0)}
                                placeholder="0 (No minimum experience)"
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Experience Level Label</label>
                              <input
                                type="text"
                                value={newJobExperienceLevel}
                                onChange={(e) => setNewJobExperienceLevel(e.target.value)}
                                placeholder="e.g. Mid-Senior Level or 3+ Years"
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Salary Range / Compensation</label>
                              <input
                                type="text"
                                value={newJobSalaryRange}
                                onChange={(e) => setNewJobSalaryRange(e.target.value)}
                                placeholder="e.g. $120,000 - $150,000 / year"
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Card Summary (1-2 sentences)</label>
                            <input
                              type="text"
                              value={newJobSummary}
                              onChange={(e) => setNewJobSummary(e.target.value)}
                              placeholder="Brief summary for listings card view"
                              className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Job Details Description (HTML allowed)</label>
                            <textarea
                              rows={4}
                              value={newJobDesc}
                              onChange={(e) => setNewJobDesc(e.target.value)}
                              placeholder="Full description paragraph layout"
                              className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none"
                            />
                          </div>

                          {/* Requirements list */}
                          <div className="border-t border-dashed border-neutral-200 pt-3">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Requirements List ({newJobRequirements.length})</span>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={newJobReqInput}
                                onChange={(e) => setNewJobReqInput(e.target.value)}
                                placeholder="Add a candidate requirement..."
                                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (newJobReqInput) {
                                      setNewJobRequirements([...newJobRequirements, newJobReqInput]);
                                      setNewJobReqInput("");
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newJobReqInput) {
                                    setNewJobRequirements([...newJobRequirements, newJobReqInput]);
                                    setNewJobReqInput("");
                                  }
                                }}
                                className="px-3 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                              {newJobRequirements.map((req, rIdx) => (
                                <div key={rIdx} className="flex gap-2 items-center bg-neutral-50 rounded px-2.5 py-1.5 text-xs text-neutral-700">
                                  <span className="flex-1 truncate">{req}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...newJobRequirements];
                                      updated.splice(rIdx, 1);
                                      setNewJobRequirements(updated);
                                    }}
                                    className="text-neutral-400 hover:text-red-500 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewJobModal(false);
                                setNewJobTitle("");
                                setNewJobDept("");
                                setNewJobLocation("Remote");
                                setNewJobType("full-time");
                                setNewJobSummary("");
                                setNewJobDesc("");
                                setNewJobRequirements([]);
                                setNewJobReqInput("");
                              }}
                              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all cursor-pointer"
                            >
                              Create Job
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit View */
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center gap-4">
                    <button
                      onClick={() => setEditingJob(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to jobs
                    </button>
                    <button
                      onClick={() => handleUpdateJob(editingJob)}
                      className="btn-primary pl-4 pr-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>

                  <div className="border-t border-border pt-4 flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-bold font-headline text-foreground">Editing: {editingJob.title}</h2>
                      <p className="text-xs text-neutral-500 mt-1">Configure metadata details, bullet requirements, and status.</p>
                    </div>

                    <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-5 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Job Title</label>
                          <input
                            type="text"
                            value={editingJob.title || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Validated Slug (URL Path)</label>
                          <input
                            type="text"
                            value={editingJob.slug || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Department</label>
                          <input
                            type="text"
                            value={editingJob.department || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Location</label>
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={["Onsite", "Remote", "Hybrid", "Ludhiana, Punjab", "Greater Noida, UP"].includes(editingJob.location) ? editingJob.location : "Custom"}
                              onChange={(e) => {
                                if (e.target.value !== "Custom") setEditingJob({ ...editingJob, location: e.target.value });
                              }}
                              className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-3.5 py-2 text-xs text-neutral-900 outline-none cursor-pointer"
                            >
                              <option value="Onsite">Onsite</option>
                              <option value="Remote">Remote</option>
                              <option value="Hybrid">Hybrid</option>
                              <option value="Ludhiana, Punjab">Ludhiana, Punjab</option>
                              <option value="Greater Noida, UP">Greater Noida, UP</option>
                              <option value="Custom">Custom Location...</option>
                            </select>
                            <input
                              type="text"
                              value={editingJob.location || ""}
                              onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                              placeholder="e.g. Onsite, Remote, or city"
                              className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2 text-xs text-neutral-900 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Employment Type</label>
                          <select
                            value={editingJob.employmentType || "full-time"}
                            onChange={(e) => setEditingJob({ ...editingJob, employmentType: e.target.value })}
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none cursor-pointer"
                          >
                            <option value="full-time">Full-Time</option>
                            <option value="part-time">Part-Time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Publication Status</label>
                          <select
                            value={editingJob.status || "open"}
                            onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none cursor-pointer"
                          >
                            <option value="open">Open (Accepting applicants)</option>
                            <option value="closed">Closed (Archived / Closed)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Min Experience (Years Required)</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={editingJob.minExperience ?? editingJob.min_experience ?? 0}
                            onChange={(e) => setEditingJob({ ...editingJob, minExperience: parseInt(e.target.value) || 0, min_experience: parseInt(e.target.value) || 0 })}
                            placeholder="0 (No minimum experience)"
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Experience Level Label</label>
                          <input
                            type="text"
                            value={editingJob.experienceLevel || editingJob.experience_level || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, experienceLevel: e.target.value, experience_level: e.target.value })}
                            placeholder="e.g. Mid-Senior Level or 3+ Years"
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Salary Range / Compensation</label>
                          <input
                            type="text"
                            value={editingJob.salaryRange || editingJob.salary_range || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value, salary_range: e.target.value })}
                            placeholder="e.g. $120,000 - $150,000 / year"
                            className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Listings Summary (1-2 sentences)</label>
                        <input
                          type="text"
                          value={editingJob.summary || ""}
                          onChange={(e) => setEditingJob({ ...editingJob, summary: e.target.value })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Job Description Body (HTML allowed)</label>
                        <textarea
                          rows={6}
                          value={editingJob.description || ""}
                          onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                          className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                        />
                      </div>

                      <div className="border-t border-dashed border-neutral-200 pt-4">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Edit Requirements List ({editingJob.requirements?.length || 0})</span>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            id="editingJobReqInput"
                            placeholder="Add a new requirement..."
                            className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const inputEl = document.getElementById("editingJobReqInput") as HTMLInputElement;
                                if (inputEl && inputEl.value) {
                                  const reqs = [...(editingJob.requirements || [])];
                                  reqs.push(inputEl.value);
                                  setEditingJob({ ...editingJob, requirements: reqs });
                                  inputEl.value = "";
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const inputEl = document.getElementById("editingJobReqInput") as HTMLInputElement;
                              if (inputEl && inputEl.value) {
                                const reqs = [...(editingJob.requirements || [])];
                                reqs.push(inputEl.value);
                                setEditingJob({ ...editingJob, requirements: reqs });
                                inputEl.value = "";
                              }
                            }}
                            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[10px] font-bold rounded transition-colors cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                          {(editingJob.requirements || []).map((req: string, rIdx: number) => (
                            <div key={rIdx} className="flex gap-3 items-center bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-700">
                              <span className="flex-1 font-sans">{req}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const reqs = [...editingJob.requirements];
                                  reqs.splice(rIdx, 1);
                                  setEditingJob({ ...editingJob, requirements: reqs });
                                }}
                                className="text-neutral-400 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Job Applications list */}
          {activeTab === "applications" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold font-headline text-foreground">Careers Job Applications</h2>
                <p className="text-xs text-secondary-text mt-1">Review candidate resumes, information sheets, and cover notes.</p>
              </div>

              {adminAppsLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : adminApps.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                  <p className="text-sm text-secondary-text">No job applications submitted yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {adminApps.map((app) => {
                    const jobTitleName = app.jobTitle || app.job_title || app.jobName || app.job_name || "General Position";
                    const submittedDateVal = app.submittedAt || app.submitted_at || app.created_at || app.createdAt;
                    const rawResumePath = app.resumePath || app.resume_path || app.resume || "";
                    const resumeUrl = rawResumePath ? getUploadUrl(rawResumePath) : "";
                    const appId = app._id || app.id;

                    return (
                      <div key={appId} className="bg-neutral-50/50 border border-border/80 rounded-2xl p-5 md:p-6 flex flex-col gap-4 relative hover:shadow-sm transition-all text-left">
                        <button
                          onClick={() => handleDeleteApp(appId)}
                          className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 p-1 cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3 pr-8">
                          <div>
                            <h3 className="text-sm font-bold text-foreground font-sans">{app.name}</h3>
                            <p className="text-xs text-neutral-500 font-sans mt-0.5">
                              Applied for: <span className="font-bold text-primary">{jobTitleName}</span>
                            </p>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-sans">
                            {submittedDateVal ? new Date(submittedDateVal).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-neutral-700">
                          <div className="flex items-center gap-2">
                            <strong className="text-neutral-500 uppercase tracking-widest text-[9px] w-12 shrink-0">Email:</strong>
                            <a href={`mailto:${app.email}`} className="text-primary hover:underline truncate">{app.email}</a>
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-2">
                              <strong className="text-neutral-500 uppercase tracking-widest text-[9px] w-12 shrink-0">Phone:</strong>
                              <span>{app.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <strong className="text-neutral-500 uppercase tracking-widest text-[9px] w-16 shrink-0">Experience:</strong>
                            <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px]">{app.experienceYears ?? app.experience_years ?? 0} Years</span>
                          </div>
                        </div>

                        {(app.coverNote || app.cover_note) && (
                          <div className="bg-white border border-border/50 rounded-xl p-4 text-xs leading-relaxed text-secondary-text font-sans">
                            <strong className="text-neutral-600 block mb-1">Cover Note:</strong>
                            <p className="whitespace-pre-wrap">{app.coverNote || app.cover_note}</p>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          {resumeUrl ? (
                            <a
                              href={resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-primary text-white text-xs font-semibold rounded-full hover:opacity-90 transition-all shadow cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5 rotate-180" /> Download Resume (PDF/DOC)
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400 italic font-sans">No Resume File Uploaded</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Team Gallery */}
          {activeTab === "gallery" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold font-headline text-neutral-900">Life at Nitwebs — Team Gallery</h2>
                <p className="text-xs text-neutral-600 mt-1">
                  Upload photos of team outings, trips, celebrations, and office moments to feature in the "Life at Nitwebs" section.
                </p>
              </div>

              {/* Upload Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPhotoFile) return alert("Please select an image file.");
                setUploadingPhoto(true);
                const token = localStorage.getItem("adminToken");
                const formData = new FormData();
                formData.append("photo", newPhotoFile);
                formData.append("image", newPhotoFile);
                formData.append("caption", newPhotoCaption);
                formData.append("category", newPhotoCategory);

                fetch(`${API_BASE}/gallery`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${token}` },
                  body: formData
                })
                  .then(res => res.json())
                  .then(data => {
                    if (data.photo || data.url || data.id) {
                      setNewPhotoFile(null);
                      setNewPhotoCaption("");
                      setNewPhotoCategory("office");
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                      fetchGalleryPhotos();
                    } else {
                      alert(data.message || "Upload failed");
                    }
                  })
                  .catch(err => alert(err.message))
                  .finally(() => setUploadingPhoto(false));
              }} className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" /> Upload New Team Photo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                      Photo File (JPG, PNG, WEBP)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
                      className="w-full bg-white border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                      Caption / Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="e.g. Annual Mountain Retreat & Camping 🏕️"
                      className="w-full bg-white border border-neutral-200 focus:border-primary/50 rounded-xl px-4 py-2.5 text-xs text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={uploadingPhoto || !newPhotoFile}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadingPhoto ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Add Photo to Gallery
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Gallery Photos Grid */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Uploaded Photos ({galleryPhotos.length})
                  </h3>
                  <button
                    onClick={fetchGalleryPhotos}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {galleryLoading ? (
                  <div className="py-12 flex justify-center items-center">
                    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : galleryPhotos.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50 p-6">
                    <Camera className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-sans">No custom team photos uploaded yet. Public site will display default curated team photos until you upload yours.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryPhotos.map((photo) => {
                      const photoId = photo.id || photo._id;
                      const photoSrc = photo.url.startsWith("http") ? photo.url : `${API_BASE.replace(/\/api$/, '')}${photo.url}`;
                      return (
                        <div key={photoId} className="group relative bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                          <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                            <img
                              src={photoSrc}
                              alt={photo.caption || "Team photo"}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="p-3 flex items-center justify-between gap-2 border-t border-neutral-200 bg-white">
                            <p className="text-xs font-medium text-neutral-800 truncate flex-1" title={photo.caption}>
                              {photo.caption || "No caption"}
                            </p>
                            <button
                              onClick={() => {
                                if (!confirm("Delete this photo permanently?")) return;
                                const token = localStorage.getItem("adminToken");
                                fetch(`${API_BASE}/gallery?id=${photoId}`, {
                                  method: "DELETE",
                                  headers: { "Authorization": `Bearer ${token}` }
                                })
                                  .then(res => res.json())
                                  .then(() => fetchGalleryPhotos())
                                  .catch(err => alert(err.message));
                              }}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security & Credentials Tab */}
          {activeTab === "security" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold font-headline text-neutral-900">Admin Security & OTP Configuration</h2>
                <p className="text-xs text-neutral-600 mt-1">Manage your admin username, registered email address for receiving OTP login codes, and password.</p>
                {profileLoading && (
                  <div className="text-xs text-primary font-semibold animate-pulse mt-2">Loading profile settings...</div>
                )}
              </div>

              {profileSuccess && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-xs font-medium">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 border-t border-border pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Admin Username</label>
                    <input 
                      type="text" 
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">
                      Admin Email (Receives 2FA Login OTPs)
                    </label>
                    <input 
                      type="email" 
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="admin@nitwebs.com"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                      required
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">All login OTP security codes will be sent to this email address.</span>
                  </div>
                </div>

                <div className="border-t border-border/80 pt-4 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Change Password (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={profileNewPassword}
                        onChange={(e) => setProfileNewPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={profileConfirmPassword}
                        onChange={(e) => setProfileConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/80 pt-4">
                  <div className="max-w-md">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="password" 
                      value={profileCurrentPassword}
                      onChange={(e) => setProfileCurrentPassword(e.target.value)}
                      placeholder="Enter current password to authorize changes"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-semibold rounded-full hover:opacity-90 shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving Credentials & SMTP...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Security & Mail Settings
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* SMTP Mail Server Configuration Card */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6 mt-8">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 font-headline flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" /> SMTP Mail Server Configuration
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Configure your custom SMTP server (Gmail, Hostinger Mail, Mailtrap, Amazon SES, SendGrid) to send OTP security codes, contact inquiries, and alerts.</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={content?.smtp?.enabled === true}
                      onChange={(e) => setContent({
                        ...content,
                        smtp: { ...content?.smtp, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-neutral-800">Enable SMTP Dispatch</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">SMTP Host Address</label>
                    <input 
                      type="text" 
                      value={content?.smtp?.host || ""}
                      onChange={(e) => setContent({ ...content, smtp: { ...content?.smtp, host: e.target.value } })}
                      placeholder="smtp.gmail.com or mail.hostinger.com"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">SMTP Port</label>
                    <input 
                      type="number" 
                      value={content?.smtp?.port || 587}
                      onChange={(e) => setContent({ ...content, smtp: { ...content?.smtp, port: parseInt(e.target.value) || 587 } })}
                      placeholder="587"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Encryption Protocol</label>
                    <select 
                      value={content?.smtp?.encryption || "tls"}
                      onChange={(e) => setContent({ ...content, smtp: { ...content?.smtp, encryption: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none cursor-pointer"
                    >
                      <option value="tls">TLS / STARTTLS (Port 587 - Recommended)</option>
                      <option value="ssl">SSL / SMTPS (Port 465)</option>
                      <option value="none">None / Plain Text (Port 25)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">SMTP Username / Email</label>
                    <input 
                      type="text" 
                      value={content?.smtp?.username || ""}
                      onChange={(e) => setContent({ ...content, smtp: { ...content?.smtp, username: e.target.value } })}
                      placeholder="info@nitwebs.com or user@gmail.com"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">SMTP Password / App Password</label>
                    <input 
                      type="password" 
                      value={content?.smtp?.password || ""}
                      onChange={(e) => setContent({ ...content, smtp: { ...content?.smtp, password: e.target.value } })}
                      placeholder="••••••••••••"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">From Sender Email</label>
                    <input 
                      type="email" 
                      value={content?.smtp?.from_email || ""}
                      onChange={(e) => setContent({ ...content, smtp: { ...content?.smtp, from_email: e.target.value } })}
                      placeholder="no-reply@nitwebs.com"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">From Sender Name</label>
                    <input 
                      type="text" 
                      value={content?.smtp?.from_name || "Nitwebs Platform"}
                      onChange={(e) => setContent({ ...content, smtp: { ...content?.smtp, from_name: e.target.value } })}
                      placeholder="Nitwebs Platform"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                    />
                  </div>
                </div>

                {/* Send Test Email Action Box */}
                <div className="border-t border-border/80 pt-6 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Test SMTP Connection</h4>

                  {smtpTestMsg && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {smtpTestMsg}
                    </div>
                  )}

                  {smtpTestError && (
                    <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-xs font-medium font-mono whitespace-pre-wrap">
                      {smtpTestError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input 
                      type="email" 
                      value={testRecipientEmail || profileEmail}
                      onChange={(e) => setTestRecipientEmail(e.target.value)}
                      placeholder="Enter recipient email to test"
                      className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={testingSmtp}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all disabled:opacity-50 shrink-0"
                    >
                      {testingSmtp ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Send Test Email via SMTP
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO & Search Engine Tab */}
          {activeTab === "seo" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold font-headline text-neutral-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" /> SEO & Search Engine Optimization
                </h2>
                <p className="text-xs text-neutral-600 mt-1">Configure global search engine metadata, OpenGraph social share previews, webmaster verification tags, and structured JSON-LD schema.</p>
              </div>

              {/* Card 1: Primary Search Metadata */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6">
                <h3 className="text-sm font-bold text-neutral-800 font-headline pb-2 border-b border-border">Global Search Engine Meta Tags</h3>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Global Meta Title</label>
                  <input 
                    type="text" 
                    value={content?.seo?.metaTitle || ""}
                    onChange={(e) => setContent({ ...content, seo: { ...content?.seo, metaTitle: e.target.value } })}
                    placeholder="Nitwebs | AI-first Software Development & SaaS Company"
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">Appears as the primary title link in Google search results (Recommended: 50-60 characters).</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Global Meta Description</label>
                  <textarea 
                    rows={3}
                    value={content?.seo?.metaDescription || ""}
                    onChange={(e) => setContent({ ...content, seo: { ...content?.seo, metaDescription: e.target.value } })}
                    placeholder="Nitwebs is an AI-first software development company building custom software, AI agents, mobile apps, and scalable SaaS platforms worldwide."
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">Appears as the page snippet under the title in Google search results (Recommended: 150-160 characters).</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Meta Keywords (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={content?.seo?.metaKeywords || ""}
                    onChange={(e) => setContent({ ...content, seo: { ...content?.seo, metaKeywords: e.target.value } })}
                    placeholder="AI software development, SaaS engineering, custom software, AI agents, cloud infrastructure"
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none"
                  />
                </div>
              </div>

              {/* Card 2: OpenGraph & Social Sharing */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6">
                <h3 className="text-sm font-bold text-neutral-800 font-headline pb-2 border-b border-border">Social Media Sharing (OpenGraph & Twitter Cards)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Canonical Site URL</label>
                    <input 
                      type="url" 
                      value={content?.seo?.canonicalUrl || ""}
                      onChange={(e) => setContent({ ...content, seo: { ...content?.seo, canonicalUrl: e.target.value } })}
                      placeholder="https://nitwebs.com"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Robots Indexing Directive</label>
                    <select 
                      value={content?.seo?.robots || "index, follow"}
                      onChange={(e) => setContent({ ...content, seo: { ...content?.seo, robots: e.target.value } })}
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none cursor-pointer"
                    >
                      <option value="index, follow">index, follow (Allow search engines to index and follow links)</option>
                      <option value="noindex, follow">noindex, follow (Do not index page, but follow links)</option>
                      <option value="noindex, nofollow">noindex, nofollow (Block search engine indexing)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Default Social Sharing Banner Image (OG Image)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setContent({ ...content, seo: { ...content?.seo, ogImage: reader.result } });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-tint file:text-primary hover:file:opacity-90 cursor-pointer"
                  />

                  {content?.seo?.ogImage && (
                    <div className="mt-3 border border-border rounded-xl p-4 bg-neutral-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={content.seo.ogImage} alt="OG Social Preview" className="h-12 w-24 object-cover rounded-lg border border-neutral-200" />
                        <span className="text-xs font-bold text-neutral-800">Social Share Image Active</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setContent({ ...content, seo: { ...content?.seo, ogImage: "" } })}
                        className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Webmaster Verification & Analytics */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6">
                <h3 className="text-sm font-bold text-neutral-800 font-headline pb-2 border-b border-border">Webmaster Verification & Analytics Tracking</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Google Search Console Verification Tag</label>
                    <input 
                      type="text" 
                      value={content?.seo?.googleVerification || ""}
                      onChange={(e) => setContent({ ...content, seo: { ...content?.seo, googleVerification: e.target.value } })}
                      placeholder="e.g. google1234567890abcdef"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Bing Webmaster Verification Tag</label>
                    <input 
                      type="text" 
                      value={content?.seo?.bingVerification || ""}
                      onChange={(e) => setContent({ ...content, seo: { ...content?.seo, bingVerification: e.target.value } })}
                      placeholder="e.g. 1234567890ABCDEF"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Google Analytics GA4 Tracking ID</label>
                    <input 
                      type="text" 
                      value={content?.seo?.googleAnalyticsId || ""}
                      onChange={(e) => setContent({ ...content, seo: { ...content?.seo, googleAnalyticsId: e.target.value } })}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full bg-neutral-50 border border-neutral-200 focus:border-primary/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-neutral-900 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Structured Data JSON-LD Schema */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
                  <h3 className="text-sm font-bold text-neutral-800 font-headline">JSON-LD Structured Data Schema Markup</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleSchema = {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Nitwebs",
                        "url": "https://nitwebs.com/",
                        "logo": "https://nitwebs.com/favicon.svg",
                        "description": "AI-first software development company building custom software, SaaS applications, and cloud infrastructure.",
                        "email": "sales@nitwebs.com",
                        "telephone": "+91-911-555-6455"
                      };
                      setContent({ ...content, seo: { ...content?.seo, structuredData: JSON.stringify(sampleSchema, null, 2) } });
                    }}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Insert Sample Organization Schema
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">JSON-LD Schema Markup (Valid JSON)</label>
                  <textarea 
                    rows={8}
                    value={content?.seo?.structuredData || ""}
                    onChange={(e) => setContent({ ...content, seo: { ...content?.seo, structuredData: e.target.value } })}
                    placeholder='{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Nitwebs"\n}'
                    className="w-full bg-neutral-900 text-emerald-400 border border-neutral-800 rounded-xl p-4 text-xs font-mono outline-none leading-relaxed"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">Injected into page head for Google rich snippets, Knowledge Graphs, and Schema validation.</span>
                </div>
              </div>

              {/* Card 5: Custom Header & Footer Code Injection */}
              <div className="card-panel rounded-2xl p-6 bg-white border border-border flex flex-col gap-6">
                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-bold text-neutral-800 font-headline flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" /> Custom Header & Footer Code / Scripts Injection
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">Paste custom HTML tags, tracking scripts, CSS &lt;style&gt; snippets, Meta Pixel, GTM code, or live chat widgets (Tawk.to, Intercom, Zendesk).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Header Scripts &amp; Code (&lt;head&gt; Injection)</label>
                    <textarea 
                      rows={6}
                      value={content?.seo?.headerCode || ""}
                      onChange={(e) => setContent({ ...content, seo: { ...content?.seo, headerCode: e.target.value } })}
                      placeholder="<!-- Custom Meta / CSS / Script tags in <head> -->&#10;<script>&#10;  console.log('Custom Header Script Loaded');&#10;</script>"
                      className="w-full bg-neutral-900 text-amber-300 border border-neutral-800 rounded-xl p-4 text-xs font-mono outline-none leading-relaxed"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">Injected into document &lt;head&gt;. Ideal for Google Tag Manager &lt;head&gt;, Meta Pixel, or verification tags.</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Footer Scripts &amp; Code (&lt;/body&gt; Injection)</label>
                    <textarea 
                      rows={6}
                      value={content?.seo?.footerCode || ""}
                      onChange={(e) => setContent({ ...content, seo: { ...content?.seo, footerCode: e.target.value } })}
                      placeholder="<!-- Custom Live Chat / Analytics scripts before </body> -->&#10;<script>&#10;  console.log('Custom Footer Widget Loaded');&#10;</script>"
                      className="w-full bg-neutral-900 text-cyan-300 border border-neutral-800 rounded-xl p-4 text-xs font-mono outline-none leading-relaxed"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">Injected before &lt;/body&gt;. Ideal for live chat widgets, popups, or bottom tracking scripts.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
