import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { getApiUrl } from "../lib/api";
import Footer from "../components/Footer";
import GridLines from "../components/GridLines";
import GridDivider from "../components/GridDivider";
import { Reveal, StaggerGrid } from "../lib/animations";
import { Briefcase, MapPin, Calendar } from "lucide-react";

export default function Careers() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(getApiUrl("/jobs"));
        if (!res.ok) throw new Error("Failed to load jobs");
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="relative isolate w-full min-h-screen flex flex-col bg-background text-foreground selection:bg-primary-tint selection:text-foreground">
      {/* Blueprint grid lines */}
      <GridLines />

      {/* Header */}
      <Header scrollProgress={0} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center text-center">
          <GridDivider />
          <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center mt-4">
            <Reveal>
              <span className="text-xs font-mono text-primary font-semibold tracking-widest uppercase block mb-3">
                CAREERS & OPPORTUNITIES
              </span>
            </Reveal>
            <Reveal>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal font-headline text-foreground leading-[1.15] mb-4 max-w-3xl">
                Build the Future of Digital Infrastructure
              </h1>
            </Reveal>
            <Reveal>
              <p className="text-secondary-text text-base sm:text-lg font-sans leading-relaxed max-w-2xl">
                Join our team of senior software engineers, system architects, and AI developers embedded inside top-tier engineering organizations.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Jobs List Section */}
        <section className="relative w-full py-20 px-6 bg-surface/30">
          <GridDivider />
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-2 mb-12">
              <Reveal>
                <span className="text-xs font-mono font-semibold text-primary uppercase tracking-widest">
                  OPEN POSITIONS
                </span>
              </Reveal>
              <Reveal>
                <h2 className="text-3xl sm:text-4xl font-headline font-normal text-foreground leading-[1.15]">
                  Current Openings
                </h2>
              </Reveal>
              <Reveal>
                <p className="text-secondary-text text-sm sm:text-base font-sans max-w-xl">
                  Explore our open roles and apply to build state-of-the-art software architectures.
                </p>
              </Reveal>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <Reveal>
                <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-surface/40 backdrop-blur-sm max-w-2xl mx-auto flex flex-col items-center gap-4 p-8">
                  <Briefcase className="w-8 h-8 text-primary animate-pulse" />
                  <div>
                    <h3 className="text-base font-normal font-headline text-foreground">No open roles right now</h3>
                    <p className="text-xs text-secondary-text mt-1">We are constantly scaling our embedded engineering network. Check back soon!</p>
                  </div>
                </div>
              </Reveal>
            ) : (
              <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {jobs.map((job) => {
                  const empType = job.employmentType || job.employment_type || "full-time";
                  const postedDateVal = job.postedDate || job.posted_date || Date.now();
                  const jobId = job._id || job.id;
                  return (
                    <Link
                      key={jobId}
                      to={`/careers/${job.slug}`}
                      className="group relative rounded-2xl border border-border/80 bg-surface/40 p-6 sm:p-7 transition-all duration-300 hover:border-primary/50 hover:bg-surface/80 hover:shadow-xl backdrop-blur-sm flex flex-col justify-between"
                    >
                      <div className="flex flex-col gap-4 flex-1">
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="text-xl font-normal font-headline text-foreground group-hover:text-primary transition-colors leading-snug">
                            {job.title}
                          </h3>
                          <span className="text-[11px] font-mono font-semibold tracking-wider text-primary dark:text-purple-300 uppercase px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                            {empType.replace("-", " ")}
                          </span>
                        </div>
                        
                        <p className="text-secondary-text text-sm leading-relaxed flex-1 font-sans">
                          {job.summary}
                        </p>

                        <div className="border-t border-border/60 pt-4 mt-2 flex flex-wrap gap-4 items-center justify-between text-xs text-secondary-text font-sans">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-primary" />
                              {job.department || "Engineering"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {job.location || "Remote"}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-secondary-text">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(postedDateVal).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </StaggerGrid>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
