interface SpacerSectionProps {
  height?: string;
}

export default function SpacerSection({ height = "py-12" }: SpacerSectionProps) {
  return <div className={`w-full ${height}`} />;
}
