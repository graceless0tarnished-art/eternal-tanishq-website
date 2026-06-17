import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

interface PortfolioShowcaseProps {
  isNight: boolean;
  webDesignAuraMockup: string;
  webDesignKronosMockup: string;
}

interface Project {
  title: string;
  url: string;
  year: string;
  desc: string;
  tags: string[];
  image: string;
}

const ShowcaseCard: React.FC<{ project: Project; isNight: boolean }> = ({ project, isNight }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values to track normalized mouse state (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Butter-smooth spring physics config with beautiful responsive inertia
  const springConfig = { damping: 25, stiffness: 180 };
  
  // Card 3D tilt translations
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig);

  // Parallax displacement config for inner image to create rich depth
  const translateX = useSpring(useTransform(x, [-0.5, 0.5], [-16, 16]), springConfig);
  const translateY = useSpring(useTransform(y, [-0.5, 0.5], [-16, 16]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalize coordinates: -0.5 on the extreme left/top to 0.5 on extreme right/bottom
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1500 }}
      className="w-full select-none cursor-pointer group flex flex-col"
    >
      {/* Photo Wrapper: Completely borderless visual canvas */}
      <motion.div
        whileHover={{ scale: 1.025 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative w-full rounded-3xl overflow-hidden aspect-[16/10] bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-shadow duration-500 group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.35)]`}
      >
        {/* Parallax Image Content */}
        <motion.img
          src={project.image}
          alt={project.title}
          referrerPolicy="no-referrer"
          style={{
            x: translateX,
            y: translateY,
            scale: 1.15, // slightly scale to avoid edge clipping during translations
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Ambient Overlay to deepen layout legibility on hover */}
        <div className="absolute inset-0 bg-neutral-950/10 group-hover:bg-neutral-950/20 transition-colors duration-500 pointer-events-none" />

        {/* Floating Minimal Digital URL Accent inside the graphic box */}
        <div 
          className="absolute bottom-5 right-5 z-10 font-mono text-[8px] tracking-[0.25em] uppercase px-3 py-1 bg-black/40 text-stone-200 rounded-full backdrop-blur-md opacity-80"
          style={{ transform: "translateZ(30px)" }}
        >
          {project.url}
        </div>
      </motion.div>

      {/* Meta Details placed cleanly below the borderless picture frame */}
      <div className="mt-6 space-y-2.5 px-1">
        <div className="flex items-baseline justify-between">
          <h3 className={`font-serif text-2xl font-light tracking-tight transition-colors duration-1000 ${isNight ? "text-white group-hover:text-brand-gold" : "text-neutral-900 group-hover:text-brand-emerald"}`}>
            {project.title}
          </h3>
          <span className={`font-mono text-[10px] tracking-widest uppercase font-semibold ${isNight ? "text-zinc-550" : "text-neutral-400"}`}>
            {project.year}
          </span>
        </div>
        
        <p className={`font-sans text-xs leading-relaxed transition-colors duration-1000 ${isNight ? "text-zinc-400" : "text-zinc-650 font-medium"}`}>
          {project.desc}
        </p>

        <div className="pt-1 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider transition-colors duration-1000 ${
                isNight ? "bg-neutral-900/60 text-zinc-400" : "bg-neutral-100 text-zinc-600 font-semibold"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export function PortfolioShowcase({
  isNight,
  webDesignAuraMockup,
  webDesignKronosMockup,
}: PortfolioShowcaseProps) {
  const projects: Project[] = [
    {
      title: "AURA Creative Studio",
      url: "AURA.STUDIO",
      year: "2025",
      desc: "A minimal, narrative-inspired portfolio housing multi-column editorial features, smooth content whips, and micro-animations for high-fashion digital storytelling.",
      tags: ["React / Vite", "Motion Graphic", "Bespoke CSS"],
      image: webDesignAuraMockup,
    },
    {
      title: "KRONOS Vault",
      url: "KRONOS.FLOW",
      year: "2026",
      desc: "A dark typographic commerce experience built for rapid brand discovery, featuring high-speed product catalog models and modular grid aesthetics.",
      tags: ["Full-Stack Node", "Stripe API", "Responsive UI"],
      image: webDesignKronosMockup,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
      {projects.map((project, idx) => (
        <ShowcaseCard key={idx} project={project} isNight={isNight} />
      ))}
    </div>
  );
}

