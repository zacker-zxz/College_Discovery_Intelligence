import React from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
      <p className="text-xs text-slate-500">
        Page <span className="font-medium text-slate-800">{currentPage}</span> of{" "}
        <span className="font-medium text-slate-800">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs font-medium rounded-md transition-colors ${
              p === currentPage
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {p}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
