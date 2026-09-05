"use client";

import React, { useState } from "react";
import { Sparkles, Award, CheckCircle2, AlertCircle, HelpCircle, Filter } from "lucide-react";
import { PredictorForm, PredictorFormData } from "@/components/predictor/PredictorForm";
import { PredictionCard } from "@/components/predictor/PredictionCard";
import { PredictionMatch } from "@/services/predictor.service";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PredictorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<{
    strongMatches: PredictionMatch[];
    possibleMatches: PredictionMatch[];
    reachMatches: PredictionMatch[];
    totalEvaluated: number;
  } | null>(null);

  const [activeTier, setActiveTier] = useState<"ALL" | "STRONG" | "POSSIBLE" | "REACH">("ALL");

  const handlePredict = async (data: PredictorFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        setPredictions(result);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredMatches = () => {
    if (!predictions) return [];
    if (activeTier === "STRONG") return predictions.strongMatches;
    if (activeTier === "POSSIBLE") return predictions.possibleMatches;
    if (activeTier === "REACH") return predictions.reachMatches;
    return [
      ...predictions.strongMatches,
      ...predictions.possibleMatches,
      ...predictions.reachMatches,
    ];
  };

  const filteredMatches = getFilteredMatches();

  return (
    <div className="app-frame py-8 space-y-8">
      {/* Banner */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" /> Algorithmic Recommendation Engine
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          College Admission Rank Predictor
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Evaluate historical admission cutoff databases to estimate admission probability across top Indian institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <PredictorForm onSubmit={handlePredict} isLoading={isLoading} />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          ) : predictions ? (
            <div className="space-y-6">
              {/* Match Summary Bar & Filter Tabs */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Evaluated {predictions.totalEvaluated} Cutoff Records
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Total Matches: {filteredMatches.length}
                  </span>
                </div>

                {/* Tier Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100 text-xs font-medium">
                  <button
                    onClick={() => setActiveTier("ALL")}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeTier === "ALL"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All Matches ({predictions.strongMatches.length + predictions.possibleMatches.length + predictions.reachMatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTier("STRONG")}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      activeTier === "STRONG"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strong ({predictions.strongMatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTier("POSSIBLE")}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      activeTier === "POSSIBLE"
                        ? "bg-amber-700 text-white"
                        : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Possible ({predictions.possibleMatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTier("REACH")}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      activeTier === "REACH"
                        ? "bg-blue-700 text-white"
                        : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Target / Reach ({predictions.reachMatches.length})
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              {filteredMatches.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-xs text-slate-500">
                  No prediction matches in this category tier for your entered rank.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredMatches.map((item, index) => (
                    <PredictionCard key={index} prediction={item} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Enter Your Entrance Details</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Fill out the predictor form on the left to run our deterministic matching algorithm against official historic JoSAA & State cutoffs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
