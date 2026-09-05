"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MessageSquare, Plus, Search, Filter } from "lucide-react";
import { DiscussionCard } from "@/components/discussion/DiscussionCard";
import { DiscussionForm } from "@/components/discussion/DiscussionForm";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DiscussionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [discussions, setDiscussions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1, page: 1 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/discussions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDiscussions(data.discussions || []);
        setPagination(data.pagination || { total: 0, totalPages: 1, page: 1 });
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handlePostQuestion = async (title: string, body: string, collegeId?: string) => {
    const res = await fetch("/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, collegeId }),
    });

    if (res.ok) {
      setShowAskModal(false);
      fetchDiscussions();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Please sign in to post questions.");
    }
  };

  return (
    <div className="app-frame py-8 space-y-8">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" /> Community Q&A Board
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Student Discussions & Advice
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Browse peer discussions regarding cutoffs, faculty reviews, placement realities, and branch selection.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowAskModal(!showAskModal)}>
          <Plus className="w-4 h-4 mr-1.5" /> Ask a Question
        </Button>
      </div>

      {/* Ask Question Form Drawer */}
      {showAskModal && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <DiscussionForm onSubmit={handlePostQuestion} />
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search question titles, topics, or colleges..."
          className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
        />
      </div>

      {/* Discussions Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 w-full" />
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No discussions found</h3>
          <p className="text-xs text-slate-500">Be the first student to start a topic!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <DiscussionCard key={d.id} discussion={d} />
          ))}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
