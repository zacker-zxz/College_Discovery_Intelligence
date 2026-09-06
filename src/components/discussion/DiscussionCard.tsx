"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Eye, Clock, User as UserIcon, Building2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface DiscussionCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  discussion: any;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({ discussion }) => {
  const { id, title, body, user, college, views, _count, createdAt } = discussion;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card hoverable className="border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          {college && (
            <Badge variant="blue" size="sm" className="mb-1">
              <Building2 className="w-3 h-3 mr-1" />
              {college.shortName || college.name}
            </Badge>
          )}

          <Link
            href={`/discussions/${id}`}
            className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
          >
            {title}
          </Link>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{body}</p>

          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-400 pt-2">
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <UserIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {user?.name || "Student User"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex flex-col items-end justify-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded border border-slate-100 dark:border-slate-700 min-w-[90px] text-center">
          <div className="text-center">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">
              {_count?.answers || 0}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3" /> Answers
            </span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-700 w-full justify-center">
            <Eye className="w-3 h-3" /> {views} views
          </div>
        </div>
      </div>
    </Card>
  );
};
