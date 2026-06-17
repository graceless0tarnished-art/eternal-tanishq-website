/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Eye, Shield, Layers, Volume2, VolumeX, Sun, Moon, CheckCircle2, X } from "lucide-react";
// @ts-ignore
import minimal8kBg from "./assets/images/minimal_8k_bg_1781107358033.png";
// @ts-ignore
import minimal8kNightBg from "./assets/images/minimal_8k_night_bg_1781107578233.png";
// @ts-ignore
import webDesignAuraMockup from "./assets/images/web_design_aura_1781109468245.png";
// @ts-ignore
import webDesignKronosMockup from "./assets/images/web_design_kronos_1781109481358.png";
// @ts-ignore
import methLayouts from "./assets/images/meth_layouts_1781198891409.jpg";
// @ts-ignore
import methCode from "./assets/images/meth_code_1781198908209.jpg";
// @ts-ignore
import methCircadian from "./assets/images/meth_circadian_1781198921393.jpg";

import { BriefBuilder } from "./components/BriefBuilder";
import { PortfolioShowcase } from "./components/PortfolioShowcase";
import { MethodologyCard } from "./components/MethodologyCard";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTimeText, setCurrentTimeText] = useState("15:57:59");
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [show8kImage, setShow8kImage] = useState(true);
  const [ambientProgress, setAmbientProgress] = useState(0.0); // 0 (pure Day) to 1 (pure Night)
  const [isAutoCycle, setIsAutoCycle] = useState(true);
  const [cycleDirection, setCycleDirection] = useState(1); // 1 = nightbound, -1 = daybound

  // Proposed/Inquiry custom client states
  const [briefStyle, setBriefStyle] = useState("minimal");
  const [briefTech, setBriefTech] = useState("visual");
  const [briefFocus, setBriefFocus] = useState("motion");
  const [briefClientName, setBriefClientName] = useState("");
  const [briefEmail, setBriefEmail] = useState("");
  const [briefMessage, setBriefMessage] = useState("");
  const [briefSubmitted, setBriefSubmitted] = useState(false);
  const [briefTimeline, setBriefTimeline] = useState("express");
  const [briefSubmitting, setBriefSubmitting] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Update IST clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        setCurrentTimeText(formatter.format(now));
      } catch (e) {
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const ist = new Date(utc + 3600000 * 5.5);
        const hours = String(ist.getHours()).padStart(2, "0");
        const minutes = String(ist.getMinutes()).padStart(2, "0");
        const seconds = String(ist.getSeconds()).padStart(2, "0");
        setCurrentTimeText(`${hours}:${minutes}:${seconds}`);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isNight = ambientProgress > 0.5;

  // Ambient Day-to-night cross-fade shift loop
  useEffect(() => {
    if (!isAutoCycle) return;
    
    let direction = cycleDirection;
    const interval = setInterval(() => {
      setAmbientProgress((prev) => {
        let next = prev + direction * 0.003; // ultra-smooth, subtle slow shift
        if (next >= 1.0) {
          next = 1.0;
          direction = -1;
          setCycleDirection(-1);
        } else if (next <= 0.0) {
          next = 0.0;
          direction = 1;
          setCycleDirection(1);
        }
        return Number(next.toFixed(4));
      });
    }, 30); // smooth cinematic animation updates

    return () => clearInterval(interval);
  }, [isAutoCycle, cycleDirection]);

  // Precise loop/video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (show8kImage) {
      video.pause();
      video.style.opacity = "0";
      return;
    }

    video.play().catch((err) => {
      console.warn("Auto-play blocked initially. Interaction required.", err);
    });

    let rafId: number;
    const updateVideoOpacity = () => {
      if (!video) return;
      const duration = video.duration;
      const currentTime = video.currentTime;
      let opacity = 1;

      if (duration && !isNaN(duration)) {
        if (currentTime < 0.5) opacity = currentTime / 0.5;
        else if (currentTime > duration - 0.5) opacity = Math.max(0, (duration - currentTime) / 0.5);
        else opacity = 1;
      } else {
        opacity = currentTime < 0.5 ? currentTime / 0.5 : 1;
      }

      opacity = Math.min(Math.max(opacity, 0), 1);
      video.style.opacity = opacity.toString();
      rafId = requestAnimationFrame(updateVideoOpacity);
    };

    rafId = requestAnimationFrame(updateVideoOpacity);

    const handleEnded = () => {
      if (!video) return;
      video.style.opacity = "0";
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        video.play().catch((err) => {
          console.warn("Video restart blocked:", err);
        });
      }, 100);
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      cancelAnimationFrame(rafId);
      if (video) video.removeEventListener("ended", handleEnded);
    };
  }, [show8kImage]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleSelectBlueprint = (params: { style: string; tech: string; focus: string }) => {
    setBriefStyle(params.style);
    setBriefTech(params.tech);
    setBriefFocus(params.focus);
    
    // Auto fill a default customized message based on selections
    const styleLabel = params.style === "minimal" 
      ? "Minimalist Editorial" 
      : params.style === "brutalist" 
      ? "Brutalist Cyber" 
      : "Fluid Motion";
    const techLabel = params.tech === "visual" 
      ? "Interactive selected works gallery" 
      : "Luxury cart & transactional architecture";
    const focusLabel = params.focus === "motion" 
      ? "Circadian Parallax kinetics" 
      : params.focus === "speed" 
      ? "Zero-loading latency metrics" 
      : "Tactile device feedbacks";

    setBriefMessage(`We would love to design an outstanding digital masterpiece styled with "${styleLabel}". Our project demands "${techLabel}" focusing primarily on "${focusLabel}". Let's arrange a vision review.`);
    setIsJourneyStarted(false);

    // Scroll smoothly to contact / blueprint form
    setTimeout(() => {
      const target = document.getElementById("join");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 250);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="hero-root" className={`relative min-h-screen w-full overflow-y-auto scroll-smooth flex flex-col justify-between selection:bg-neutral-900 selection:text-white transition-colors duration-1000 ${isNight ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      
      {/* Background layer stays FIXED so sections slide on top beautifully */}
      <div id="video-container" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          id="video-wrapper"
          style={{ position: "absolute", inset: "0 0 0 0" }}
          className={`overflow-hidden transition-colors duration-1000 ${isNight ? 'bg-[#0A0A0A]' : 'bg-white'}`}
        >
          {/* Stunning 8K Generated Image Background: Day */}
          <img
            src={minimal8kBg}
            alt="Minimalist 8k resolution studio backdrop - Day"
            referrerPolicy="no-referrer"
            style={{ opacity: show8kImage ? (1 - ambientProgress) : 0 }}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          />

          {/* Stunning 8K Generated Image Background: Night */}
          <img
            src={minimal8kNightBg}
            alt="Minimalist 8k resolution studio backdrop - Night"
            referrerPolicy="no-referrer"
            style={{ opacity: show8kImage ? ambientProgress : 0 }}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          />

          {/* Looping video fallback layer */}
          <video
            ref={videoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
            className={`w-full h-full object-cover transition-opacity duration-500 ${show8kImage ? "opacity-0 pointer-events-none" : ""}`}
            muted={isMuted}
            playsInline
            autoPlay
          />

          {/* Softer Ambient Gradient overlays to lock high legibility */}
          <div
            id="video-overlay"
            className={`absolute inset-0 bg-gradient-to-b pointer-events-none transition-all duration-1000 ${isNight ? 'from-[#0A0A0A]/50 via-[#0A0A0A]/20 to-[#0A0A0A]/90' : 'from-white/50 via-white/20 to-white/90'}`}
          />
        </div>
      </div>

      {/* Sticky Premium Header Menu */}
      <header id="main-header" className={`sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between border-b backdrop-blur-md transition-all duration-1000 ${isNight ? 'border-neutral-900/40 bg-[#0A0A0A]/60' : 'border-neutral-100/40 bg-white/60'}`}>
        <div id="logo-container" className="flex items-center space-x-3 select-none">
          <a href="#" className={`font-serif text-lg sm:text-xl tracking-[0.35em] uppercase font-light transition-colors duration-1000 ${isNight ? 'text-white' : 'text-black'}`}>
            ETERNAL
          </a>
          <span className={`font-sans text-sm font-light transition-colors duration-1000 ${isNight ? 'text-neutral-800' : 'text-neutral-200'}`}>
            /
          </span>
          <span className={`font-mono text-[8.5px] tracking-[0.32em] uppercase font-light transition-colors duration-1000 ${isNight ? 'text-brand-gold' : 'text-brand-emerald-dark'}`}>
            TANISHQ
          </span>
        </div>

        {/* Navigation Map for custom portfolio sections */}
        <nav id="nav-links" className="hidden md:flex items-center space-x-8 text-[10px] tracking-[0.18em] uppercase font-sans">
          <a 
            href="#exhibits" 
            onClick={(e) => handleNavClick(e, "exhibits")}
            className={`${isNight ? 'text-zinc-400 hover:text-white' : 'text-[#6F6F6F] hover:text-black'} transition-colors duration-300`}
          >
            Exhibits
          </a>
          <a 
            href="#experience" 
            onClick={(e) => handleNavClick(e, "experience")}
            className={`${isNight ? 'text-zinc-400 hover:text-white' : 'text-[#6F6F6F] hover:text-black'} transition-colors duration-300`}
          >
            Legacy & Specs
          </a>
          <a 
            href="#approach" 
            onClick={(e) => handleNavClick(e, "approach")}
            className={`${isNight ? 'text-zinc-400 hover:text-white' : 'text-[#6F6F6F] hover:text-black'} transition-colors duration-300`}
          >
            Methodology
          </a>
          <a 
            href="#join" 
            onClick={(e) => handleNavClick(e, "join")}
            className={`${isNight ? 'text-zinc-400 hover:text-white' : 'text-[#6F6F6F] hover:text-black'} transition-colors duration-300`}
          >
            Initiate Portal
          </a>
        </nav>

        {/* Dynamic header controllers */}
        <div id="header-actions" className="flex items-center space-x-2 sm:space-x-3">
          {show8kImage && (
            <div className={`flex items-center space-x-0.5 p-0.5 rounded-full border transition-all duration-1000 ${isNight ? 'border-neutral-800/80 bg-neutral-900/95' : 'border-neutral-200 bg-white/95'} backdrop-blur-xs`}>
              <button
                onClick={() => {
                  setIsAutoCycle(false);
                  setAmbientProgress(0.0);
                }}
                className={`p-1 rounded-full transition-all duration-300 ${ambientProgress < 0.3 ? (isNight ? "bg-white text-black font-semibold" : "bg-black text-white") : "text-neutral-500 hover:text-black"}`}
                title="Set Daylight"
              >
                <Sun size={11} />
              </button>

              <button
                onClick={() => {
                  setIsAutoCycle(false);
                  setAmbientProgress(1.0);
                }}
                className={`p-1 rounded-full transition-all duration-300 ${ambientProgress > 0.7 ? (isNight ? "bg-white text-black" : "bg-black text-white") : "text-neutral-500 hover:text-black"}`}
                title="Set Midnight Glow"
              >
                <Moon size={11} />
              </button>

              <button
                onClick={() => setIsAutoCycle(!isAutoCycle)}
                className={`text-[8px] tracking-widest uppercase font-sans px-1.5 py-0.5 rounded-full transition-all duration-300 ${isAutoCycle ? (isNight ? "bg-neutral-800 text-brand-gold font-semibold" : "bg-neutral-150 text-brand-emerald font-semibold") : (isNight ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-700")}`}
                title="Toggle Ambient Cycle Engine"
              >
                Auto {isAutoCycle ? "ON" : "OFF"}
              </button>
            </div>
          )}

          <button
            id="sound-trigger"
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-full border transition-all duration-1000 ${isNight ? 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:text-white' : 'border-neutral-200 bg-white/90 text-neutral-600 hover:text-black'} backdrop-blur-xs`}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          
          <a
            id="join-link"
            href="#join"
            onClick={(e) => handleNavClick(e, "join")}
            className={`text-[9px] tracking-[0.22em] uppercase font-sans font-medium transition-all duration-1000 border-b pb-1 hover:opacity-75 ${isNight ? 'text-brand-gold border-brand-gold/30' : 'text-brand-emerald border-brand-emerald/30'}`}
          >
            Inquire
          </a>
        </div>
      </header>

      {/* SECTION 1: Centered Brand Intro */}
      <main id="main-content" className="relative z-10 flex-grow flex flex-col items-center justify-between text-center px-6 max-w-7xl mx-auto pt-24 pb-8 min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Subtle Luxury Ambient Glow Backplate */}
        <div className="absolute inset-x-0 top-1/4 -translate-y-12 flex items-center justify-center pointer-events-none z-0">
          <div className={`w-[280px] sm:w-[600px] h-[280px] sm:h-[600px] rounded-full blur-[110px] sm:blur-[200px] opacity-35 transition-all duration-1000 ${isNight ? 'bg-brand-gold-dark/10' : 'bg-brand-emerald/5'}`} />
        </div>

        <div />
        <div className="relative z-10 space-y-8 flex flex-col items-center">
          {/* Headline */}
          <h1
            id="hero-title"
            className={`font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light leading-[0.95] sm:leading-[0.9] tracking-[-0.035em] animate-fade-rise transition-colors duration-1000 ${isNight ? 'text-white' : 'text-neutral-900'}`}
          >
            Beyond <span className={`italic font-light transition-colors duration-1000 ${isNight ? 'text-brand-gold' : 'text-brand-emerald'}`}>code,</span> we craft <span className={`italic font-light transition-colors duration-1000 ${isNight ? 'text-brand-gold' : 'text-brand-emerald'}`}>experiences.</span>
          </h1>

          {/* Description */}
          <p
            id="hero-description"
            className={`font-sans text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed tracking-wide animate-fade-rise-delay transition-colors duration-1000 ${isNight ? 'text-zinc-300 font-light' : 'text-neutral-800 font-light'}`}
          >
            Designing bespoke web architectures and flawless interactive systems for brilliant minds, bold creators, and luxury brands. We shape the future of high-end digital representation.
          </p>

          {/* CTA Buttons */}
          <div id="cta-container" className="pt-4 flex flex-col sm:flex-row items-center gap-4 animate-fade-rise-delay-2">
            <motion.button
              id="journey-trigger"
              onClick={() => setIsJourneyStarted(true)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative overflow-hidden rounded-full px-12 py-4.5 text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-all duration-1000 hover:shadow-xl ${isNight ? "bg-white text-black hover:bg-neutral-100 shadow-lg shadow-white/5" : "bg-black text-white hover:bg-neutral-900 shadow-lg shadow-black/5"}`}
            >
              <span className="relative z-10">Begin Journey</span>
              <span className="absolute inset-0 block overflow-hidden rounded-full pointer-events-none">
                <span className={`absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent ${isNight ? 'via-brand-gold/65' : 'via-white/50'} to-transparent -skew-x-[20deg] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1800ms] ease-out`} />
              </span>
            </motion.button>
            <a
              href="#exhibits"
              onClick={(e) => handleNavClick(e, "exhibits")}
              className={`px-8 py-4.5 rounded-full text-xs uppercase font-semibold tracking-[0.25em] border transition-all duration-300 ${isNight ? 'border-neutral-850 text-zinc-300 hover:border-brand-gold hover:text-white bg-neutral-900/40' : 'border-zinc-200 text-zinc-700 hover:border-black hover:text-black bg-stone-50/50'}`}
            >
              Exhibits Grid
            </a>
          </div>
        </div>

        {/* Micro Scroll indicator */}
        <div id="scroll-indicator" className="flex flex-col items-center space-y-3 pt-12 select-none opacity-85 z-10">
          <span className={`font-mono text-[8px] tracking-[0.3em] uppercase transition-colors duration-1000 ${isNight ? 'text-zinc-500' : 'text-neutral-450'}`}>
            Scroll to Explore
          </span>
          <div className={`relative w-[1px] h-11 ${isNight ? 'bg-neutral-900' : 'bg-neutral-200'} overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-1/2 rounded-full animate-scroll-line transition-all duration-1000 ${isNight ? 'bg-brand-gold/60' : 'bg-brand-emerald/50'}`} />
          </div>
        </div>
      </main>

      {/* SECTION 2: Legacy, Refinement & Experience Indicator */}
      <section id="experience" className={`relative z-20 py-24 sm:py-32 border-b backdrop-blur-sm transition-all duration-1000 ${isNight ? 'border-neutral-950/80 bg-[#070707]/60' : 'border-neutral-100/60 bg-white/30'}`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className={`font-mono text-xs tracking-[0.25em] uppercase font-semibold ${isNight ? 'text-brand-gold/90' : 'text-brand-emerald'}`}>
              01 / Legacy of Integrity
            </span>
            <h2 className={`font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight tracking-[-0.03em] transition-colors duration-1000 ${isNight ? 'text-white' : 'text-neutral-900'}`}>
              Four Years of <br />
              <span className="italic font-normal">Flawless execution.</span>
            </h2>
            <p className={`font-sans text-sm sm:text-base leading-relaxed max-w-sm transition-colors duration-1000 ${isNight ? 'text-zinc-400 font-light' : 'text-neutral-700 font-light'}`}>
              Since founding our studio four years ago in 2022, Eternal has dedicated each day to constructing bespoke digital residences for visionary creators, custom brand startups, and high-end labels. We strictly bypass builders, writing pure, beautiful code from scratch.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-700 hover:-translate-y-0.5 ${isNight ? 'border-neutral-900 bg-neutral-950/40 text-white hover:border-brand-gold/30 shadow-2xl shadow-black/5' : 'border-neutral-150 bg-white/40 text-black hover:border-brand-emerald/15 shadow-xl shadow-stone-200/20'} backdrop-blur-md`}>
              <h3 className="font-serif text-3xl sm:text-4xl font-light mb-1">4 Yrs</h3>
              <p className="font-sans text-[10px] tracking-wider uppercase font-semibold text-zinc-500">Aesthetic Experience</p>
              <p className={`font-sans text-xs mt-2 ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-650 font-light'}`}>relentless design iteration since 2022.</p>
            </div>
            
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-700 hover:-translate-y-0.5 ${isNight ? 'border-neutral-900 bg-neutral-950/40 text-white hover:border-brand-gold/30 shadow-2xl shadow-black/5' : 'border-neutral-150 bg-white/40 text-black hover:border-brand-emerald/15 shadow-xl shadow-stone-200/20'} backdrop-blur-md`}>
              <h3 className="font-serif text-3xl sm:text-4xl font-light mb-1">50+</h3>
              <p className="font-sans text-[10px] tracking-wider uppercase font-semibold text-zinc-500">Masterpieces</p>
              <p className={`font-sans text-xs mt-2 ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-650 font-light'}`}>Bespoke web representations dispatched globally.</p>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-700 hover:-translate-y-0.5 ${isNight ? 'border-neutral-900 bg-neutral-950/40 text-white hover:border-brand-gold/30 shadow-2xl shadow-black/5' : 'border-neutral-150 bg-white/40 text-black hover:border-brand-emerald/15 shadow-xl shadow-stone-200/20'} backdrop-blur-md`}>
              <h3 className="font-serif text-3xl sm:text-4xl font-light mb-1">100%</h3>
              <p className="font-sans text-[10px] tracking-wider uppercase font-semibold text-zinc-500">Uncompromising Code</p>
              <p className={`font-sans text-xs mt-2 ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-650 font-light'}`}>Zero stock templates or rigid layout builders.</p>
            </div>

            <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-700 hover:-translate-y-0.5 ${isNight ? 'border-neutral-900 bg-neutral-950/40 text-white hover:border-brand-gold/30 shadow-2xl shadow-black/5' : 'border-neutral-150 bg-white/40 text-black hover:border-brand-emerald/15 shadow-xl shadow-stone-200/20'} backdrop-blur-md`}>
              <h3 className="font-serif text-3xl sm:text-4xl font-light mb-1">&lt; 0.4s</h3>
              <p className="font-sans text-[10px] tracking-wider uppercase font-semibold text-zinc-500">Average First Paint</p>
              <p className={`font-sans text-xs mt-2 ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-650 font-light'}`}>Optimized architectures built for speed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Exhibits Showcase Gallery */}
      <section id="exhibits" className={`relative z-20 py-24 sm:py-32 border-b backdrop-blur-sm transition-all duration-1000 ${isNight ? 'border-neutral-950 bg-[#070707]/30' : 'border-neutral-100/40 bg-white/10'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <span className={`font-mono text-xs tracking-[0.25em] uppercase font-semibold ${isNight ? 'text-brand-gold/90' : 'text-brand-emerald'}`}>
                02 / Immersive Portfolio
              </span>
              <h2 className={`font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight tracking-[-0.03em] ${isNight ? 'text-white' : 'text-neutral-900'}`}>
                Digital masterpieces <br />
                <span className="italic font-normal">built to endure.</span>
              </h2>
            </div>
            <p className={`font-sans text-sm max-w-xs transition-colors duration-1000 ${isNight ? 'text-zinc-450 font-light' : 'text-zinc-655 font-light'}`}>
              Each custom layout we build showcases balanced negative space, absolute cryptographic layout precision, and swift loading specs.
            </p>
          </div>

          {/* Render our custom PortfolioShowcase images */}
          <PortfolioShowcase 
            isNight={isNight} 
            webDesignAuraMockup={webDesignAuraMockup}
            webDesignKronosMockup={webDesignKronosMockup}
          />
        </div>
      </section>

      {/* SECTION 4: Our Web-Building Methodology */}
      <section id="approach" className={`relative z-20 py-24 sm:py-32 border-b backdrop-blur-sm transition-all duration-1000 ${isNight ? 'border-neutral-950 bg-[#070707]/60' : 'border-neutral-100/60 bg-white/30'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16 space-y-4">
            <span className={`font-mono text-xs tracking-[0.25em] uppercase font-semibold ${isNight ? 'text-brand-gold/90' : 'text-brand-emerald'}`}>
              03 / Methodology
            </span>
            <h2 className={`font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight tracking-[-0.03em] ${isNight ? 'text-white' : 'text-neutral-900'}`}>
              High-end digital engineering <br />
              <span className="italic font-normal">tailored to your vision.</span>
            </h2>
            <p className={`font-sans text-sm sm:text-base leading-relaxed ${isNight ? 'text-zinc-400 font-light' : 'text-neutral-750 font-light'}`}>
              We combine robust full-stack capabilities with bespoke design layouts. We reject stock paradigms, focusing on raw speed, sensory transitions, and typographic layouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <MethodologyCard
              isNight={isNight}
              image={methLayouts}
              title="Bespoke Visual Layouts"
              desc="Your story deserves custom typography pairings, precise margins, and smooth micro-animations. Every pixel reinforces your prestige."
              icon={<Layers size={16} className="stroke-[1.2]" />}
            />

            <MethodologyCard
              isNight={isNight}
              image={methCode}
              title="Immutable Clean Code"
              desc="Vite architectures, optimized layouts, and strict dependency hygiene. Shipped with 4 years of battle-tested luxury development workflows."
              icon={<Shield size={16} className="stroke-[1.2]" />}
            />

            <MethodologyCard
              isNight={isNight}
              image={methCircadian}
              title="Circadian Daylight Shift"
              desc="A magnificent sensory environment adapting to user hours. Beautiful daylight clarity eases into warm golden candlelight midnight glows."
              icon={<Eye size={16} className="stroke-[1.2]" />}
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: Contact Inquiry Blueprint Form */}
      <section id="join" className={`relative z-20 py-24 sm:py-32 backdrop-blur-md transition-all duration-1000 ${isNight ? 'bg-[#070707]/70' : 'bg-[#FAF9F6]/60'}`}>
        <div className="max-w-3xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <span className={`font-mono text-xs tracking-[0.25em] uppercase font-semibold ${isNight ? 'text-brand-gold/90' : 'text-brand-emerald'}`}>
              04 / Secure an Inquiry
            </span>
            <h2 className={`font-serif text-5xl sm:text-6xl font-light leading-tight tracking-[-0.038em] transition-colors duration-1000 ${isNight ? 'text-white' : 'text-neutral-900'}`}>
              Initiate <span className="italic font-normal">your masterpiece.</span>
            </h2>
            <p className={`font-sans text-sm sm:text-base max-w-lg mx-auto transition-colors duration-1000 ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-700 font-light'}`}>
              Let us engineer your high-end custom web system. Populate the blueprint form, and our visual architectures lead will connect within one business day.
            </p>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setBriefSubmitting(true);
              setBriefError(null);

              if (!briefClientName || !briefClientName.trim()) {
                setBriefError("Please enter your name.");
                setBriefSubmitting(false);
                return;
              }
              if (!briefEmail || !briefEmail.trim().includes("@")) {
                setBriefError("Please enter a valid email address.");
                setBriefSubmitting(false);
                return;
              }

              const newInquiryId = `inq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
              const inquiryPayload = {
                id: newInquiryId,
                name: briefClientName.trim(),
                email: briefEmail.trim(),
                style: briefStyle || "minimal",
                timeline: briefTimeline || "express",
                message: briefMessage ? briefMessage.trim() : "",
                submittedAt: new Date().toISOString()
              };

              let savedToFirestore = false;
              let savedToServer = false;

              // 1. Direct secure Firestore client-side write (Highly resilient API query directly targeting Google Cloud)
              try {
                const docRef = doc(db, "inquiries", newInquiryId);
                await setDoc(docRef, inquiryPayload);
                savedToFirestore = true;
                console.info("Direct Firestore save succeeded:", newInquiryId);
              } catch (fsErr) {
                console.error("Direct Firestore save failed, trying server fallback:", fsErr);
              }

              // 2. Server express REST twin-write fallback handler
              try {
                const response = await fetch("/api/inquiries", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(inquiryPayload),
                });

                if (response.ok) {
                  const contentType = response.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    await response.json();
                    savedToServer = true;
                    console.info("Server fallback save succeeded.");
                  }
                }
              } catch (srvErr) {
                console.error("Server fallback save failed:", srvErr);
              }

              if (savedToFirestore || savedToServer) {
                setBriefSubmitted(true);
                
                // Construct bulletproof mailto link to guarantee direct client-side email dispatch to owner
                const mailtoSubject = encodeURIComponent(`[Blueprint Arc] Design Inquiry: ${briefClientName.trim()}`);
                const mailtoBody = encodeURIComponent(
`Hi Blueprint Arc Team,

I have submitted a new architectural design blueprint on the platform. Here are my structural and contextual metrics:

- Name: ${briefClientName.trim()}
- Email: ${briefEmail.trim()}
- Selected Design Style: ${briefStyle || "minimal"}
- Project Timeline: ${briefTimeline || "express"}

Additional Scope Details:
${briefMessage ? briefMessage.trim() : "No additional parameter details specified."}

Submitted At: ${new Date().toLocaleString()}
Inquiry Reference ID: ${newInquiryId}

Please let me know if you can assist with this blueprint layout!
`
                );
                
                // Instantly open native client-side draft mail window for flawless delivery
                window.location.href = `mailto:power.xd980@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
              } else {
                setBriefError("Could not secure structural blueprint. Please verify your internet connection and try again.");
              }

              setBriefSubmitting(false);
            }}
            className={`p-8 sm:p-12 rounded-3xl text-left border space-y-6 transition-all duration-1000 max-w-2xl mx-auto ${isNight ? 'border-neutral-900 bg-black/50 shadow-2xl shadow-black/80' : 'border-neutral-150 bg-white/70 shadow-xl shadow-stone-200/20'}`}
          >
            {briefSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-5"
              >
                <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto ${isNight ? 'bg-neutral-900 text-brand-gold' : 'bg-neutral-50 text-brand-emerald'}`}>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className={`font-serif text-3xl font-light ${isNight ? 'text-white' : 'text-neutral-900'}`}>Systems Aligned!</h3>
                <p className={`font-sans text-xs leading-relaxed max-w-sm mx-auto ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-650 font-light'}`}>
                  Excellent! Your blueprint specifications have been securely recorded in our Firestore database.
                </p>
                
                <div className={`p-4 rounded-xl text-center space-y-2 text-xs leading-relaxed max-w-md mx-auto border ${isNight ? 'border-neutral-800 bg-neutral-950/40 text-zinc-300' : 'border-neutral-200 bg-neutral-50/50 text-neutral-700'}`}>
                  <p className="font-semibold font-serif text-[13px]">📬 Live Client Redirect Triggered</p>
                  <p className="font-light">
                    We also opened your default mail client draft pre-filled with this request for <strong className="font-semibold">power.xd980@gmail.com</strong>.
                  </p>
                  <p className="text-[10px] text-zinc-500 font-light">
                    If your browser blocked the automail popup or you'd like to open it again, click the launcher tab below:
                  </p>
                  
                  <div className="pt-2">
                    <a
                      href={`mailto:power.xd980@gmail.com?subject=${encodeURIComponent(`[Blueprint Arc] Design Inquiry: ${briefClientName.trim()}`)}&body=${encodeURIComponent(
`Hi Blueprint Arc Team,

I have submitted a new architectural design blueprint on the platform. Here are my structural and contextual metrics:

- Name: ${briefClientName.trim()}
- Email: ${briefEmail.trim()}
- Selected Design Style: ${briefStyle || "minimal"}
- Project Timeline: ${briefTimeline || "express"}

Additional Scope Details:
${briefMessage ? briefMessage.trim() : "No additional parameter details specified."}

Submitted At: ${new Date().toLocaleString()}
Inquiry Reference ID: Secured in Database
`
                      )}`}
                      className={`inline-block px-4 py-2 rounded-lg text-[10px] font-mono tracking-wider uppercase font-semibold border transition-all duration-300 ${isNight ? 'bg-brand-gold border-brand-gold text-black hover:bg-transparent hover:text-brand-gold' : 'bg-brand-emerald border-brand-emerald text-white hover:bg-transparent hover:text-brand-emerald'}`}
                    >
                      🚀 Launch Mail Client (Draft Copy)
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setBriefSubmitted(false);
                      setBriefClientName("");
                      setBriefEmail("");
                      setBriefMessage("");
                      setBriefError(null);
                    }}
                    className={`font-mono text-[9px] tracking-widest uppercase border-b pb-0.5 cursor-pointer ${isNight ? 'text-brand-gold border-brand-gold/30 font-semibold hover:text-white hover:border-white' : 'text-brand-emerald border-brand-emerald/30 font-semibold hover:text-neutral-900 hover:border-neutral-950'}`}
                  >
                    Submit Alternative Vision
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block font-mono text-[9px] tracking-[0.2em] uppercase ${isNight ? 'text-zinc-500' : 'text-neutral-400'}`}>Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Alexander"
                      value={briefClientName}
                      onChange={(e) => setBriefClientName(e.target.value)}
                      className={`w-full p-3.5 font-sans text-xs rounded-xl border bg-transparent transition-all duration-300 outline-none ${isNight ? 'border-neutral-850 text-white placeholder-zinc-700 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 bg-neutral-950/80' : 'border-neutral-200 text-black placeholder-zinc-400 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/10 bg-white'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`block font-mono text-[9px] tracking-[0.2em] uppercase ${isNight ? 'text-zinc-500' : 'text-neutral-400'}`}>Your Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g., alex@vision.co"
                      value={briefEmail}
                      onChange={(e) => setBriefEmail(e.target.value)}
                      className={`w-full p-3.5 font-sans text-xs rounded-xl border bg-transparent transition-all duration-300 outline-none ${isNight ? 'border-neutral-850 text-white placeholder-zinc-700 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 bg-neutral-950/80' : 'border-neutral-200 text-black placeholder-zinc-400 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/10 bg-white'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block font-mono text-[9px] tracking-[0.2em] uppercase ${isNight ? 'text-zinc-500' : 'text-neutral-400'}`}>Website Style</label>
                    <select 
                      value={briefStyle} 
                      onChange={(e) => setBriefStyle(e.target.value)}
                      className={`w-full p-3.5 font-sans text-xs rounded-xl border bg-transparent transition-all duration-300 outline-none ${isNight ? 'border-neutral-850 text-white focus:border-brand-gold bg-[#0e0e0e] text-zinc-300' : 'border-neutral-200 text-black focus:border-brand-emerald bg-white text-zinc-800'}`}
                    >
                      <option value="minimal">Minimalist Editorial Portfolio</option>
                      <option value="brutalist">Brutalist Cyber Platform</option>
                      <option value="fluid">Interactive Spatial Canvas</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`block font-mono text-[9px] tracking-[0.2em] uppercase ${isNight ? 'text-zinc-400 font-semibold' : 'text-zinc-500'}`}>Launch Timeline</label>
                    <select 
                      value={briefTimeline}
                      onChange={(e) => setBriefTimeline(e.target.value)}
                      className={`w-full p-3.5 font-sans text-xs rounded-xl border bg-transparent transition-all duration-300 outline-none ${isNight ? 'border-neutral-850 text-white focus:border-brand-gold bg-[#0e0e0e] text-zinc-300' : 'border-neutral-200 text-black focus:border-brand-emerald bg-white text-zinc-800'}`}
                    >
                      <option value="express">Express Craft (14 Days)</option>
                      <option value="standard">Standard Refinement (30 Days)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block font-mono text-[9px] tracking-[0.2em] uppercase ${isNight ? 'text-zinc-500' : 'text-neutral-400'}`}>Grand vision / Project Brief</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe your vision here..."
                    value={briefMessage}
                    onChange={(e) => setBriefMessage(e.target.value)}
                    className={`w-full p-3.5 font-sans text-xs rounded-xl border bg-transparent transition-all duration-300 outline-none ${isNight ? 'border-neutral-850 text-white placeholder-zinc-700 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 bg-neutral-950/80' : 'border-neutral-200 text-black placeholder-zinc-400 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/10 bg-white'}`}
                  />
                </div>

                {briefError && (
                  <p className="font-mono text-[10px] text-red-500 text-center uppercase tracking-wider font-semibold">
                    {briefError}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={briefSubmitting}
                    whileHover={briefSubmitting ? {} : { scale: 1.02 }}
                    whileTap={briefSubmitting ? {} : { scale: 0.98 }}
                    className={`px-10 py-4 rounded-full font-mono text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 cursor-pointer ${briefSubmitting ? "opacity-50 cursor-not-allowed" : ""} ${isNight ? 'bg-white text-black hover:bg-neutral-100 hover:shadow-lg hover:shadow-white/5' : 'bg-black text-white hover:bg-neutral-900 hover:shadow-lg hover:shadow-black/5'}`}
                  >
                    {briefSubmitting ? "Securing Blueprint..." : "Submit Blueprint"}
                  </motion.button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Immersive Workshop Configurator Panel */}
      <AnimatePresence>
        {isJourneyStarted && (
          <BriefBuilder
            isOpen={isJourneyStarted}
            onClose={() => setIsJourneyStarted(false)}
            isNight={isNight}
            ambientProgress={ambientProgress}
            setAmbientProgress={setAmbientProgress}
            onSelectBlueprint={handleSelectBlueprint}
          />
        )}
      </AnimatePresence>

      {/* Aesthetic Extended Multi-Column Footer */}
      <footer id="main-footer" className={`relative z-20 w-full max-w-7xl mx-auto px-6 pt-16 pb-12 transition-all duration-1000 border-t ${isNight ? 'text-zinc-300 border-neutral-900/65' : 'text-zinc-900 border-neutral-200/60'} gap-4`}>
        <div id="extended-footer-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 lg:gap-12 pb-12">
          {/* Column 1: Studio DNA */}
          <div className="space-y-4">
            <h4 className={`font-mono text-[9px] tracking-[0.22em] uppercase font-bold transition-colors duration-1000 ${isNight ? 'text-brand-gold' : 'text-brand-emerald'}`}>
              STUDIO PHILOSOPHY
            </h4>
            <p className={`font-sans text-xs leading-relaxed transition-colors duration-1000 ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-650 font-light'}`}>
              Beyond code, we craft experiences that evoke elegance and command digital authority. We believe interfaces are sacred spaces that should respond with natural rhythm and luxury precision.
            </p>
          </div>

          {/* Column 2: Index Links */}
          <div className="space-y-4">
            <h4 className={`font-mono text-[9px] tracking-[0.22em] uppercase font-bold transition-colors duration-1000 ${isNight ? 'text-brand-gold' : 'text-brand-emerald'}`}>
              INDEX DIRECTORY
            </h4>
            <ul className="space-y-2.5 font-sans text-xs tracking-widest uppercase font-semibold">
              <li>
                <a 
                  href="#exhibits" 
                  onClick={(e) => handleNavClick(e, "exhibits")}
                  className={`hover:underline hover:opacity-85 transition-all ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-700 font-light'}`}
                >
                  Exhibits Showcase
                </a>
              </li>
              <li>
                <a 
                  href="#approach" 
                  onClick={(e) => handleNavClick(e, "approach")}
                  className={`hover:underline hover:opacity-85 transition-all ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-700 font-light'}`}
                >
                  Craft Methodology
                </a>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setIsJourneyStarted(true)} 
                  className={`hover:underline hover:opacity-85 transition-all text-left uppercase font-semibold text-xs ${isNight ? 'text-brand-gold font-light' : 'text-brand-emerald font-semibold'}`}
                >
                  Launch Configurator
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Frame */}
          <div className="space-y-4">
            <h4 className={`font-mono text-[9px] tracking-[0.22em] uppercase font-bold transition-colors duration-1000 ${isNight ? 'text-brand-gold' : 'text-brand-emerald'}`}>
              LEGAL FRAMEWORKS
            </h4>
            <ul className="space-y-2.5 font-sans text-xs tracking-widest uppercase font-semibold">
              <li>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className={`hover:underline hover:opacity-85 transition-all text-left uppercase font-semibold ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-700 font-light'}`}
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className={`hover:underline hover:opacity-85 transition-all text-left uppercase font-semibold ${isNight ? 'text-zinc-400 font-light' : 'text-zinc-700 font-light'}`}
                >
                  Privacy Policy
                </button>
              </li>
              <li className={`text-[10px] lowercase tracking-normal font-sans font-light hover:opacity-90 leading-tight ${isNight ? 'text-zinc-550' : 'text-neutral-400'}`}>
                SLA: 99.9% interactive frame response
              </li>
            </ul>
          </div>

          {/* Column 4: Studio Channels */}
          <div className="space-y-4">
            <h4 className={`font-mono text-[9px] tracking-[0.22em] uppercase font-bold transition-colors duration-1000 ${isNight ? 'text-brand-gold' : 'text-brand-emerald'}`}>
              SECURE CHANNELS
            </h4>
            <ul className="space-y-2.5 font-sans text-xs tracking-wider">
              <li className={`normal-case font-semibold ${isNight ? 'text-zinc-300 font-light' : 'text-zinc-850 font-light'}`}>
                Email: <a href="mailto:power.xd980@gmail.com" className={`underline hover:opacity-80 transition-opacity ${isNight ? 'text-brand-gold' : 'text-brand-emerald'}`}>power.xd980@gmail.com</a>
              </li>
              <li className="normal-case opacity-80 text-xs font-light">
                HQ: <span className="font-semibold">New Delhi, India</span>
              </li>
              <li className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-semibold">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-1000 ${isNight ? 'bg-brand-gold' : 'bg-brand-emerald'}`} />
                <span className="font-light">IST {currentTimeText}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className={`w-full h-[1px] mb-8 transition-colors duration-1000 ${isNight ? 'bg-neutral-900/60' : 'bg-neutral-100/80'}`} />

        {/* Sub-Footer Meta Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px] tracking-[0.25em] uppercase text-center sm:text-left">
          <div className={`transition-colors duration-1000 ${isNight ? 'text-zinc-550 font-light' : 'text-neutral-400'}`}>
            © 2022–2026 Studio. All rights immutable.
          </div>
          <div className={`transition-colors duration-1000 ${isNight ? 'text-zinc-550 font-light' : 'text-neutral-400'} flex items-center space-x-2`}>
            <span>Precision Render Pipeline</span>
            <span className={`w-1 h-1 rounded-full ${isNight ? 'bg-brand-gold/45' : 'bg-brand-emerald/40'}`} />
            <span>SPA Canvas v1.4</span>
          </div>
        </div>
      </footer>

      {/* Interactive Terms & Conditions Modal Overlay */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 sm:p-10 rounded-3xl border text-left shadow-2xl transition-all duration-1000 ${
                isNight ? "bg-neutral-950/98 border-neutral-800 text-white shadow-black" : "bg-white border-neutral-200 text-black shadow-stone-200/50"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className={`absolute top-6 right-6 p-2 rounded-full border transition-all ${
                  isNight ? "border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900" : "border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50"
                }`}
                title="Dismiss"
              >
                <X size={14} />
              </button>

              <div className="space-y-6">
                <div>
                  <span className={`font-mono text-[9px] tracking-[0.25em] uppercase font-bold ${isNight ? "text-brand-gold" : "text-brand-emerald"}`}>
                    Studio Agreement
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-light tracking-tight mt-1">
                    Terms & Conditions
                  </h3>
                  <p className={`font-mono text-[8px] mt-2 opacity-50 ${isNight ? "text-neutral-400" : "text-neutral-500"}`}>
                    LAST UPDATE: JUNE 2026
                  </p>
                </div>

                <div className={`w-full h-[1px] ${isNight ? "bg-neutral-900" : "bg-neutral-100"}`} />

                <div className={`space-y-5 font-sans text-xs leading-relaxed ${isNight ? "text-zinc-300" : "text-zinc-650 font-medium"}`}>
                  <p>
                    Thank you for reviewing our terms. These Terms and Conditions govern your engagement with our studio development frameworks, layout configurator tools, and custom digital design pipelines.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-light tracking-tight text-zinc-900 dark:text-zinc-100">1. Intellectual Property & Code Rights</h4>
                    <p className="opacity-90">
                      All custom visual systems, tailwind styling paradigms, interactive parallax components, and 3D kinetic cards developed by the studio are high-prestige custom assets. Upon final transaction settlement, standard proprietary rights and code outputs are completely transferred to the client.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-light tracking-tight text-zinc-900 dark:text-zinc-100">2. Service Architecture SLA</h4>
                    <p className="opacity-90">
                      Our web platforms are engineered through highly optimized, sandboxed container architectures. We utilize clean Node.js backend integrations and responsive client components. While we ensure high device viewport support, physical render performances vary on legacy devices.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-light tracking-tight text-zinc-900 dark:text-zinc-100">3. Vision Configurator & Submissions</h4>
                    <p className="opacity-90">
                      By inputting your metrics into our online Configurator Tool, you warrant that all text titles, custom descriptions, and guidelines submitted are legal and completely cleared. Studio retains the right to store compiled draft briefs temporarily in local preference systems.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-light tracking-tight text-zinc-900 dark:text-zinc-100">4. General Limitations</h4>
                    <p className="opacity-90">
                      In no circumstance shall the studio owners, creators, or development affiliates be liable for indirect, system-scale, or sandbox-level disruptions arising from custom layouts or third-party web deployments.
                    </p>
                  </div>
                </div>

                <div className={`w-full h-[1px] ${isNight ? "bg-neutral-900" : "bg-neutral-100"}`} />

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(false)}
                    className={`px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                      isNight ? "bg-white text-black hover:bg-neutral-100" : "bg-black text-white hover:bg-neutral-900"
                    }`}
                  >
                    Acknowledge & Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Interactive Privacy Policy Modal Overlay */}
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 sm:p-10 rounded-3xl border text-left shadow-2xl transition-all duration-1000 ${
                isNight ? "bg-neutral-950/98 border-neutral-800 text-white shadow-black" : "bg-white border-neutral-200 text-black shadow-stone-200/50"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className={`absolute top-6 right-6 p-2 rounded-full border transition-all ${
                  isNight ? "border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900" : "border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50"
                }`}
                title="Dismiss"
              >
                <X size={14} />
              </button>

              <div className="space-y-6">
                <div>
                  <span className={`font-mono text-[9px] tracking-[0.25em] uppercase font-bold ${isNight ? "text-brand-gold" : "text-brand-emerald"}`}>
                    Data Safeguards
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mt-1">
                    Privacy Policy
                  </h3>
                  <p className={`font-mono text-[8px] mt-2 opacity-50 ${isNight ? "text-neutral-400" : "text-neutral-500"}`}>
                    LAST UPDATE: JUNE 2026
                  </p>
                </div>

                <div className={`w-full h-[1px] ${isNight ? "bg-neutral-900" : "bg-neutral-100"}`} />

                <div className={`space-y-5 font-sans text-xs leading-relaxed ${isNight ? "text-zinc-300" : "text-zinc-650 font-medium"}`}>
                  <p>
                    Your privacy is an absolute luxury benchmark. This Privacy Policy details the exact scope of data processed when you engage with our interactive digital interfaces.
                  </p>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-normal tracking-tight text-zinc-900 dark:text-zinc-100">1. Information Collection</h4>
                    <p className="opacity-90">
                      We only accumulate user names, email coordinates, selected design styles, and grand timelines explicitly input inside our Configurator Panel. This custom bundle is used solely to populate client-side draft mail templates, and is never leased, stored externally, or cataloged.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-normal tracking-tight text-zinc-900 dark:text-zinc-100">2. Cookies & Local Cache</h4>
                    <p className="opacity-90">
                      Our platform utilizes standard local storage variables to store client configurations, such as saving your custom daylight sliders, soundtrack mute selections, or grand project submission flags. No third-party advertisements or invasive cookies are deployed database-wide.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-normal tracking-tight text-zinc-900 dark:text-zinc-100">3. Integrity of Assets</h4>
                    <p className="opacity-90">
                      All decorative icons and cinematic images displayed inside this experience are processed through local relative targets or certified content pipelines. No analytical recording or recording scripts operate behind our systems.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-normal tracking-tight text-zinc-900 dark:text-zinc-100">4. Review & Rectification</h4>
                    <p className="opacity-90">
                      You retain full control over your inputs. To wipe any stored local session metrics or update blueprint directives, feel free to directly message high-grade inquiries to our designated email coordinate: <span className="font-semibold underline">power.xd980@gmail.com</span>.
                    </p>
                  </div>
                </div>

                <div className={`w-full h-[1px] ${isNight ? "bg-neutral-900" : "bg-neutral-100"}`} />

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(false)}
                    className={`px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                      isNight ? "bg-white text-black hover:bg-neutral-100" : "bg-black text-white hover:bg-neutral-900"
                    }`}
                  >
                    Accept Privacy Clause
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
