"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/colleges");
        router.refresh();
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Network error while creating account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-frame py-12 md:py-16 max-w-4xl mx-auto">
      <div className="glass-card rounded-3xl border border-slate-200/80 shadow-elevated overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Product Features Banner */}
        <div className="bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden">
          <div className="ambient-glow-purple top-0 left-0" />
          <div className="space-y-4 relative z-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-glow">
                C
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">CampusLens</span>
            </Link>

            <div className="pt-6 space-y-2">
              <h2 className="text-2xl font-extrabold text-white leading-snug">
                Join the Decision Intelligence Community
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Create a student profile to save top colleges, run custom rank predictions, and post questions in discussion forums.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Access to 40+ Ingested Institutions</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Side-by-Side College Decision Matrix</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Personal Saved Items & Comparison Dashboard</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 relative z-10 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Zero Spam & Privacy Protected</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-10 bg-white/90 dark:bg-slate-900/90 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Enter your details to register</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs p-3.5 rounded-xl border border-red-200 dark:border-red-800 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 letter & 1 number"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  minLength={8}
                  pattern="(?=.*[A-Za-z])(?=.*\d).+"
                  title="Password must be at least 8 characters and contain a letter and a number"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full rounded-xl shadow-md">
              Create Account <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
