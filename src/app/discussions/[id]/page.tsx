"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Send, Clock, User as UserIcon, Building2, CheckCircle } from "lucide-react";
import { DiscussionService } from "@/services/discussion.service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [discussion, setDiscussion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Post answer state
  const [answerBody, setAnswerBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchThread = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/discussions/${id}`);
      const data = await res.json();
      if (res.ok) {
        setDiscussion(data.discussion);
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerBody.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/discussions/${id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: answerBody.trim() }),
      });

      if (res.ok) {
        setAnswerBody("");
        fetchThread();
      } else {
        const err = await res.json();
        setError(err.error || "Please sign in to answer questions.");
      }
    } catch {
      setError("Failed to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-frame py-12 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="app-frame py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Discussion Thread Not Found</h2>
        <Link href="/discussions" className="text-xs text-blue-600 underline mt-2 block">
          Return to Discussion Board
        </Link>
      </div>
    );
  }

  return (
    <div className="app-frame py-8 max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link href="/discussions" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Discussions
      </Link>

      {/* Main Question Card */}
      <Card className="bg-white border-slate-200 p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {discussion.college && (
              <Badge variant="blue" size="sm">
                <Building2 className="w-3 h-3 mr-1" />
                {discussion.college.shortName || discussion.college.name}
              </Badge>
            )}
            <span className="text-xs text-slate-400">Question ID: #{discussion.id.slice(0, 8)}</span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(discussion.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
          {discussion.title}
        </h1>

        <div className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100">
          {discussion.body}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-slate-400" />
            Posted by: {discussion.user?.name || "Student"}
          </span>
          <span>{discussion.views} total views</span>
        </div>
      </Card>

      {/* Answers List Section */}
      <div className="space-y-6">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Community Answers ({discussion.answers?.length || 0})
        </h3>

        {discussion.answers && discussion.answers.length > 0 ? (
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {discussion.answers.map((ans: any) => (
              <Card key={ans.id} className="bg-white border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{ans.user?.name || "Verified Student"}</span>
                    {ans.user?.role === "ADMIN" && (
                      <Badge variant="green" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" /> Official Educator Response
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{new Date(ans.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{ans.body}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
            No answers posted yet. Be the first to help answer this question below!
          </div>
        )}
      </div>

      {/* Submit Answer Form */}
      <Card className="bg-white border-slate-200 p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Submit Your Answer</h4>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handlePostAnswer} className="space-y-4">
          <textarea
            rows={4}
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            placeholder="Share your personal experience, advice, or verified data regarding this query..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            required
          />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-1.5" /> Submit Answer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
