"use client";

import React, { useState } from "react";
import { Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface PredictorFormData {
  exam: string;
  rank: number;
  category: string;
  state?: string;
}

export interface PredictorFormProps {
  onSubmit: (data: PredictorFormData) => void;
  isLoading?: boolean;
}

export const PredictorForm: React.FC<PredictorFormProps> = ({ onSubmit, isLoading }) => {
  const [exam, setExam] = useState("JEE_MAIN");
  const [rank, setRank] = useState<string>("15000");
  const [category, setCategory] = useState("GENERAL");
  const [state, setState] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericRank = parseInt(rank, 10);
    if (isNaN(numericRank) || numericRank <= 0) return;
    onSubmit({ exam, rank: numericRank, category, state });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <div>
          <h2 className="font-bold text-slate-900 text-base">Admission Predictor Parameters</h2>
          <p className="text-slate-500 text-xs">Enter your entrance examination details & All India rank</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Entrance Exam Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Entrance Examination <span className="text-red-500">*</span>
          </label>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="JEE_MAIN">JEE Main (National Engineering)</option>
            <option value="JEE_ADVANCED">JEE Advanced (IITs)</option>
            <option value="NEET">NEET UG (Medical/Science)</option>
            <option value="MHT_CET">MHT-CET (Maharashtra)</option>
            <option value="WBJEE">WBJEE (West Bengal)</option>
          </select>
        </div>

        {/* Rank Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            All India / State Rank <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="1000000"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="e.g. 18450"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white font-mono"
            required
          />
        </div>

        {/* Reservation Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reservation Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="GENERAL">General / Open (GEN)</option>
            <option value="OBC">OBC-NCL</option>
            <option value="EWS">Economically Weaker Section (EWS)</option>
            <option value="SC">Scheduled Caste (SC)</option>
            <option value="ST">Scheduled Tribe (ST)</option>
          </select>
        </div>

        {/* Preferred State (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Home State Quota (Optional)
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="">All India Quota (All States)</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full md:w-auto">
          <Search className="w-4 h-4 mr-1.5" /> Evaluate Predictor Engine
        </Button>
      </div>
    </form>
  );
};
