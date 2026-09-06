"use client";

import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";

export interface FilterState {
  search: string;
  state: string;
  type: string;
  ownership: string;
  minRating: string;
  minPlacement: string;
  maxFee: string;
  course: string;
  sort: string;
}

export interface CollegeFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const INSTITUTION_TYPES = [
  { label: "IIT (Institute of National Importance)", value: "IIT" },
  { label: "NIT (National Institute of Technology)", value: "NIT" },
  { label: "IIIT (Information Technology Inst)", value: "IIIT" },
  { label: "Central University", value: "CENTRAL_UNIVERSITY" },
  { label: "State Public University", value: "STATE_UNIVERSITY" },
  { label: "Private University / Institute", value: "PRIVATE_UNIVERSITY" },
  { label: "Affiliated College (AISHE)", value: "AFFILIATED_COLLEGE" },
  { label: "Constituent / University College (AISHE)", value: "CONSTITUENT_COLLEGE" },
  { label: "Autonomous Institution", value: "AUTONOMOUS" },
];

export const CollegeFilters: React.FC<CollegeFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-subtle space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Filter Colleges
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Search Name or City
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="e.g. IIT Bombay, Mumbai..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* State Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">State</label>
        <select
          value={filters.state}
          onChange={(e) => onFilterChange("state", e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All States</option>
          {INDIAN_STATES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Institution Type Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Institution Type</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Types</option>
          {INSTITUTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Course Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Course / Specialization</label>
        <select
          value={filters.course}
          onChange={(e) => onFilterChange("course", e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Specializations</option>
          <option value="CSE">Computer Science & Engineering (CSE)</option>
          <option value="EE">Electrical Engineering (EE)</option>
          <option value="ECE">Electronics & Communication (ECE)</option>
          <option value="ME">Mechanical Engineering (ME)</option>
          <option value="AI">AI & Machine Learning</option>
        </select>
      </div>

      {/* Max Fee Filter Slider / Options */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Max Annual Tuition Fee
        </label>
        <select
          value={filters.maxFee}
          onChange={(e) => onFilterChange("maxFee", e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">Any Fee Range</option>
          <option value="50000">Under ₹50,000 / yr</option>
          <option value="200000">Under ₹2.0 Lakhs / yr</option>
          <option value="300000">Under ₹3.0 Lakhs / yr</option>
          <option value="600000">Under ₹6.0 Lakhs / yr</option>
        </select>
      </div>

      {/* Min Placement Average Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Min Placement Average (LPA)
        </label>
        <select
          value={filters.minPlacement}
          onChange={(e) => onFilterChange("minPlacement", e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">Any Package</option>
          <option value="10">10+ LPA Average</option>
          <option value="15">15+ LPA Average</option>
          <option value="20">20+ LPA Average</option>
          <option value="25">25+ LPA Average</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Minimum Rating</label>
        <select
          value={filters.minRating}
          onChange={(e) => onFilterChange("minRating", e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Ratings</option>
          <option value="4.5">★ 4.5 & Above</option>
          <option value="4.0">★ 4.0 & Above</option>
          <option value="3.5">★ 3.5 & Above</option>
        </select>
      </div>
    </aside>
  );
};
