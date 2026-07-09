import { DashboardHeaderActions } from "@/components/layout/DashboardHeaderActions";
import { Badge } from "@/components/ui/Badge";

export function DashboardHeader({ title, description, role }: { title: string; description: string; role: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--paper)]/95 px-5 py-4 shadow-[0_12px_40px_rgba(7,19,31,0.08)] backdrop-blur-xl md:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80" />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Badge>{role}</Badge>
          <h1 className="mt-2 truncate text-2xl font-black tracking-[-0.05em] md:text-3xl">{title}</h1>
          <p className="mt-1 line-clamp-2 max-w-4xl text-sm leading-6 text-[var(--steel)]">{description}</p>
        </div>
        <DashboardHeaderActions role={role} />
      </div>
    </header>
  );
}
