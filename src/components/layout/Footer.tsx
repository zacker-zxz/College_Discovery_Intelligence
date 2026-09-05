"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Database, FileText, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-20 border-t border-slate-800 text-xs relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="app-frame py-14 space-y-12">
        {/* Top Newsletter & Alert Subscription Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> JoSAA & Entrance Alerts
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
              Stay Updated on JoSAA Cutoffs & NIRF Rankings
            </h3>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              Get notified when official opening-closing cutoffs, fee revisions, or placement reports are ingested into CampusLens.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to JoSAA & Entrance Alerts!"); }} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter student email..."
              className="bg-slate-950 border border-slate-800 text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-full md:w-64"
              required
            />
            <Button type="submit" variant="primary" size="md" className="bg-blue-600 hover:bg-blue-500 border-none">
              Subscribe <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Multi-Column Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-glow">
                C
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">CampusLens</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Commercial-grade data platform empowering engineering and science candidates with normalized metrics, side-by-side matrices, and rank predictors.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/80 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> NIRF & AISHE 2024 Verified
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
              Intelligence Tools
            </h4>
            <ul className="space-y-2.5 font-medium">
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
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
              Popular Specializations
            </h4>
            <ul className="space-y-2.5 font-medium">
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
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
              Data Lineage & Stack
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                PostgreSQL & Prisma ORM
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Next.js App Router (TypeScript)
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Deduplicated Data Lineage
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} CampusLens Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
