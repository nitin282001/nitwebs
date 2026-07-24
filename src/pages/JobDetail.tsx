import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import { getApiUrl, getSubmitUrl } from "../lib/api";
import Footer from "../components/Footer";
import GridLines from "../components/GridLines";
import GridDivider from "../components/GridDivider";
import NotFound from "./NotFound";
import { Reveal } from "../lib/animations";
import { Briefcase, MapPin, Calendar, ArrowLeft, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import SpecularButton from "../components/ui/SpecularButton";

export default function JobDetail() {
  const { slug } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setNotFound(false);
      setIsClosed(false);
      try {
        const res = await fetch(getApiUrl(`/jobs/${slug}`));
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to load job details");
        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((j: any) => j.slug === slug);
          if (found) {
            setJob(found);
            document.title = `${found.title} — Careers — Nitwebs`;
            if (found.status === "closed") setIsClosed(true);
          } else {
            setNotFound(true);
          }
        } else {
          setJob(data);
          document.title = `${data.title} — Careers — Nitwebs`;
          if (data.status === "closed") setIsClosed(true);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File size exceeds 5MB limit. Please upload a smaller resume.");
        setResume(null);
        e.target.value = "";
        return;
      }
      
      const allowedExts = [".pdf", ".doc", ".docx"];
      const filename = file.name.toLowerCase();
      const isValidExt = allowedExts.some(ext => filename.endsWith(ext));
      
      if (!isValidExt) {
        setErrorMsg("Invalid file type. Only PDF, DOC, and DOCX files are allowed.");
        setResume(null);
        e.target.value = "";
        return;
      }
      
      setResume(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !resume || !job) {
      setErrorMsg("Please fill in all required fields and upload your resume.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("coverNote", coverNote);
    formData.append("jobId", job._id);
    formData.append("resume", resume);

    try {
      const res = await fetch(getSubmitUrl("/applications"), {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      
      if (res.status === 410) {
        setIsClosed(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return <NotFound />;
  }

  return (
    <div className="relative isolate w-full min-h-screen flex flex-col bg-background text-foreground">
      <GridLines />
      <Header scrollProgress={0} />

      <main className="flex-1">
        {/* Job Detail Header Banner */}
        <section className="relative w-full pt-32 pb-16 px-6 overflow-hidden">
          <GridDivider />
          <div className="max-w-4xl mx-auto z-10 relative mt-4">
            <Link
              to="/careers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-text hover:text-primary transition-colors mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Careers
            </Link>

            <Reveal>
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary-tint/50 border border-primary/20 text-primary uppercase mb-4 inline-block">
                {job.department || "Engineering"}
              </span>
            </Reveal>

            <Reveal>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal font-headline text-foreground leading-tight mb-6">
                {job.title}
              </h1>
            </Reveal>

            <div className="flex flex-wrap gap-5 text-sm text-secondary-text font-sans mt-2 border-t border-b border-border/60 py-4">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-secondary-text" />
                {job.employmentType.replace("-", " ")}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-secondary-text" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-secondary-text" />
                Posted: {new Date(job.postedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </section>

        {/* Content & Requirements */}
        <section className="relative w-full pb-20 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-12">
            
            {/* Description */}
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold font-headline text-foreground">Role Description</h2>
              <div 
                className="text-secondary-text text-sm sm:text-base leading-relaxed font-sans flex flex-col gap-4"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Requirements Bullet list */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="flex flex-col gap-6 border-t border-border/60 pt-8">
                <h2 className="text-xl font-bold font-headline text-foreground">Role Requirements</h2>
                <ul className="list-disc list-inside text-secondary-text text-sm sm:text-base leading-relaxed font-sans flex flex-col gap-3 ml-2">
                  {job.requirements.map((reqStr: string, index: number) => (
                    <li key={index} className="pl-1">
                      {reqStr}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Section */}
            <div id="apply-section" className="border-t border-border/80 pt-12 mt-4 flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold font-headline text-foreground">Apply for this position</h2>
                <p className="text-xs text-secondary-text mt-1">Please fill out the form below and attach your resume.</p>
              </div>

              {isClosed ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 rounded-xl p-5 flex items-center gap-3 text-sm font-semibold">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  This role is no longer accepting applications.
                </div>
              ) : submitted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6 flex flex-col items-center gap-3 text-center max-w-xl mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold font-sans">Thanks — we'll be in touch.</h3>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Your application was submitted successfully. Our team will review your profile and update you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-muted/50 border border-border/80 rounded-2xl p-6 md:p-8 flex flex-col gap-6 max-w-2xl animate-in fade-in duration-200">
                  {errorMsg && (
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-xl p-4 text-xs font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-background border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john@example.com"
                        className="w-full bg-background border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 000-0000"
                        className="w-full bg-background border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block mb-2">Resume Attachment (.pdf, .doc, .docx) *</label>
                      <div className="relative w-full flex items-center bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground overflow-hidden cursor-pointer hover:bg-muted transition-colors">
                        <Upload className="w-4 h-4 text-secondary-text mr-2 shrink-0" />
                        <span className="text-xs text-secondary-text truncate font-sans">
                          {resume ? resume.name : "Choose File..."}
                        </span>
                        <input
                          type="file"
                          required
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block mb-2">Cover Letter / Note</label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Briefly tell us why you are a great fit for this embedded role..."
                      className="w-full bg-background border border-border focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="flex justify-end border-t border-border pt-4">
                    <SpecularButton
                      type="submit"
                      disabled={submitting}
                      size="md"
                      tint="hsl(var(--foreground))"
                      tintOpacity={1}
                      textColor="hsl(var(--background))"
                      lineColor="hsl(var(--primary))"
                      baseColor="hsl(var(--border))"
                      className="px-8 py-3 text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </SpecularButton>
                  </div>
                </form>
              )}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
