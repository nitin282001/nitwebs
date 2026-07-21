import { GRID_WIDTH } from "../lib/constants";

export default function GridLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className={`${GRID_WIDTH} mx-auto h-full relative`}>
        <div className="absolute inset-y-0 left-0 border-l border-border" />
        <div className="absolute inset-y-0 right-0 border-l border-border" />
      </div>
    </div>
  );
}
