"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Building2, Star, Award, Bookmark, ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export interface CollegeCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  college: any;
  isSavedInitial?: boolean;
  isComparedInitial?: boolean;
  onToggleCompare?: (collegeId: string) => void;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
  college,
  isSavedInitial = false,
  isComparedInitial = false,
  onToggleCompare,
}) => {
  const [saved, setSaved] = useState(isSavedInitial);
  const [compared, setCompared] = useState(isComparedInitial);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToggle = async () => {
    setIsSaving(true);
    try {
      if (saved) {
        setSaved(false);
      } else {
        const res = await fetch("/api/me/saved-colleges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: college.id }),
        });
        if (res.ok) setSaved(true);
      }
    } catch {
      // revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompareClick = () => {
    const next = !compared;
    setCompared(next);
    if (onToggleCompare) onToggleCompare(college.id);
  };

  const formattedMinFee = college.minFee
    ? `₹${(college.minFee / 100000).toFixed(2)} L/yr`
    : "—";

  const formattedAvgPkg = college.avgPackage
    ? `₹${college.avgPackage} LPA`
    : "—";

  const hasRating = Number(college.overallRating) > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-2xl p-5 shadow-card hover:shadow-glow transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group border border-slate-200/80 dark:border-slate-800"
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top Badges & Save Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="blue" size="sm" className="font-semibold shadow-2xs">
              {String(college.institutionType || "").replaceAll("_", " ")}
            </Badge>
            {college.nirfRank ? (
              <Badge variant="amber" size="sm" className="font-bold">
                <Award className="w-3 h-3 mr-1" />
                NIRF #{college.nirfRank}
              </Badge>
            ) : null}
          </div>

          <button
            onClick={handleSaveToggle}
            disabled={isSaving}
            className={`p-1.5 rounded-lg transition-all border ${
              saved
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 shadow-2xs"
                : "bg-white/80 dark:bg-slate-800/80 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            title={saved ? "Saved" : "Save college"}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-amber-500 text-amber-500" : ""}`} />
          </button>
        </div>

        {/* Institution Title & Location */}
        <div className="space-y-1 mb-3">
          <Link
            href={`/colleges/${college.slug}`}
            className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block"
          >
            {college.name}
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {college.city}, {college.state}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {college.ownership}
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 mb-4 text-center">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-tight">
              Avg Package
            </span>
            <span className="text-xs font-black text-blue-700 dark:text-blue-400">{formattedAvgPkg}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-tight">
              Tuition Fee
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">{formattedMinFee}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-tight">
              Rating
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1">
              {hasRating ? (
                <>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {college.overallRating}
                </>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 font-bold">—</span>
              )}
            </span>
          </div>
        </div>

        {/* Course Tags */}
        {college.courses && college.courses.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
              Available Programs:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {college.courses.slice(0, 3).map((item: any) => (
                <span
                  key={item.id}
                  className="text-[11px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  {item.course?.code || item.course?.name}
                </span>
              ))}
              {college.courses.length > 3 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                  +{college.courses.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
        <Button
          variant={compared ? "secondary" : "outline"}
          size="sm"
          onClick={handleCompareClick}
          className={`text-xs rounded-lg ${compared ? "border-blue-300 text-blue-700 bg-blue-50/80" : ""}`}
        >
          {compared ? (
            <>
              <Check className="w-3.5 h-3.5 text-blue-600 mr-1" /> Added
            </>
          ) : (
            "+ Compare"
          )}
        </Button>

        <Link href={`/colleges/${college.slug}`}>
          <Button variant="primary" size="sm" className="text-xs rounded-lg shadow-sm">
            View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
