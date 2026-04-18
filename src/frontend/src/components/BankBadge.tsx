import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold tabular-nums",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-primary/20 text-primary border border-primary/30",
        warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        danger:
          "bg-destructive/20 text-destructive border border-destructive/30",
        muted: "bg-muted text-muted-foreground",
        outline: "border border-border text-foreground bg-transparent",
      },
      size: {
        sm: "h-4 min-w-4 px-1 text-[10px]",
        md: "h-5 min-w-5 px-1.5 text-xs",
        lg: "h-6 min-w-6 px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  count?: number;
  max?: number;
}

export function Badge({
  className,
  variant,
  size,
  count,
  max = 99,
  children,
  ...props
}: BadgeProps) {
  const display =
    count !== undefined
      ? count > max
        ? `${max}+`
        : count.toString()
      : children;

  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {display}
    </span>
  );
}

export { badgeVariants };
