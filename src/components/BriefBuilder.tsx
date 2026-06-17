import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Compass } from "lucide-react";

interface BriefBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  isNight: boolean;
  ambientProgress: number;
  setAmbientProgress: (val: number) => void;
  onSelectBlueprint: (params: { style: string; tech: string; focus: string }) => void;
}

export function BriefBuilder({
  isOpen,
  onClose,
  isNight,
  ambientProgress,
  setAmbientProgress,
  onSelectBlueprint,
}: BriefBuilderProps) {
  const [briefStyle, setBriefStyle] = useState("minimal");
  const [briefTech, setBriefTech] = useState("visual");
  const [briefFocus, setBriefFocus] = useState("motion");

  if (!isOpen) return null;

  return (
    <motion.div
      id="journey-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto p-6 sm:p-12 transition-colors duration-1000 ${
        isNight ? "bg-[#0A0A0A] text-white" : "bg-stone-50 text-black"
      }`}
    >
      {/* Overlay Header */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto pb-6 border-b border-neutral-200/10">
        <span
          className={`font-serif text-lg tracking-widest uppercase pb-1 border-b ${
            isNight ? "text-white border-white" : "text-black border-black"
          }`}
        >
          Virtual Architect Portal
        </span>
        <button
          onClick={onClose}
          className={`text-[10px] tracking-widest uppercase font-mono px-3 py-1.5 rounded-full border ${
            isNight
              ? "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 bg-neutral-900/40"
              : "border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-500 bg-white"
          }`}
        >
          Close Portal ×
        </button>
      </div>

      {/* Immersive Workshop Configurator Body */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 py-12 flex-grow items-center">
        {/* Configuration panel */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-2">
            <span
              className={`font-mono text-[9.5px] tracking-widest uppercase ${
                isNight ? "text-brand-gold font-semibold" : "text-brand-emerald font-semibold"
              }`}
            >
              Interactive Design Workshop
            </span>
            <h2
              className={`font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight ${
                isNight ? "text-white" : "text-black"
              }`}
            >
              Draft your bespoke digital layout.
            </h2>
          </div>

          {/* Step 1: Vibe / Style */}
          <div className="space-y-3">
            <label
              className={`block font-mono text-[9px] tracking-widest uppercase ${
                isNight ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              1. Select Architectural Aesthetic
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "minimal", label: "Minimalist Editorial", desc: "Classic serif, ample space" },
                { id: "brutalist", label: "Brutalist Cyber", desc: "High-contrast mono lines" },
                { id: "fluid", label: "Fluid Motion", desc: "Bespoke scroll physics" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setBriefStyle(item.id);
                    // Ambient transitions for immersive interactive feel
                    if (item.id === "brutalist") setAmbientProgress(1.0);
                    if (item.id === "minimal") setAmbientProgress(0.0);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                    briefStyle === item.id
                      ? isNight
                        ? "border-brand-gold bg-brand-gold-dark/10 text-white animate-pulse"
                        : "border-brand-emerald bg-brand-emerald/10 text-neutral-900 font-semibold"
                      : isNight
                      ? "border-neutral-850 bg-neutral-900/15 text-zinc-400 hover:bg-neutral-900/40"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-sans text-xs font-semibold">{item.label}</p>
                  <p className="font-sans text-[10px] opacity-70 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Architecture Type */}
          <div className="space-y-3">
            <label
              className={`block font-mono text-[9px] tracking-widest uppercase ${
                isNight ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              2. Core Engine Layout
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "visual", label: "Interactive Selected Works Grid", desc: "Crafted specifically for boutique & design brands" },
                { id: "commercial", label: "Luxury Cart & Checkout Flow", desc: "Custom transaction speeds styled with security" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBriefTech(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                    briefTech === item.id
                      ? isNight
                        ? "border-brand-gold bg-brand-gold-dark/10 text-white animate-pulse"
                        : "border-brand-emerald bg-brand-emerald/10 text-neutral-900 font-semibold"
                      : isNight
                      ? "border-neutral-850 bg-neutral-900/15 text-zinc-400 hover:bg-neutral-900/40"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-sans text-xs font-semibold">{item.label}</p>
                  <p className="font-sans text-[10px] opacity-70 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Priority */}
          <div className="space-y-3">
            <label
              className={`block font-mono text-[9px] tracking-widest uppercase ${
                isNight ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              3. Experience Focal Point
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "motion", label: "Parallax Kinetics", desc: "Sensory transition triggers" },
                { id: "speed", label: "Breathtaking Speed", desc: "Clean static load speed" },
                { id: "tactile", label: "Dynamic Tactility", desc: "Physical response vibes" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBriefFocus(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                    briefFocus === item.id
                      ? isNight
                        ? "border-brand-gold bg-brand-gold-dark/10 text-white animate-pulse"
                        : "border-brand-emerald bg-brand-emerald/10 text-neutral-900 font-semibold"
                      : isNight
                      ? "border-neutral-850 bg-neutral-900/15 text-zinc-400 hover:bg-neutral-900/40"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <p className="font-sans text-xs font-semibold">{item.label}</p>
                  <p className="font-sans text-[10px] opacity-70 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instant Blueprint Recommendation Display */}
        <div className="lg:col-span-5 text-left h-full flex flex-col justify-center">
          <div
            className={`p-6 sm:p-8 rounded-3xl border transition-all duration-1000 space-y-6 ${
              isNight
                ? "border-neutral-800 bg-[#0E0E0E] text-white"
                : "border-neutral-200 bg-white text-black"
            } shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-widest uppercase opacity-60">
                System Recommendation
              </span>
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isNight ? "bg-brand-gold" : "bg-brand-emerald"
                }`}
              />
            </div>

            <div className="border-t border-b border-neutral-200/10 py-4 space-y-3">
              <p className={`font-serif text-lg ${isNight ? "text-zinc-300" : "text-zinc-800"}`}>
                Recommended System Pattern
              </p>
              <p className="font-serif text-3xl font-normal leading-tight">
                {briefStyle === "minimal" && "Graceful Serif Portal"}
                {briefStyle === "brutalist" && "Immutable Mono Codex"}
                {briefStyle === "fluid" && "Kinetic Spatial Canvas"}
              </p>
              <p className={`font-sans text-xs leading-relaxed ${isNight ? "text-zinc-400" : "text-zinc-600"}`}>
                {briefStyle === "minimal" &&
                  "A clean typography pattern curated on fluid cream tones. Handcrafted for pristine visibility and prestigious reputation builders."}
                {briefStyle === "brutalist" &&
                  "High-contrast layout framework using wireframe lines, bold structural elements, and a monospace layout context."}
                {briefStyle === "fluid" &&
                  "A layout flowing with spatial inertia, liquid viewport offsets, and active sensory adjustments. Built for high-end immersion."}
              </p>
            </div>

            <div className="space-y-2 font-mono text-[10px] text-zinc-500">
              <div className="flex justify-between font-medium">
                <span>Bespoke Engineering Time</span>
                <span className={isNight ? "text-white" : "text-black"}>14 - 18 Days</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Interactive CSS Physics</span>
                <span className={isNight ? "text-white" : "text-black"}>Included</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Experience Priority Focus</span>
                <span className={isNight ? "text-white" : "text-black"}>
                  {briefFocus === "motion"
                    ? "Circadian Parallax"
                    : briefFocus === "speed"
                    ? "Zero Latency Loading"
                    : "Tactile Interaction"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectBlueprint({
                  style: briefStyle,
                  tech: briefTech,
                  focus: briefFocus,
                });
              }}
              className={`w-full py-3.5 rounded-xl font-mono text-xs tracking-wider uppercase font-semibold text-center transition-all duration-350 cursor-pointer ${
                isNight
                  ? "bg-brand-gold text-black hover:bg-brand-gold-dark"
                  : "bg-brand-emerald text-white hover:bg-brand-emerald-dark"
              }`}
            >
              Select this blueprint
            </button>
          </div>
        </div>
      </div>

      {/* Overlay Footer */}
      <div className="max-w-5xl w-full mx-auto pt-6 border-t border-neutral-200/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] tracking-widest uppercase font-mono text-zinc-500">
        <span>Eternal Virtual Workshop</span>
        <span>4+ Years of Flawless Deliverables</span>
      </div>
    </motion.div>
  );
}
