"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pattern raccomandato da next-themes per evitare mismatch di idratazione
    setMounted(true);
  }, []);

  const isDark = mounted ? theme !== "light" : true;

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="dark-mode" className="flex items-center gap-2.5 text-sm">
        {isDark ? <Moon className="size-4 text-primary-glow" /> : <Sun className="size-4 text-gold-bright" />}
        Dark Mode
      </Label>
      <Switch id="dark-mode" checked={isDark} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
    </div>
  );
}
