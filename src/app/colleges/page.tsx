"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CollegeCard } from "@/components/college/CollegeCard";
import { CollegeFilters, FilterState } from "@/components/college/CollegeFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Compass, GitCompare, ArrowUpDown } from "lucide-react";
import Link from "next/link";

function CollegeDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "",
    type: searchParams.get("type") || "",
    ownership: searchParams.get("ownership") || "",
    minRating: searchParams.get("minRating") || "",
    minPlacement: searchParams.get("minPlacement") || "",
    maxFee: searchParams.get("maxFee") || "",
    course: searchParams.get("course") || "",
    sort: searchParams.get("sort") || "relevance",
  });

  const [page, setPage] = useState<number>(parseInt(searchParams.get("page") || "1", 10));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [colleges, setColleges] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, page: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected colleges for compare tray
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  const fetchColleges = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.state) params.set("state", filters.state);
    if (filters.type) params.set("type", filters.type);
    if (filters.ownership) params.set("ownership", filters.ownership);
    if (filters.minRating) params.set("minRating", filters.minRating);
    if (filters.minPlacement) params.set("minPlacement", filters.minPlacement);
    if (filters.maxFee) params.set("maxFee", filters.maxFee);
    if (filters.course) params.set("course", filters.course);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", page.toString());
    params.set("limit", "9");

    // Sync URL without full page reload
    router.replace(`/colleges?${params.toString()}`, { scroll: false });

    try {
      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setColleges(data.colleges || []);
        setPagination(data.pagination || { total: 0, totalPages: 1, page: 1 });
      }
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, router]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      state: "",
      type: "",
      ownership: "",
      minRating: "",
      minPlacement: "",
      maxFee: "",
      course: "",
      sort: "relevance",
    });
    setPage(1);
  };

  const handleToggleCompare = (collegeId: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(collegeId)) {
        return prev.filter((id) => id !== collegeId);
      } else {
        if (prev.length >= 3) {
          alert("You can compare a maximum of 3 colleges simultaneously.");
          return prev;
        }
        return [...prev, collegeId];
      }
    });
  };

  return (
    <div className="app-frame py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" /> Discovery Directory
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Higher Education Search Engine
          </h1>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort By:
          </span>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white font-medium"
          >
            <option value="relevance">NIRF Rank & Rating</option>
            <option value="rating">Highest Rating</option>
            <option value="placement">Highest Avg Placement</option>
            <option value="fee_asc">Tuition Fee: Low to High</option>
            <option value="fee_desc">Tuition Fee: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <CollegeFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Search Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span>
              Showing <strong className="text-slate-900">{colleges.length}</strong> of{" "}
              <strong className="text-slate-900">{pagination.total}</strong> colleges matching filters
            </span>
            {selectedCompareIds.length > 0 && (
              <span className="font-semibold text-blue-600">
                {selectedCompareIds.length} college(s) queued for comparison
              </span>
            )}
          </div>

          {/* College Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white p-5 rounded-lg border border-slate-200 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-4">
              <Compass className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No institutions match your search filters</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Try widening your fee range, removing state restrictions, or clearing active search keywords.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {colleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  isComparedInitial={selectedCompareIds.includes(college.id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Floating Compare Action Tray */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-elevated border border-slate-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <span className="font-bold text-sm block">Compare Colleges</span>
            <span className="text-xs text-slate-300">{selectedCompareIds.length} of 3 selected</span>
          </div>
          <Link href={`/compare?colleges=${selectedCompareIds.join(",")}`}>
            <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
              <GitCompare className="w-4 h-4 mr-1.5" /> Launch Comparison
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CollegeDiscoveryPage() {
  return (
    <Suspense fallback={<div className="app-frame py-12"><Skeleton className="h-64 w-full" /></div>}>
      <CollegeDiscoveryContent />
    </Suspense>
  );
}
