"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full flex-1 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-700 ease-out",
          indicatorClassName
        )}
        style={{ width: `${value ?? 0}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
