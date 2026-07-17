"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast glass-strong group-[.toaster]:text-foreground group-[.toaster]:rounded-2xl group-[.toaster]:shadow-2xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
