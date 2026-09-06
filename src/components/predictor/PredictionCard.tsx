"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, HelpCircle, MapPin, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PredictionMatch } from "@/services/predictor.service";

export interface PredictionCardProps {
  prediction: PredictionMatch;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  const { matchTier, matchScore, rationale, college, course, cutoffInfo } = prediction;

  const tierBadges = {
    STRONG: { label: "Strong Match", variant: "green" as const, icon: CheckCircle2 },
    POSSIBLE: { label: "Possible Match", variant: "amber" as const, icon: AlertCircle },
    REACH: { label: "Target / Reach", variant: "blue" as const, icon: HelpCircle },
  };

  const currentTier = tierBadges[matchTier];
  const Icon = currentTier.icon;

  return (
    <Card hoverable className="border-slate-200 dark:border-slate-800 flex flex-col justify-between">
      <div>
        {/* Tier Badge & Score Row */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant={currentTier.variant} size="md" className="font-semibold px-2.5 py-1">
            <Icon className="w-3.5 h-3.5 mr-1" />
            {currentTier.label}
          </Badge>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Score: {matchScore}%
          </span>
        </div>

        {/* Institution & Program Name */}
        <div className="mb-2">
          <Link
            href={`/colleges/${college.slug}`}
            className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
          >
            {college.name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {college.city}, {college.state}
            </span>
            <span>•</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{college.institutionType}</span>
          </div>
        </div>

        {/* Course Info */}
        {course && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-100 dark:border-slate-800 mb-3 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 block uppercase font-medium">Program</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {course.name} ({course.degree})
            </span>
          </div>
        )}

        {/* Explainable Rationale */}
        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/40 p-3 rounded border border-slate-100 dark:border-slate-800 leading-relaxed mb-4">
          {rationale}
        </p>

        {/* Cutoff Historic Range */}
        <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 mb-2">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 block uppercase">Historical Range</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {cutoffInfo.openingRank.toLocaleString()} – {cutoffInfo.closingRank.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 block uppercase">Avg Placement</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {college.avgPackage ? `₹${college.avgPackage} LPA` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 dark:text-slate-400">Quota: {cutoffInfo.quota}</span>
        <Link
          href={`/colleges/${college.slug}`}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
        >
          Explore College <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
