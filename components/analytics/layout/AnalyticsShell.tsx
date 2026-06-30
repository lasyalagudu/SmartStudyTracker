interface Props {
  children: React.ReactNode;
}

export default function AnalyticsShell({ children }: Props) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {children}
    </div>
  );
}