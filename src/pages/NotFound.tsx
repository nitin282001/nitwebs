import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GridLines from "../components/GridLines";

export default function NotFound() {
  return (
    <div className="relative isolate w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground select-none">
      {/* Grid line background */}
      <GridLines />

      <div className="max-w-md mx-auto text-center px-6 relative z-10 py-12 border border-border/80 bg-surface/30 backdrop-blur-md rounded-3xl shadow-xl">
        <span className="text-primary font-mono text-sm uppercase tracking-widest font-semibold">
          Error 404
        </span>
        <h1 className="text-4xl sm:text-5xl font-headline font-normal text-foreground mt-4 mb-3">
          Page Not Found
        </h1>
        <p className="text-secondary-text text-sm sm:text-base leading-relaxed mb-8">
          The page you are looking for doesn't exist, has been moved, or is still in draft state.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 text-sm font-semibold rounded-full hover:opacity-90 shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
