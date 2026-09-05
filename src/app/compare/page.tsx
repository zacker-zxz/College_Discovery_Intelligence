"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { GitCompare, Search, Plus, Bookmark, AlertCircle } from "lucide-react";
import { CollegeComparisonTable } from "@/components/college/CollegeComparisonTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comparisonMatrix, setComparisonMatrix] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Search selector state
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Save comparison state
  const [saveName, setSaveName] = useState("");
  const [isSavingComp, setIsSavingComp] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initial load from URL search params
  useEffect(() => {
    const rawColleges = searchParams.get("colleges");
    if (rawColleges) {
      const ids = rawColleges.split(",").filter(Boolean).slice(0, 3);
      setSelectedIds(ids);
    }
  }, [searchParams]);

  const fetchComparison = useCallback(async (ids: string[]) => {
    if (ids.length < 2) {
      setComparisonMatrix([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeIds: ids }),
      });

      const data = await res.json();
      if (res.ok) {
        setComparisonMatrix(data.comparison || []);
      } else {
        setError(data.error || "Failed to load comparison data");
      }
    } catch {
      setError("Network error while calculating comparison matrix");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedIds.length >= 2) {
      fetchComparison(selectedIds);
      router.replace(`/compare?colleges=${selectedIds.join(",")}`, { scroll: false });
    } else {
      setComparisonMatrix([]);
    }
  }, [selectedIds, fetchComparison, router]);

  // Handle Search for college selector
  const handleSearchColleges = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/colleges?search=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.colleges || []);
      }
    } catch {
      // Non-critical: dropdown simply shows no results on failure
    }
  };

  const handleAddCollege = (collegeId: string) => {
    if (selectedIds.includes(collegeId)) return;
    if (selectedIds.length >= 3) {
      alert("Maximum 3 colleges allowed in side-by-side matrix.");
      return;
    }
    const next = [...selectedIds, collegeId];
    setSelectedIds(next);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveCollege = (collegeId: string) => {
    const next = selectedIds.filter((id) => id !== collegeId);
    setSelectedIds(next);
    const newUrl = next.length > 0 ? `/compare?colleges=${next.join(",")}` : "/compare";
    router.replace(newUrl, { scroll: false });
  };

  const handleSaveComparison = async () => {
    if (!saveName.trim() || selectedIds.length < 2) return;
    setIsSavingComp(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/me/saved-comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saveName.trim(), collegeIds: selectedIds }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setSaveName("");
      } else {
        const err = await res.json();
        alert(err.error || "Please sign in to save comparisons.");
      }
    } catch {
      alert("Failed to save comparison.");
    } finally {
      setIsSavingComp(false);
    }
  };

  return (
    <div className="app-frame py-8 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" /> Decision Support Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Side-by-Side College Comparison Matrix
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Select 2 to 3 institutions to evaluate tuition fees, placement averages, and ratings side-by-side.
          </p>
        </div>

        {/* Save comparison form */}
        {selectedIds.length >= 2 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-slate-200 shadow-xs">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Comparison title (e.g. Top IITs CSE)"
              className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none bg-slate-50 w-44"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveComparison}
              isLoading={isSavingComp}
              disabled={!saveName.trim()}
            >
              <Bookmark className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
            {saveSuccess && <span className="text-[11px] font-bold text-emerald-600">Saved!</span>}
          </div>
        )}
      </div>

      {/* College Selector Bar */}
      <Card className="bg-white border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Selected Colleges ({selectedIds.length} of 3)</span>
          {selectedIds.length < 2 && (
            <span className="text-xs text-amber-700 font-normal flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Add at least 2 colleges to compare
            </span>
          )}
        </h3>

        {/* Selected Badges Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {comparisonMatrix.map((col) => (
            <div
              key={col.id}
              className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-900"
            >
              <span>{col.name}</span>
              <button
                onClick={() => handleRemoveCollege(col.id)}
                className="text-slate-400 hover:text-red-600 font-bold ml-1"
              >
                ×
              </button>
            </div>
          ))}

          {selectedIds.length < 3 && (
            <div className="relative flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchColleges(e.target.value)}
                  placeholder="Type college name to add (e.g. BITS Pilani, NIT Trichy)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50"
                />
              </div>

              {/* Dropdown search results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-white border border-slate-200 rounded-md shadow-elevated mt-1 overflow-hidden divide-y divide-slate-100">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddCollege(item.id)}
                      disabled={selectedIds.includes(item.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between disabled:opacity-40"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[11px] text-slate-500">{item.city}, {item.state} • {item.institutionType}</span>
                      </div>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Main Comparison Matrix Display */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 text-xs font-medium">
          {error}
        </div>
      ) : comparisonMatrix.length >= 2 ? (
        <CollegeComparisonTable
          colleges={comparisonMatrix}
          onRemoveCollege={handleRemoveCollege}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Select Colleges to Compare</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the search box above or browse the <Link href="/colleges" className="text-blue-600 underline">Colleges Directory</Link> to queue institutions into your decision matrix.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="app-frame py-12"><Skeleton className="h-64 w-full" /></div>}>
      <CompareContent />
    </Suspense>
  );
}
