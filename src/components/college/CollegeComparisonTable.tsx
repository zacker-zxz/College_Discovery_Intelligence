"use client";

import React from "react";
import Link from "next/link";
import { MapPin, CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ComparisonTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colleges: any[];
  onRemoveCollege: (id: string) => void;
}

export const CollegeComparisonTable: React.FC<ComparisonTableProps> = ({
  colleges,
  onRemoveCollege,
}) => {
  if (!colleges || colleges.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 w-48 font-bold text-slate-900 dark:text-slate-100 text-sm bg-slate-100/80 dark:bg-slate-800 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-700">
                Metric / Dimension
              </th>
              {colleges.map((col) => (
                <th key={col.id} className="p-4 min-w-[260px] max-w-[320px] align-top border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="blue" size="sm">
                      {col.institutionType.replace("_", " ")}
                    </Badge>
                    <button
                      onClick={() => onRemoveCollege(col.id)}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Remove from comparison"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug mb-1">
                    {col.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {col.city}, {col.state}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* Row 1: NIRF Ranking */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                NIRF Rank
              </td>
              {colleges.map((col) => (
                <td key={col.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  {col.nirfRank ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">#{col.nirfRank}</span>
                      {col.highlights?.isBestRanked && (
                        <Badge variant="green" size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" /> Top Ranked
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Unranked</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 2: Average Package */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                Avg Placement Package
              </td>
              {colleges.map((col) => (
                <td key={col.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  {col.avgPackage ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-700 dark:text-blue-400 text-base">
                          ₹{col.avgPackage} LPA
                        </span>
                        {col.highlights?.isHighestAvgPackage && (
                          <Badge variant="green" size="sm">
                            Highest Package
                          </Badge>
                        )}
                      </div>
                      {col.highestPackage && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Highest: ₹{col.highestPackage} LPA
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Data Unavailable</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 3: Tuition Fees */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                Annual Tuition Fee
              </td>
              {colleges.map((col) => (
                <td key={col.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  {col.minFee ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          ₹{(col.minFee / 100000).toFixed(2)} Lakhs / yr
                        </span>
                        {col.highlights?.isLowestFee && (
                          <Badge variant="green" size="sm">
                            Best Value
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Data Unavailable</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 4: Student Rating */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                Student Rating
              </td>
              {colleges.map((col) => (
                <td key={col.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      ★ {col.overallRating} / 5.0
                    </span>
                    {col.highlights?.isTopRated && (
                      <Badge variant="green" size="sm">
                        Top Rated
                      </Badge>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 5: Ownership & Affiliation */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                Ownership & Type
              </td>
              {colleges.map((col) => (
                <td key={col.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{col.ownership}</span>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-0.5">{col.institutionType}</span>
                </td>
              ))}
            </tr>

            {/* Row 6: Key Specializations */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <td className="p-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-900/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800">
                Key Specializations
              </td>
              {colleges.map((col) => (
                <td key={col.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <div className="flex flex-wrap gap-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {col.courses?.map((cItem: any) => (
                      <Badge key={cItem.code} variant="slate" size="sm">
                        {cItem.code}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 7: Action Links */}
            <tr>
              <td className="p-4 bg-slate-50/80 dark:bg-slate-900/90 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800"></td>
              {colleges.map((col) => (
                <td key={col.id} className="p-4 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <Link href={`/colleges/${col.slug}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Full Profile <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
