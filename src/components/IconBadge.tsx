export function IconBadge({
  icon,
  tint,
  color,
  size = 30,
}: {
  icon: React.ReactNode;
  tint: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg shrink-0"
      style={{ width: size, height: size, background: tint, color }}
    >
      {icon}
    </span>
  );
}
