"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, UserCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoEnabled, setDemoEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/demo-login")
      .then((r) => r.json())
      .then((d) => setDemoEnabled(Boolean(d?.enabled)))
      .catch(() => setDemoEnabled(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/colleges");
        router.refresh();
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch {
      setError("Network error while signing in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/colleges");
        router.refresh();
      } else {
        setError(data.error || "Demo login failed.");
      }
    } catch {
      setError("Network error during demo sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-frame py-12 md:py-16 max-w-4xl mx-auto">
      <div className="glass-card rounded-3xl border border-slate-200/80 shadow-elevated overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Brand Highlight Banner */}
        <div className="bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden">
          <div className="ambient-glow-blue top-0 left-0" />
          <div className="space-y-4 relative z-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-glow">
                C
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">CampusLens</span>
            </Link>

            <div className="pt-6 space-y-2">
              <h2 className="text-2xl font-extrabold text-white leading-snug">
                Data-Driven Decision Intelligence
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Sign in to save colleges to your dashboard, build custom comparison matrices, and participate in peer discussions.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saved Colleges & Custom Comparison Setup</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Entrance Rank Predictor Engine</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Peer Q&A & Community Discussion</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 relative z-10 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Secure HTTP-Only JWT Cookie Authentication</span>
          </div>
        </div>

        {/* Right Side: Form & Quick Demo Logins */}
        <div className="p-8 md:p-10 bg-white/90 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-slate-500 text-xs">Enter your registered email and password</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campuslens.edu"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full rounded-xl shadow-md">
              Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* 1-Click Quick Demo Sign In Buttons (only shown when demo accounts are enabled server-side) */}
          {demoEnabled && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block text-center">
                1-Click Demo Evaluation Sign In:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleDemoLogin("student@campuslens.edu")}
                  className="text-xs bg-white hover:bg-slate-100 rounded-lg"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" /> Demo Student
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleDemoLogin("admin@campuslens.edu")}
                  className="text-xs bg-white hover:bg-slate-100 rounded-lg"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" /> Demo Admin
                </Button>
              </div>
            </div>
          )}

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
