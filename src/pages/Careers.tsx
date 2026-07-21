import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
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
        const res = await fetch("http://localhost:5000/api/jobs");
        if (!res.ok) throw new Error("Failed to load jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="relative isolate w-full min-h-screen flex flex-col bg-background text-foreground">
      {/* Blueprint grid lines */}
      <GridLines />

      {/* Header */}
      <Header scrollProgress={0} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center text-center">
          <GridDivider />
          <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center mt-8">
            <Reveal>
              <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-primary-tint/50 border border-primary/20 text-primary uppercase mb-6 inline-block">
                Careers & Opportunities
              </span>
            </Reveal>
            <Reveal>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal font-headline text-foreground leading-[1.1] mb-6 max-w-3xl">
                Build the Future of Digital Infrastructure
              </h1>
            </Reveal>
            <Reveal>
              <p className="text-secondary-text text-base sm:text-lg md:text-xl font-sans leading-relaxed max-w-2xl">
                Join our team of elite developers and system architects embedded inside top-tier engineering organizations.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Jobs List Section */}
        <section className="relative w-full py-20 px-6 bg-surface/30">
          <GridDivider />
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-3 mb-16">
              <Reveal>
                <span className="text-[10px] font-mono font-semibold text-primary uppercase tracking-widest">
                  Open Positions
                </span>
              </Reveal>
              <Reveal>
                <h2 className="text-3xl sm:text-4xl font-headline font-normal text-foreground">
                  Current Openings
                </h2>
              </Reveal>
              <Reveal>
                <p className="text-secondary-text text-sm font-sans max-w-xl">
                  Explore our open roles and apply to build state-of-the-art architectures.
                </p>
              </Reveal>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <Reveal>
                <div className="py-24 text-center border-2 border-dashed border-border rounded-2xl bg-background max-w-2xl mx-auto flex flex-col items-center gap-4">
                  <Briefcase className="w-8 h-8 text-secondary-text animate-bounce" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-sans">No open roles right now</h3>
                    <p className="text-xs text-secondary-text mt-1">We are constantly scaling our embedded developer network. Check back soon!</p>
                  </div>
                </div>
              </Reveal>
            ) : (
              <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <Link
                    key={job._id}
                    to={`/careers/${job.slug}`}
                    className="card-panel flex flex-col p-6 rounded-2xl border border-border/80 hover:shadow-lg transition-all group text-left cursor-pointer"
                  >
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="text-lg font-bold font-headline text-foreground group-hover:text-primary transition-colors leading-snug">
                          {job.title}
                        </h3>
                        <span className="bg-primary/5 border border-primary/10 text-primary font-sans text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full shrink-0">
                          {job.employmentType.replace("-", " ")}
                        </span>
                      </div>
                      
                      <p className="text-secondary-text text-sm leading-relaxed flex-1">
                        {job.summary}
                      </p>

                      <div className="border-t border-border pt-4 mt-2 flex flex-wrap gap-4 items-center justify-between text-xs text-secondary-text font-sans">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {job.department || "Engineering"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-secondary-text">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.postedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
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
