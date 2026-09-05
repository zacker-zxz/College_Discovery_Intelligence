"use client";

import React, { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface DiscussionFormProps {
  onSubmit: (title: string, body: string, collegeId?: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colleges?: any[];
}

export const DiscussionForm: React.FC<DiscussionFormProps> = ({ onSubmit, colleges }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await onSubmit(title.trim(), body.trim(), collegeId || undefined);
      setTitle("");
      setBody("");
      setCollegeId("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900 text-base">Ask the Campus Community</h3>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Question Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. How are placements for CSE at NIT Trichy compared to IIIT Hyderabad?"
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          required
        />
      </div>

      {colleges && colleges.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Related Institution (Optional)
          </label>
          <select
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="">General Admission Question</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Detailed Description / Context <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Provide rank, preferences, branches, or specific doubts..."
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white leading-relaxed"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
          <Send className="w-4 h-4 mr-1.5" /> Post Question
        </Button>
      </div>
    </form>
  );
};
