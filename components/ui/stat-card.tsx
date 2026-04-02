interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="surface-card rounded-[1.75rem] p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</div>
      <div className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{value}</div>
    </div>
  );
}
