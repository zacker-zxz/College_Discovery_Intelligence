import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-subtle p-5",
          hoverable && "transition-all duration-200 hover:shadow-card hover:border-slate-300 dark:hover:border-slate-700",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
