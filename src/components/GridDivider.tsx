import { GRID_WIDTH } from "../lib/constants";

export function PlusMark({ className }: { className?: string }) {
  return (
    <span className={`text-border select-none leading-none text-[13px] ${className ?? ""}`}>
      +
    </span>
  );
}

export default function GridDivider() {
  return (
    <div className="absolute inset-x-0 top-0 h-px bg-border z-10">
      <div className={`${GRID_WIDTH} mx-auto relative h-full`}>
        <PlusMark className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
        <PlusMark className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
