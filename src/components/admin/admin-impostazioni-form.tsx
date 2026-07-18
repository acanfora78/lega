"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { ImpostazioniLega } from "@/lib/store/file-store";

export function AdminImpostazioniForm({ impostazioni }: { impostazioni: ImpostazioniLega }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(impostazioni);

  async function salva(patch: Partial<ImpostazioniLega>) {
    const successivo = { ...form, ...patch };
    setForm(successivo);
    try {
      const res = await fetch("/api/admin/impostazioni", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Impostazioni aggiornate");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare le impostazioni");
    }
  }

  function salvaGenerali(fd: FormData) {
    salva({
      nomeLega: String(fd.get("nomeLega") ?? ""),
      campo: String(fd.get("campo") ?? ""),
      email: String(fd.get("email") ?? ""),
      telefono: String(fd.get("telefono") ?? ""),
    });
  }

  function salvaStagione(fd: FormData) {
    salva({
      stagioneEtichetta: String(fd.get("stagioneEtichetta") ?? ""),
      stagioneDataInizio: String(fd.get("stagioneDataInizio") ?? ""),
      stagioneDataFine: String(fd.get("stagioneDataFine") ?? ""),
      regolamento: String(fd.get("regolamento") ?? ""),
    });
  }

  function toggleAutomazione(chiave: keyof ImpostazioniLega["automazioni"], valore: boolean) {
    salva({ automazioni: { ...form.automazioni, [chiave]: valore } });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardContent>
          <form action={salvaGenerali} className="flex flex-col gap-4 p-5">
            <p className="font-display text-base font-bold">Dati generali</p>
            <Field name="nomeLega" label="Nome della Lega" defaultValue={form.nomeLega} />
            <Field name="campo" label="Campo ufficiale" defaultValue={form.campo} />
            <Field name="email" label="Email di contatto" defaultValue={form.email} type="email" />
            <Field name="telefono" label="Telefono segreteria" defaultValue={form.telefono} />
            <Button type="submit" size="sm" disabled={isPending} className="w-fit">
              {isPending && <Loader2 className="size-4 animate-spin" />} Salva dati generali
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form action={salvaStagione} className="flex flex-col gap-4 p-5">
            <p className="font-display text-base font-bold">Stagione in corso</p>
            <Field name="stagioneEtichetta" label="Etichetta stagione" defaultValue={form.stagioneEtichetta} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="stagioneDataInizio" label="Data inizio" defaultValue={form.stagioneDataInizio} type="date" />
              <Field name="stagioneDataFine" label="Data fine" defaultValue={form.stagioneDataFine} type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="regolamento">Regolamento sintetico</Label>
              <Textarea
                id="regolamento"
                name="regolamento"
                defaultValue={form.regolamento}
                rows={4}
                placeholder="Es. Girone unico ad andata e ritorno. 3 punti per la vittoria, 1 per il pareggio. A parità di punti prevale la differenza reti, poi gli scontri diretti."
              />
            </div>
            <Button type="submit" size="sm" disabled={isPending} className="w-fit">
              {isPending && <Loader2 className="size-4 animate-spin" />} Salva stagione
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="font-display text-base font-bold">Automazioni</p>
          <ToggleRow
            label="Aggiornamento automatico classifica"
            desc="Ricalcola la classifica ad ogni partita conclusa"
            checked={form.automazioni.classificaAutomatica}
            onCheckedChange={(v) => toggleAutomazione("classificaAutomatica", v)}
          />
          <Separator />
          <ToggleRow
            label="Aggiornamento automatico marcatori"
            desc="Aggiorna la classifica marcatori/assist in tempo reale"
            checked={form.automazioni.marcatoriAutomatici}
            onCheckedChange={(v) => toggleAutomazione("marcatoriAutomatici", v)}
          />
          <Separator />
          <ToggleRow
            label="Calcolo automatico MVP"
            desc="Propone l'MVP di giornata in base a voti e prestazioni"
            checked={form.automazioni.mvpAutomatico}
            onCheckedChange={(v) => toggleAutomazione("mvpAutomatico", v)}
          />
          <Separator />
          <ToggleRow
            label="Notifiche push automatiche sui goal"
            desc="Invia una notifica push ad ogni rete segnata"
            checked={form.automazioni.notifichePushGol}
            onCheckedChange={(v) => toggleAutomazione("notifichePushGol", v)}
          />
          <Separator />
          <ToggleRow
            label="Partita della settimana automatica"
            desc="Evidenzia in automatico la sfida più spettacolare"
            checked={form.automazioni.partitaSettimanaAutomatica}
            onCheckedChange={(v) => toggleAutomazione("partitaSettimanaAutomatica", v)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} type={type} />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onCheckedChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
