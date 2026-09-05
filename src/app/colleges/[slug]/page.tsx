import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Building2, Star, Award, CheckCircle, ShieldCheck, ArrowLeft, Bookmark } from "lucide-react";
import { CollegeService } from "@/services/college.service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CollegeCard } from "@/components/college/CollegeCard";

export const revalidate = 60;

export default async function CollegeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await CollegeService.getCollegeBySlug(slug);

  if (!data) {
    notFound();
  }

  const similar = await CollegeService.getSimilarColleges(data.id, data.state, data.institutionType);

  return (
    <div className="app-frame py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link href="/colleges" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Discovery Directory
        </Link>
      </div>

      {/* College Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-subtle space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="blue" size="md">
                {data.institutionType.replace("_", " ")}
              </Badge>
              <Badge variant="slate" size="md">
                {data.ownership}
              </Badge>
              {data.nirfRank && (
                <Badge variant="amber" size="md" className="font-semibold">
                  <Award className="w-3.5 h-3.5 mr-1" />
                  NIRF Rank #{data.nirfRank}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {data.name}
            </h1>

            <div className="flex items-center gap-4 text-xs md:text-sm text-slate-600 flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                {data.city}, {data.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Building2 className="w-4 h-4 text-slate-400" />
                Est. {data.establishmentYear || "N/A"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {data.overallRating} / 5.0 ({data.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start">
            <Link href={`/compare?colleges=${data.id}`}>
              <Button variant="outline" size="md">
                + Compare
              </Button>
            </Link>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Avg Placement Package
            </span>
            <span className="text-lg md:text-xl font-extrabold text-slate-900">
              {data.avgPackage ? `₹${data.avgPackage} LPA` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Highest Package
            </span>
            <span className="text-lg md:text-xl font-extrabold text-blue-700">
              {data.highestPackage ? `₹${data.highestPackage} LPA` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Min Annual Tuition
            </span>
            <span className="text-lg md:text-xl font-extrabold text-slate-900">
              {data.minFee ? `₹${(data.minFee / 100000).toFixed(2)} L/yr` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Placement Rate
            </span>
            <span className="text-lg md:text-xl font-extrabold text-emerald-700">
              {data.placementRate ? `${data.placementRate}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Detailed Tabs Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Overview */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              Institution Overview
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {data.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
              <div className="bg-slate-50 p-3 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Affiliation</span>
                <span className="font-semibold text-slate-800">{data.affiliation || "Autonomous"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-medium">Accreditation</span>
                <span className="font-semibold text-slate-800">{data.accreditation || "UGC / AICTE Approved"}</span>
              </div>
            </div>
          </section>

          {/* Section 2: Courses & Fees */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              Programs & Annual Tuition Fees
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">Program Code</th>
                    <th className="p-3">Degree & Course Name</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Annual Fee</th>
                    <th className="p-3">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {data.courses.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-blue-700">{item.course.code}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">{item.course.name}</span>
                        <span className="text-[11px] text-slate-500">{item.course.degree}</span>
                      </td>
                      <td className="p-3 text-slate-600">{item.course.durationYears} Years</td>
                      <td className="p-3 font-bold text-slate-900">
                        {item.annualTuition ? `₹${item.annualTuition.toLocaleString()} / yr` : "N/A"}
                      </td>
                      <td className="p-3 text-slate-500 max-w-[200px] text-[11px]">
                        {item.eligibility || "Standard entrance qualifying examination"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Placements & Recruiters */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              Placement Statistics & Recruiters
            </h2>
            {data.placements && data.placements.length > 0 ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.placements.map((plc: any) => (
                  <div key={plc.id} className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Placement Batch: {plc.year}</span>
                      <span className="text-emerald-700 font-semibold">{plc.placementRate}% Placed</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-2">
                        Top Visiting Recruiters:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(plc.topRecruiters) &&
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          plc.topRecruiters.map((comp: any, idx: number) => (
                            <span
                              key={idx}
                              className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded border border-slate-200 font-medium"
                            >
                              {comp}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Official placement audit report pending for current academic session.</p>
            )}
          </section>

          {/* Section 4: Reviews & Ratings */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              Student Reviews & Experiences ({data.reviews.length})
            </h2>
            {data.reviews && data.reviews.length > 0 ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        {"★".repeat(rev.rating)}
                        <span className="text-slate-700 ml-1.5">{rev.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      — {rev.user?.name || "Verified Student"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No student reviews submitted yet. Be the first to review!</p>
            )}
          </section>
        </div>

        {/* Right Sidebar: Data Lineage & Similar Institutions */}
        <div className="space-y-6">
          {/* Data Provenance Card */}
          <Card className="bg-slate-50 border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Source & Data Lineage
            </div>
            <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
              <p>Source: {data.dataSource?.sourceName || "AISHE & NIRF 2024 Portal"}</p>
              <p>Dataset Version: {data.dataSource?.datasetVersion || "2024.1.0"}</p>
              <p>Retrieved At: {data.dataSource?.retrievedAt ? new Date(data.dataSource.retrievedAt).toLocaleDateString() : "2024"}</p>
            </div>
          </Card>

          {/* Similar Colleges Widget */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Similar Institutions</h3>
            <div className="space-y-4">
              {similar.map((simCol) => (
                <CollegeCard key={simCol.id} college={simCol} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
