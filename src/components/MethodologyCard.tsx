import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

interface MethodologyCardProps {
  isNight: boolean;
  image: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export const MethodologyCard: React.FC<MethodologyCardProps> = ({
  isNight,
  image,
  title,
  desc,
  icon,
}) => {
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

  // Reflective gloss layer alignment mapping
  const glowX = useTransform(x, [-0.5, 0.5], ["30%", "70%"]);
  const glowY = useTransform(y, [-0.5, 0.5], ["30%", "70%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Direct precise cursor mapping relative to card center
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
      className="w-full select-none cursor-pointer group flex flex-col justify-between"
    >
      <div className="space-y-5">
        {/* Photo Wrapper: Completely borderless visual canvas with tilt */}
        <motion.div
          whileHover={{ scale: 1.025 }}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full rounded-3xl overflow-hidden aspect-[16/10] bg-neutral-900 shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-shadow duration-500 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.2)]"
        >
          {/* Parallax Image Content */}
          <motion.img
            src={image}
            alt={title}
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

          {/* Ambient Glossy Light Flare reflecting cursor location */}
          <motion.div
            style={{
              background: `radial-gradient(circle 180px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255, 255, 255, 0.12), transparent)`,
              "--glow-x": glowX,
              "--glow-y": glowY,
            } as React.CSSProperties}
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />

          {/* Floating badge inside picture */}
          <div
            className={`absolute top-4 left-4 p-2.5 rounded-xl transition-all duration-1000 ${
              isNight
                ? "bg-[#0A0A0A]/70 text-brand-gold border border-neutral-850"
                : "bg-white/80 text-brand-emerald border border-stone-250"
            } backdrop-blur-md`}
            style={{ transform: "translateZ(30px)" }}
          >
            {icon}
          </div>
        </motion.div>

        {/* Content Details */}
        <div className="space-y-2 px-1">
          <h3
            className={`font-serif text-2xl font-light transition-colors duration-1000 ${
              isNight ? "text-zinc-100 group-hover:text-brand-gold" : "text-neutral-900 group-hover:text-brand-emerald"
            }`}
          >
            {title}
          </h3>
          <p
            className={`font-sans text-xs sm:text-sm leading-relaxed transition-colors duration-1000 ${
              isNight ? "text-zinc-400 md:max-w-xs" : "text-zinc-650 font-medium md:max-w-xs"
            }`}
          >
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
};
