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
          "bg-white rounded-lg border border-slate-200 shadow-subtle p-5",
          hoverable && "transition-shadow duration-200 hover:shadow-card hover:border-slate-300",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
