"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AccessDeniedNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("accesso_negato") === "1") {
      toast.error("Accesso riservato all'area organizzatore", {
        description: "Il tuo account non ha i permessi per accedere al pannello di gestione.",
      });
      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}
