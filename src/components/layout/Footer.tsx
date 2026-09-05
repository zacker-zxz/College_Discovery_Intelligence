"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Database, FileText, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden mt-24 border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative app-frame py-16 space-y-14">
        {/* Top Newsletter & Alert Subscription Bar */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-7 md:p-9 flex flex-col md:flex-row items-center justify-between gap-8 shadow-glow backdrop-blur-sm">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> JoSAA & Entrance Alerts
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Stay Updated on JoSAA Cutoffs & NIRF Rankings
            </h3>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Get notified when official opening-closing cutoffs, fee revisions, or placement reports are ingested into CampusLens.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to JoSAA & Entrance Alerts!"); }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter student email..."
              className="bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-500 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-full sm:w-64"
              required
            />
            <Button type="submit" variant="primary" size="md" className="bg-blue-600 hover:bg-blue-500 border-none shrink-0">
              Subscribe <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Multi-Column Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 gap-y-12">
          <div className="col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-glow">
                C
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">CampusLens</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Commercial-grade data platform empowering engineering and science candidates with normalized metrics, side-by-side matrices, and rank predictors.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> NIRF & AISHE 2024 Verified
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-5">
              Intelligence Tools
            </h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li>
                <Link href="/colleges" className="hover:text-white transition-colors">
                  College Directory
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Side-by-Side Matrix
                </Link>
              </li>
              <li>
                <Link href="/predictor" className="hover:text-white transition-colors">
                  JEE & Entrance Predictor
                </Link>
              </li>
              <li>
                <Link href="/discussions" className="hover:text-white transition-colors">
                  Student Discussions
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-white transition-colors">
                  Saved Items Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-5">
              Popular Specializations
            </h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li>
                <Link href="/colleges?course=CSE" className="hover:text-white transition-colors">
                  Computer Science & Engg
                </Link>
              </li>
              <li>
                <Link href="/colleges?course=AI" className="hover:text-white transition-colors">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link href="/colleges?course=EE" className="hover:text-white transition-colors">
                  Electrical Engineering
                </Link>
              </li>
              <li>
                <Link href="/colleges?type=IIT" className="hover:text-white transition-colors">
                  IIT Institutions
                </Link>
              </li>
              <li>
                <Link href="/colleges?type=NIT" className="hover:text-white transition-colors">
                  NIT Institutions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-5">
              Data Lineage & Stack
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400 shrink-0" />
                PostgreSQL & Prisma ORM
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                Next.js App Router (TypeScript)
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Deduplicated Data Lineage
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CampusLens Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
