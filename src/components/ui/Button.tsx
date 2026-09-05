import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-md";

    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-700 active:bg-slate-950 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-300 active:bg-slate-300 border border-slate-200",
      outline: "bg-transparent text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-200 hover:text-slate-900",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4 mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
