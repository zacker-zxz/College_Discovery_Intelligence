import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "slate" | "blue" | "green" | "amber" | "red" | "purple" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "slate",
  size = "md",
  children,
  ...props
}) => {
  const base = "inline-flex items-center font-medium rounded border tracking-tight";
  
  const variants = {
    slate: "bg-slate-100 text-slate-800 border-slate-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    red: "bg-red-50 text-red-800 border-red-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    outline: "bg-transparent text-slate-700 border-slate-300",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
