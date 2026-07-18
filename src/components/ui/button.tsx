"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 ring-focus disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "shine-sweep bg-gradient-to-b from-primary-glow to-primary text-primary-foreground shadow-[0_0_0_1px_rgba(52,232,138,0.25),0_8px_24px_-8px_rgba(15,156,82,0.6)] hover:shadow-[0_0_0_1px_rgba(52,232,138,0.4),0_10px_28px_-6px_rgba(15,156,82,0.75)]",
        gold: "shine-sweep bg-gradient-to-b from-gold-bright via-gold to-gold-dim text-gold-foreground shadow-[0_8px_24px_-8px_rgba(217,182,97,0.6)] hover:shadow-[0_10px_28px_-6px_rgba(217,182,97,0.8)]",
        outline:
          "border border-border-strong bg-white/[0.02] text-foreground hover:bg-white/[0.06]",
        ghost: "text-foreground hover:bg-white/[0.06]",
        glass: "glass text-foreground hover:bg-white/[0.08]",
        destructive: "bg-danger text-white hover:bg-danger/90",
        link: "text-primary-glow underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
