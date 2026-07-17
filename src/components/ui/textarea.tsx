import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-border-strong bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors outline-none focus:border-primary-glow/50 focus:bg-white/[0.05] ring-focus disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
