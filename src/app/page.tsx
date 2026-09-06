"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Search, Compass, GitCompare, Sparkles, MessageSquare,
  ShieldCheck, TrendingUp, Award, ArrowRight, CheckCircle2, Zap,
  GraduationCap, Users, Building2, Star, MapPin, Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { AnimatedHeadline, useTypewriterPlaceholder } from "@/components/home/AnimatedHero";
import { SpotlightHero } from "@/components/home/SpotlightHero";

/* ── Animated Counter Hook ────────────────────────── */
function useCounter(end: number, duration = 2000, startOnView = true, isInView = true) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView || !isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, startOnView, isInView]);

  return count;
}

/* ── Framer Motion Variants ───────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ── Tool Card Data ───────────────────────────────── */
const tools = [
  { href: "/colleges", icon: Compass, title: "College Directory", desc: "Filter by state, fees, NIRF rank, accreditation, and programs with real-time server pagination.", color: "blue" },
  { href: "/compare", icon: GitCompare, title: "Comparison Matrix", desc: "Compare 2–3 institutions simultaneously. Highlights lowest fees, highest placements, and top ratings.", color: "emerald" },
  { href: "/predictor", icon: Sparkles, title: "Rank Predictor", desc: "Input your JEE Main, Advanced, MHT-CET, or WBJEE rank to compute Strong, Possible, and Target matches.", color: "purple" },
  { href: "/discussions", icon: MessageSquare, title: "Student Q&A", desc: "Ask doubts regarding cutoffs, faculty quality, placement realities, and branch selection.", color: "amber" },
];

const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", hover: "group-hover:text-blue-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", hover: "group-hover:text-emerald-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", hover: "group-hover:text-purple-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", hover: "group-hover:text-amber-600" },
};

/* ── Hero live content ─────────────────────────────── */
const SEARCH_PHRASES = [
  "Try \"IIT Bombay\" or \"NIT Trichy\"…",
  "Search by city — Mumbai, Delhi, Bengaluru…",
  "Find CSE, ECE, AI programs…",
  "Compare fees, placements & NIRF ranks…",
];

const MARQUEE_COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT BHU", "NIT Trichy",
  "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Rourkela",
  "IIIT Hyderabad", "IIIT Delhi", "IIIT Bangalore", "BITS Pilani",
  "DTU Delhi", "NSUT Delhi", "COEP Pune", "Jadavpur University",
  "VIT Vellore", "SRM Chennai", "Manipal MIT", "Thapar University",
  "RVCE Bengaluru", "PSG Coimbatore", "Ashoka University", "JNU Delhi",
];

const HERO_STATS = [
  { icon: Building2, value: "52,000+", label: "Institutions" },
  { icon: MapPin, value: "36", label: "States & UTs" },
  { icon: Award, value: "72", label: "Cutoff Ranks" },
  { icon: ShieldCheck, value: "AISHE", label: "Official Data" },
];

/* ══════════════════════════════════════════════════════
   HOME PAGE COMPONENT
   ══════════════════════════════════════════════════════ */

export default function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [featuredColleges, setFeaturedColleges] = useState<any[]>([]);
  const searchPlaceholder = useTypewriterPlaceholder(SEARCH_PHRASES);

  useEffect(() => {
    fetch("/api/colleges?limit=8&sort=nirf")
      .then((r) => r.json())
      .then((d) => setFeaturedColleges(d.colleges || []))
      .catch(() => {});
  }, []);

  /* ── Section Refs for useInView ─── */
  const heroRef = useRef(null);
  const toolsRef = useRef(null);
  const statsRef = useRef(null);
  const recommendRef = useRef(null);
  const provenanceRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const toolsInView = useInView(toolsRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.4 });
  const recommendInView = useInView(recommendRef, { once: true, amount: 0.2 });
  const provenanceInView = useInView(provenanceRef, { once: true, amount: 0.3 });

  /* ── Animated Counters ─── */
  const collegeCount = useCounter(52000, 1800, true, statsInView);
  const courseCount = useCounter(75, 1800, true, statsInView);
  const placementRate = useCounter(95, 2000, true, statsInView);
  const reviewCount = useCounter(8400, 2200, true, statsInView);

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════════════
          SECTION 1 — HERO (Clean Corporate Light)
          ═══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden">
        <SpotlightHero className="min-h-[88vh] w-full">
          <div className="app-frame py-20 md:py-24 flex-1 flex items-center w-full">
            <motion.div
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="text-center max-w-3xl mx-auto space-y-8 w-full"
            >
              {/* Badge */}
              <motion.div custom={0} variants={fadeInUp} className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  AISHE 2026 Directory — 52,000+ Institutions Indexed
                </div>
              </motion.div>

              {/* Title — word-by-word reveal, natural wrapping */}
              <AnimatedHeadline
                text="Data-Driven College Discovery & Decision Intelligence"
                highlightWords={["Decision", "Intelligence"]}
                highlightClass="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent"
                className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.12]"
              />

              {/* Subtitle */}
              <motion.p custom={2} variants={fadeInUp} className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Search India&apos;s complete AISHE college directory, compare tuition fees vs. placement packages side-by-side, and predict admission chances with explainable cutoff algorithms.
              </motion.p>

              {/* Live Search */}
              <motion.div custom={3} variants={fadeInUp} className="pt-2 max-w-2xl mx-auto">
                {/* relative + z-50 pins this card (and its dropdown) above the
                    pills row below — the dropdown can never be overlapped */}
                <div className="relative z-50 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800">
                  <SearchAutocomplete
                    size="lg"
                    inputClassName="rounded-xl"
                    placeholder={searchPlaceholder}
                  />
                </div>

                {/* Quick Filter Pills */}
                <div className="flex items-center justify-center gap-2 text-xs mt-5 flex-wrap">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Popular:</span>
                  {[
                    { label: "IITs", href: "/colleges?type=IIT" },
                    { label: "NITs", href: "/colleges?type=NIT" },
                    { label: "Private", href: "/colleges?ownership=PRIVATE" },
                    { label: "CSE", href: "/colleges?course=CSE" },
                    { label: "Maharashtra", href: "/colleges?state=Maharashtra" },
                    { label: "High Placements", href: "/colleges?sort=placement" },
                  ].map((f) => (
                    <Link
                      key={f.label}
                      href={f.href}
                      className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-all shadow-sm"
                    >
                      {f.label}
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Stats strip — clean bordered card */}
              <motion.div custom={4} variants={fadeInUp} className="pt-3 flex justify-center">
                <div className="inline-flex flex-wrap justify-center items-center gap-x-7 gap-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-7 py-3.5 shadow-sm">
                  {HERO_STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* College marquee — seamless, pause on hover */}
          <div className="relative pb-10 pt-2">
            <div className="text-center mb-5">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Index — Premier Institutions Tracked
              </span>
            </div>
            <div
              className="marquee-paused relative overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
              }}
            >
              <div className="animate-marquee flex w-max">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center gap-3 pr-3" aria-hidden={copy === 1}>
                    {MARQUEE_COLLEGES.map((name) => (
                      <span
                        key={`${copy}-${name}`}
                        className="whitespace-nowrap px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightHero>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — DECISION INTELLIGENCE TOOLS
          ═══════════════════════════════════════════════════ */}
      <section ref={toolsRef} className="py-20 md:py-28 relative">
        <div className="app-frame">
          <motion.div
            initial="hidden"
            animate={toolsInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div custom={0} variants={fadeInUp} className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Decision Framework
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Commercial-Grade Counseling Tools
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                Architected to eliminate guesswork from higher education selection.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool, i) => {
                const Icon = tool.icon;
                const colors = colorMap[tool.color];
                return (
                  <motion.div key={tool.href} custom={i + 1} variants={fadeInUp}>
                    <Link href={tool.href} className="group block h-full">
                      <div className="glass-card glass-card-hover rounded-2xl p-7 h-full space-y-5 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400/60 dark:hover:border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={`w-14 h-14 rounded-xl ${colors.bg} dark:bg-slate-800 ${colors.text} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className={`font-extrabold text-slate-900 dark:text-slate-100 text-lg ${colors.hover} transition-colors`}>
                          {tool.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                          {tool.desc}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Explore <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — ANIMATED STATS COUNTER BANNER (Light)
          ═══════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-16 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <motion.div
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="app-frame"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: collegeCount, suffix: "+", label: "Institutions Indexed", icon: GraduationCap },
              { value: courseCount, suffix: "+", label: "Programs Tracked", icon: Building2 },
              { value: placementRate, suffix: "%", label: "Avg Placement Rate", icon: TrendingUp },
              { value: reviewCount, suffix: "+", label: "Student Reviews", icon: Users },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} custom={i} variants={fadeInUp} className="space-y-2">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 4 — TOP COLLEGE RECOMMENDATIONS
          ═══════════════════════════════════════════════════ */}
      <section ref={recommendRef} className="py-20 md:py-28 relative">
        <div className="app-frame">
          <motion.div
            initial="hidden"
            animate={recommendInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div custom={0} variants={fadeInUp} className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                  <Zap className="w-4 h-4 text-emerald-500" /> Curated Recommendations
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Top College Recommendations
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
                  Handpicked premier engineering & science institutions ranked by placement ROI and academic reputation.
                </p>
              </div>
              <Link href="/colleges">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Explore the Full Directory <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </motion.div>

            {/* College Recommendation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredColleges.map((college, i) => (
                <motion.div key={college.id} custom={i + 1} variants={fadeInUp}>
                  <Link href={`/colleges/${college.slug}`} className="group block">
                    <div className="glass-card glass-card-hover rounded-2xl p-6 h-full space-y-4 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400/60 dark:hover:border-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="blue" size="sm" className="font-semibold shadow-sm">
                            {college.institutionType?.replace("_", " ")}
                          </Badge>
                          {college.nirfRank && (
                            <Badge variant="amber" size="sm" className="font-bold">
                              <Award className="w-3 h-3 mr-0.5" /> #{college.nirfRank}
                            </Badge>
                          )}
                        </div>
                        <Bookmark className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-400 transition-colors" />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {college.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {college.city}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Building2 className="w-3 h-3" /> {college.ownership}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 text-center">
                        <div>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">Avg Pkg</span>
                          <span className="text-xs font-black text-blue-700 dark:text-blue-400">₹{college.avgPackage} L</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">Fee</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">₹{college.minFee ? (college.minFee / 100000).toFixed(1) : "—"}L</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">Rating</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {college.overallRating}
                          </span>
                        </div>
                      </div>

                      {/* Course tags */}
                      {college.courses && college.courses.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {college.courses.slice(0, 3).map((cc: { id: string; course?: { code?: string; name?: string } }) => (
                            <span key={cc.id} className="text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              {cc.course?.code || cc.course?.name}
                            </span>
                          ))}
                          {college.courses.length > 3 && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">+{college.courses.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 5 — DATA PROVENANCE & LINEAGE
          ═══════════════════════════════════════════════════ */}
      <section ref={provenanceRef} className="py-20 md:py-28">
        <div className="app-frame">
          <motion.div
            initial="hidden"
            animate={provenanceInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div custom={0} variants={scaleIn}>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl p-8 md:p-14 grid grid-cols-1 md:grid-cols-3 gap-10 items-center shadow-subtle relative overflow-hidden">
                <div className="space-y-5 md:col-span-2 relative z-10">
                  <div className="inline-flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Provenance & Lineage
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    Transparent Ingestion Engine &<br className="hidden md:inline" /> Verified Data Sources
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xl">
                    Every college profile, cutoff rank range, and placement metric is normalized and deduplicated from official public portals. The full AISHE 2026 directory of 52,000+ institutions powers discovery, with NIRF-ranked profiles enriched by fees, placements, and cutoffs.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AISHE 2026
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> NIRF Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> JoSAA Cutoffs
                    </span>
                  </div>
                </div>

                <motion.div custom={1} variants={slideInRight} className="space-y-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-7 rounded-2xl text-sm relative z-10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">AISHE Directory Sync</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">52,000+ institutions across 36 states</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">NIRF Ranked Profiles</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Official Govt rankings engine</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center">
                      <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Fuzzy Live Search</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Typo-tolerant across all entities</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
