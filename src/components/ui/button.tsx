import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils.ts";

const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/30 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent/90",
        secondary: "bg-raised text-fg ring-1 ring-line hover:bg-surface",
        ghost: "text-muted hover:bg-raised hover:text-fg",
        danger: "bg-bad text-bg hover:bg-bad/90",
      },
      size: {
        md: "h-11 px-4",
        sm: "h-9 px-3 text-sm",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
