import { useEffect, useState } from "react";
import GridDivider from "../components/GridDivider";
import { Reveal } from "../lib/animations";
import { X } from "lucide-react";
import { API_BASE, getUploadUrl } from "../lib/api";

export interface GalleryPhoto {
  _id?: string;
  url: string;
  caption: string;
  category?: string;
}

const DEFAULT_PHOTOS: GalleryPhoto[] = [
  {
    _id: "def-1",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    caption: "Hackathon Night & Pizza Sprint 🚀",
  },
  {
    _id: "def-2",
    url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
    caption: "Annual Mountain Retreat & Camping 🏕️",
  },
  {
    _id: "def-3",
    url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800",
    caption: "Team Dinner & Milestone Toast 🎉",
  },
  {
    _id: "def-4",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    caption: "Weekend Beach Outing & Volleyball 🏖️",
  },
  {
    _id: "def-5",
    url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800",
    caption: "New Office Launch Party ✨",
  },
  {
    _id: "def-6",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
    caption: "Architecture Workshop & Brainstorming 💡",
  },
  {
    _id: "def-7",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
    caption: "Product Demo & Townhall Meeting 🎤",
  },
  {
    _id: "def-8",
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
    caption: "Sprint Review & Friday Drinks 🍻",
  },
  {
    _id: "def-9",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
    caption: "Frontend Team Pairing & Code Review 💻",
  }
];

export default function TeamGallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${API_BASE}/gallery`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPhotos(data);
        } else {
          setPhotos(DEFAULT_PHOTOS);
        }
      } catch (err) {
        setPhotos(DEFAULT_PHOTOS);
      }
    };
    fetchGallery();
  }, []);

  const listToDisplay = photos.length > 0 ? photos : DEFAULT_PHOTOS;

  // Split photos into 2 balanced rows
  const mid = Math.ceil(listToDisplay.length / 2);
  const r1 = listToDisplay.slice(0, mid);
  const r2 = listToDisplay.slice(mid);

  // Duplicate for seamless infinite marquee loops
  const row1 = [...r1, ...r1, ...r1, ...r1];
  const row2 = [...r2, ...r2, ...r2, ...r2];

  const resolveUrl = (url: string) => {
    return getUploadUrl(url);
  };

  return (
    <section className="relative w-full py-20 bg-surface/30 border-t border-border/40 overflow-hidden select-none">
      {/* Blueprint divider line */}
      <GridDivider />

      {/* Clean Section Header (No outer card box!) */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 mb-12 text-center flex flex-col items-center gap-3">
        <Reveal>
          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-widest block">
            CULTURE & COMMUNITY
          </span>
        </Reveal>
        <Reveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-normal text-foreground leading-[1.15]">
            Life at Nitwebs
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-secondary-text text-sm sm:text-base font-sans max-w-xl leading-relaxed">
            Unfiltered captures from our retreats, weekend trips, milestone celebrations, and office moments.
          </p>
        </Reveal>
      </div>

      {/* 2 Sideways Moving Image Rows — constrained inside max-w-6xl container with fade shadows */}
      <div className="max-w-6xl mx-auto px-6 w-full flex flex-col gap-5 relative z-10 overflow-hidden">
        
        {/* Row 1: Left */}
        <div className="marquee-container w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
          <div className="animate-marquee flex items-center gap-4 sm:gap-5">
            {row1.map((photo, idx) => (
              <div
                key={`r1-${photo._id || idx}-${idx}`}
                onClick={() => setSelectedPhoto(photo)}
                className="group/card relative w-[300px] sm:w-[380px] aspect-[16/10] shrink-0 rounded-2xl overflow-hidden border border-border/80 bg-surface/40 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
              >
                <img
                  src={resolveUrl(photo.url)}
                  alt={photo.caption || "Team moment"}
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-75 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-500 ease-out"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Right */}
        <div className="marquee-container w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
          <div className="animate-marquee-reverse flex items-center gap-4 sm:gap-5">
            {row2.map((photo, idx) => (
              <div
                key={`r2-${photo._id || idx}-${idx}`}
                onClick={() => setSelectedPhoto(photo)}
                className="group/card relative w-[300px] sm:w-[380px] aspect-[16/10] shrink-0 rounded-2xl overflow-hidden border border-border/80 bg-surface/40 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10"
              >
                <img
                  src={resolveUrl(photo.url)}
                  alt={photo.caption || "Team moment"}
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-75 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-500 ease-out"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal for Photo Zoom */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[1000] bg-background/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-background/80 border border-border text-foreground hover:bg-primary hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo preview in full color */}
            <div className="relative w-full max-h-[72vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={resolveUrl(selectedPhoto.url)}
                alt={selectedPhoto.caption || "Team photo"}
                className="w-full max-h-[72vh] object-contain"
              />
            </div>

            {/* Footer details */}
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border-t border-border/80">
              <div>
                <span className="text-[10px] font-mono text-primary font-semibold uppercase tracking-widest block mb-1">
                  LIFE AT NITWEBS
                </span>
                <h3 className="text-base sm:text-lg font-headline font-normal text-foreground">
                  {selectedPhoto.caption || "Team Memory"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-5 py-2 text-xs font-semibold bg-primary text-white rounded-full hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
