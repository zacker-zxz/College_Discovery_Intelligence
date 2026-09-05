"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Award, Building2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
  slug: string;
  name: string;
  shortName: string | null;
  city: string;
  state: string;
  institutionType: string;
  ownership: string;
  nirfRank: number | null;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: "lg" | "md";
  onNavigate?: () => void;
  autoFocus?: boolean;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  placeholder = "Search college name, city, or type...",
  className = "",
  inputClassName = "",
  size = "lg",
  onNavigate,
  autoFocus = false,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/colleges/suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setIsOpen(data.suggestions?.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    if (onNavigate) onNavigate();
    router.push(`/colleges/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex].slug);
    } else if (query.trim()) {
      setIsOpen(false);
      if (onNavigate) onNavigate();
      router.push(`/colleges?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const sizeClasses = size === "lg"
    ? "py-3.5 px-4 text-sm"
    : "py-2.5 px-3 text-xs";

  const ownershipColor = (ownership: string) =>
    ownership === "PUBLIC" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-violet-50 text-violet-700 border-violet-200";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 ${size === "lg" ? "w-5 h-5" : "w-4 h-4"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full ${sizeClasses} pl-12 pr-4 font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none ${inputClassName}`}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </form>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-elevated z-50 overflow-hidden max-h-[420px] overflow-y-auto"
          >
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {suggestions.length} Match{suggestions.length !== 1 ? "es" : ""} Found
              </span>
            </div>
            {suggestions.map((s, i) => (
              <motion.button
                key={s.slug}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleSelect(s.slug)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-b-0 group/item ${
                  activeIndex === i ? "bg-blue-50/80" : "hover:bg-slate-50"
                }`}
              >
                {/* College Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                  activeIndex === i ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                } transition-colors`}>
                  {s.shortName?.charAt(0) || s.name.charAt(0)}
                </div>

                {/* College Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate group-hover/item:text-blue-700 transition-colors">
                    {s.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" /> {s.city}, {s.state}
                    </span>
                    {s.nirfRank && (
                      <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                        <Award className="w-3 h-3" /> #{s.nirfRank}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${ownershipColor(s.ownership)}`}>
                    <Building2 className="w-3 h-3 inline mr-0.5" />
                    {s.ownership === "PUBLIC" ? "Govt" : "Pvt"}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-opacity ${activeIndex === i ? "text-blue-600 opacity-100" : "opacity-0"}`} />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
