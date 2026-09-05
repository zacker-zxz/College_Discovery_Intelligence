"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, GitCompare, Trash2, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { CollegeCard } from "@/components/college/CollegeCard";

export default function SavedItemsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedColleges, setSavedColleges] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedComparisons, setSavedComparisons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"colleges" | "comparisons">("colleges");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [colRes, compRes] = await Promise.all([
        fetch("/api/me/saved-colleges"),
        fetch("/api/me/saved-comparisons"),
      ]);

      if (colRes.ok) {
        const colData = await colRes.json();
        setSavedColleges(colData.savedColleges || []);
      }
      if (compRes.ok) {
        const compData = await compRes.json();
        setSavedComparisons(compData.savedComparisons || []);
      }
    } catch {
      // handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveSavedCollege = async (savedId: string) => {
    const res = await fetch(`/api/me/saved-colleges/${savedId}`, { method: "DELETE" });
    if (res.ok) {
      setSavedColleges((prev) => prev.filter((item) => item.id !== savedId));
    }
  };

  return (
    <div className="app-frame py-8 space-y-8">
      {/* Banner */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Bookmark className="w-4 h-4" /> Account Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Saved Institutions & Decision Matrixes
        </h1>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab("colleges")}
          className={`pb-3 px-2 border-b-2 font-bold transition-colors ${
            activeTab === "colleges"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Saved Colleges ({savedColleges.length})
        </button>
        <button
          onClick={() => setActiveTab("comparisons")}
          className={`pb-3 px-2 border-b-2 font-bold transition-colors ${
            activeTab === "comparisons"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Saved Comparisons ({savedComparisons.length})
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : activeTab === "colleges" ? (
        savedColleges.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No saved colleges yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save colleges while exploring the directory to access them anytime in your profile dashboard.
            </p>
            <Link href="/colleges">
              <Button variant="outline" size="sm">
                Explore Colleges Directory
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedColleges.map((item) => (
              <div key={item.id} className="relative group">
                <CollegeCard college={item.college} isSavedInitial={true} />
                <button
                  onClick={() => handleRemoveSavedCollege(item.id)}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 text-slate-400 hover:text-red-600 rounded border border-slate-200 shadow-xs z-10"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : savedComparisons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No saved comparisons</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Build custom side-by-side matrices on the Compare page and save them for future review.
          </p>
          <Link href="/compare">
            <Button variant="outline" size="sm">
              Create Comparison Matrix
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedComparisons.map((comp) => (
            <Card key={comp.id} className="bg-white border-slate-200 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{comp.name}</h3>
                  <span className="text-[11px] text-slate-400">
                    Saved on {new Date(comp.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {comp.collegeIds?.length || 0} Colleges
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">ID Matrix: #{comp.id.slice(0, 8)}</span>
                <Link href={`/compare?colleges=${comp.collegeIds.join(",")}`}>
                  <Button variant="primary" size="sm">
                    Re-open Comparison <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
