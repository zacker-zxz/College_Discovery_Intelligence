"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, GitCompare, Sparkles, MessageSquare, Bookmark, Menu, X, LogOut, Search, ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/colleges", label: "Colleges", icon: Compass },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/predictor", label: "Rank Predictor", icon: Sparkles },
    { href: "/discussions", label: "Discussions", icon: MessageSquare },
    { href: "/saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="app-frame flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg shadow-sm group-hover:bg-blue-600 transition-colors">
              C
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Live Database Active" />
          </div>
          <div className="shrink-0">
            <span className="block font-extrabold text-slate-900 text-lg leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
              CampusLens
            </span>
            <span className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-blue-600 tracking-wide leading-[1.4]">
              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
              Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Framer Motion active pill indicator */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-xl border border-slate-200/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-subtle border border-slate-200/80"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Actions / User Profile */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Quick Search Shortcut Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <kbd className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-300 text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-subtle hover:border-slate-300 transition-all text-xs font-semibold text-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                  {user.name.charAt(0)}
                </div>
                <span>{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 glass-dropdown rounded-xl p-2 z-50 space-y-1 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900 block truncate">{user.name}</span>
                      <span className="text-[11px] text-slate-500 truncate block">{user.email}</span>
                      <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        Role: {user.role}
                      </span>
                    </div>

                    <Link
                      href="/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 font-medium text-slate-700 hover:bg-slate-100/80 rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-blue-600" /> My Saved Items
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm" className="shadow-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Quick Search Overlay Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
              className="bg-white rounded-xl border border-slate-200 shadow-elevated w-full max-w-lg p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Search</span>
                <button type="button" onClick={() => setIsSearchOpen(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                  ESC
                </button>
              </div>
              <SearchAutocomplete
                size="md"
                autoFocus
                placeholder="Type college name, city, or type (e.g. IIT Bombay, VIT, NIT)..."
                onNavigate={() => setIsSearchOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-200 glass-dropdown px-4 pt-3 pb-5 space-y-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Icon className="w-4 h-4 text-blue-600" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-900">{user.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Link href="/login" className="w-1/2" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-1/2" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
