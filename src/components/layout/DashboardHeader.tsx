import { Badge } from "@/components/ui/Badge";

export function DashboardHeader({ title, description, role }: { title: string; description: string; role: string }) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--paper)] px-5 py-5 md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge>{role}</Badge>
          <h1 className="mt-3 font-mono text-3xl font-black uppercase tracking-[-0.04em] md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">{description}</p>
        </div>
        <div className="barcode-rule hidden h-10 w-56 text-[var(--ink)] md:block" />
      </div>
    </header>
  );
}
