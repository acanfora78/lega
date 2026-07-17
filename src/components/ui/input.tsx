import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-border-strong bg-white/[0.03] px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors outline-none focus:border-primary-glow/50 focus:bg-white/[0.05] ring-focus disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
