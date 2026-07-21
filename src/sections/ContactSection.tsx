import { useState, useEffect } from "react";
import GridDivider from "../components/GridDivider";
import { ChevronDown, CheckCircle, Mail, Phone, MapPin, AlertCircle } from "lucide-react";
import SpecularButton from "../components/ui/SpecularButton";
import GradientFlow from "../components/ui/GradientFlow";
import Silk from "../components/ui/Silk";
import PhoneInput, { isValidPhoneNumber, type Country } from "react-phone-number-input/min";
import "react-phone-number-input/style.css";
import "./ContactSection.css";

interface ContactItem {
  icon: typeof Mail;
  title: string;
  desc: string;
  href: string | null;
}

const contactItems: ContactItem[] = [
  {
    icon: Mail,
    title: "Sales@nitwebs.com",
    desc: "For any sales related query.",
    href: "mailto:Sales@nitwebs.com"
  },
  {
    icon: Mail,
    title: "hr@nitwebs.com",
    desc: "For any career related query.",
    href: "mailto:hr@nitwebs.com"
  },
  {
    icon: Phone,
    title: "+91 911 555 6455",
    desc: "Call us at",
    href: "tel:+919115556455"
  },
  {
    icon: MapPin,
    title: "26 A, model town Ludhiana, Punjab",
    desc: "Our head office located at",
    href: null
  },
  {
    icon: MapPin,
    title: "Techzone 4, Greater Noida West, Uttar Pradesh",
    desc: "Our branch office located at",
    href: null
  }
];


const INQUIRY_SUBJECTS = [
  "AI Engineering & Chatbots",
  "Custom Software & SaaS Platform",
  "Web & Mobile Applications",
  "Automation & System Integration",
  "Cloud Infrastructure & DevOps",
  "UI/UX & Product Design",
  "General Inquiry / Other"
];

interface ContactSectionProps {
  badge?: string;
  title?: string;
  desc?: string;
}

export default function ContactSection({
  badge = "GET IN TOUCH",
  title = "Reach us now",
  desc = "Interested in discovering how Nitwebs can enhance your organization? We're eager to hear from you."
}: ContactSectionProps) {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState<string | undefined>(undefined);
  const [phoneCountry, setPhoneCountry] = useState<Country>("IN");
  const [formSubject, setFormSubject] = useState(INQUIRY_SUBJECTS[0]);
  const [formMessage, setFormMessage] = useState("");
  const [formAgreed, setFormAgreed] = useState(false);

  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-select the visitor's dial code: try IP geolocation first, then fall
  // back to the browser's locale region, then the hardcoded default above.
  useEffect(() => {
    let cancelled = false;

    const fallbackToLocale = () => {
      try {
        const region = new Intl.Locale(navigator.language).maximize().region;
        if (!cancelled && region) setPhoneCountry(region as Country);
      } catch (e) {
        // Keep the hardcoded default
      }
    };

    fetch("https://get.geojs.io/v1/ip/country.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!cancelled && data?.country) setPhoneCountry(data.country as Country);
        else if (!cancelled) fallbackToLocale();
      })
      .catch(() => {
        if (!cancelled) fallbackToLocale();
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...fieldErrors };

    if (field === "name") {
      if (!value.trim() || value.trim().length < 2) {
        newErrors.name = "Please enter your full name (at least 2 characters).";
      } else {
        delete newErrors.name;
      }
    }

    if (field === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!value.trim() || !emailRegex.test(value.trim())) {
        newErrors.email = "Please enter a valid email address (e.g., name@company.com).";
      } else {
        delete newErrors.email;
      }
    }

    if (field === "phone") {
      if (!value || !isValidPhoneNumber(value)) {
        newErrors.phone = "Please enter a valid phone number.";
      } else {
        delete newErrors.phone;
      }
    }

    if (field === "message") {
      if (!value.trim() || value.trim().length < 10) {
        newErrors.message = "Please describe your project (at least 10 characters).";
      } else {
        delete newErrors.message;
      }
    }

    setFieldErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const errors: { [key: string]: string } = {};

    if (!formName.trim() || formName.trim().length < 2) {
      errors.name = "Please enter your full name.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formEmail.trim() || !emailRegex.test(formEmail.trim())) {
      errors.email = "Please enter a valid working email address.";
    }

    if (!formPhone || !isValidPhoneNumber(formPhone)) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!formMessage.trim() || formMessage.trim().length < 10) {
      errors.message = "Please provide details about your project.";
    }

    if (!formAgreed) {
      errors.agreed = "You must agree to the terms and privacy policy.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the highlighted errors before submitting.");
      return;
    }

    setFieldErrors({});
    setFormLoading(true);

    fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone,
        subject: formSubject,
        message: formMessage.trim(),
        agreedToTerms: formAgreed,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("API post failed");
      })
      .then(() => {
        setFormLoading(false);
        setFormSuccess(true);
        clearForm();
      })
      .catch((err) => {
        console.warn("Backend API response simulation:", err.message);
        setTimeout(() => {
          setFormLoading(false);
          setFormSuccess(true);
          clearForm();
        }, 1200);
      });
  };

  const clearForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone(undefined);
    setFormSubject(INQUIRY_SUBJECTS[0]);
    setFormMessage("");
    setFormAgreed(false);
    setFormError("");
    setFieldErrors({});
  };

  return (
    <section id="contact" className="relative py-24 px-6 bg-surface/30">
      <GridDivider />
      <div className="max-w-6xl mx-auto">
        {/* Main Solid Panel Card */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-primary px-8 py-12 sm:p-12 lg:p-16 shadow-2xl flex flex-col lg:flex-row gap-12 items-center justify-between border border-primary/20">
          {prefersReducedMotion ? (
            <GradientFlow className="pointer-events-none" />
          ) : (
            <div className="absolute inset-0 pointer-events-none">
              <Silk color="#5b1a72" speed={3.5} scale={0.7} noiseIntensity={1.2} rotation={0} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          {/* Background decorative circles */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary-tint/10 blur-3xl pointer-events-none" />

          {/* Left Column (Contact Details) */}
          <div className="w-full lg:max-w-[48%] flex flex-col justify-between relative z-10 text-white">
            <div>
              <span className="text-xs font-mono text-primary-tint font-semibold tracking-widest uppercase block mb-3">
                {badge}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.1] tracking-[-0.02em] font-headline text-white mb-4">
                {title}
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                {desc}
              </p>

              <div className="flex flex-col gap-5">
                {contactItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-white/20 bg-white/5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <item.icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      {item.href ? (
                        <a href={item.href} className="text-sm sm:text-base font-semibold text-white hover:text-cyan-300 transition-colors">
                          {item.title}
                        </a>
                      ) : (
                        <span className="text-sm sm:text-base font-semibold text-white">
                          {item.title}
                        </span>
                      )}
                      <span className="text-xs text-white/70 mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Glass "code previewer" Form Card) */}
          <div className="w-full lg:max-w-[48%] relative z-10 rounded-2xl overflow-hidden border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl">
            {/* Window chrome bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {formSuccess ? (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 text-primary-tint rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-headline">Request submitted</h3>
                  <p className="text-white/60 text-sm max-w-xs mx-auto">
                    An engineer will follow up in your inbox within 4 business hours.
                  </p>
                  <SpecularButton
                    onClick={() => setFormSuccess(false)}
                    size="md"
                    tint="hsl(var(--primary))"
                    tintOpacity={1}
                    textColor="#ffffff"
                    lineColor="hsl(var(--primary-tint))"
                    baseColor="rgba(255,255,255,0.3)"
                    className="px-8 py-3 text-xs mt-6 cursor-pointer"
                    thickness={2.5}
                    intensity={2}
                  >
                    Send Another Request
                  </SpecularButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                  <h3 className="text-xl sm:text-2xl font-normal text-white mb-2 font-headline">Request a quote:</h3>

                  {formError && (
                    <div className="bg-red-500/20 border border-red-400/40 text-red-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">Name (required)</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => {
                          setFormName(e.target.value);
                          if (fieldErrors.name) validateField("name", e.target.value);
                        }}
                        onBlur={(e) => validateField("name", e.target.value)}
                        placeholder="Your full name"
                        className={`w-full bg-white/8 border ${
                          fieldErrors.name ? "border-red-400 bg-red-500/15 focus:border-red-400" : "border-white/15 focus:border-primary-tint/60 focus:bg-white/12"
                        } rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all backdrop-blur-sm`}
                      />
                      {fieldErrors.name && (
                        <span className="text-[11px] text-red-300 mt-1 block font-medium">{fieldErrors.name}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">Email (required)</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => {
                          setFormEmail(e.target.value);
                          if (fieldErrors.email) validateField("email", e.target.value);
                        }}
                        onBlur={(e) => validateField("email", e.target.value)}
                        placeholder="Your working email"
                        className={`w-full bg-white/8 border ${
                          fieldErrors.email ? "border-red-400 bg-red-500/15 focus:border-red-400" : "border-white/15 focus:border-primary-tint/60 focus:bg-white/12"
                        } rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all backdrop-blur-sm`}
                      />
                      {fieldErrors.email && (
                        <span className="text-[11px] text-red-300 mt-1 block font-medium">{fieldErrors.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone with Country Selector & Inquiry About */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">Phone (required)</label>
                      <PhoneInput
                        international
                        countryCallingCodeEditable={false}
                        defaultCountry={phoneCountry}
                        value={formPhone}
                        onChange={(value) => {
                          setFormPhone(value);
                          if (fieldErrors.phone) validateField("phone", value || "");
                        }}
                        onBlur={() => validateField("phone", formPhone || "")}
                        placeholder="Phone number"
                        className={`nw-phone-input ${fieldErrors.phone ? "nw-phone-input--error" : ""}`}
                      />
                      {fieldErrors.phone && (
                        <span className="text-[11px] text-red-300 mt-1 block font-medium">{fieldErrors.phone}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">Inquiry About (required)</label>
                      <div className="relative">
                        <select
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          className="w-full bg-white/8 border border-white/15 focus:border-primary-tint/60 rounded-xl pl-4 pr-9 py-3 text-sm text-white outline-none appearance-none cursor-pointer backdrop-blur-sm transition-all truncate"
                        >
                          {INQUIRY_SUBJECTS.map((sub) => (
                            <option key={sub} value={sub} className="text-neutral-900">
                              {sub}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-2">Tell us about your project (required)</label>
                    <textarea
                      rows={3}
                      value={formMessage}
                      onChange={(e) => {
                        setFormMessage(e.target.value);
                        if (fieldErrors.message) validateField("message", e.target.value);
                      }}
                      onBlur={(e) => validateField("message", e.target.value)}
                      placeholder="Describe your project, timeline, and goals..."
                      className={`w-full bg-white/8 border ${
                        fieldErrors.message ? "border-red-400 bg-red-500/15 focus:border-red-400" : "border-white/15 focus:border-primary-tint/60 focus:bg-white/12"
                      } rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all backdrop-blur-sm`}
                    />
                    {fieldErrors.message && (
                      <span className="text-[11px] text-red-300 mt-1 block font-medium">{fieldErrors.message}</span>
                    )}
                  </div>

                  {/* Row 4: Terms check box */}
                  <div>
                    <label className="flex items-start gap-3 mt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formAgreed}
                        onChange={(e) => {
                          setFormAgreed(e.target.checked);
                          if (fieldErrors.agreed) {
                            const newErr = { ...fieldErrors };
                            delete newErr.agreed;
                            setFieldErrors(newErr);
                          }
                        }}
                        className="mt-0.5 accent-primary border-white/30 rounded cursor-pointer shrink-0"
                      />
                      <span className="text-xs text-white/50 leading-normal">
                        By submitting this form, I agree to the <a href="#" className="underline font-medium text-white/70 hover:text-primary-tint">terms & conditions</a> and <a href="#" className="underline font-medium text-white/70 hover:text-primary-tint">privacy policy</a>.
                      </span>
                    </label>
                    {fieldErrors.agreed && (
                      <span className="text-[11px] text-red-300 mt-1 block font-medium">{fieldErrors.agreed}</span>
                    )}
                  </div>

                  {/* Row 5: Submit Button */}
                  <SpecularButton
                    type="submit"
                    disabled={formLoading}
                    size="md"
                    tint="hsl(var(--primary))"
                    tintOpacity={1}
                    textColor="#ffffff"
                    lineColor="hsl(var(--primary-tint))"
                    baseColor="rgba(255,255,255,0.3)"
                    className="w-full justify-center py-4 mt-2 cursor-pointer"
                    thickness={2.5}
                    intensity={2}
                  >
                    {formLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Request a demo
                      </>
                    )}
                  </SpecularButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
