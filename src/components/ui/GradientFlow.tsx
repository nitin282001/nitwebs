import "./GradientFlow.css";

interface GradientFlowProps {
  className?: string;
}

export default function GradientFlow({ className = "" }: GradientFlowProps) {
  return (
    <div className={`gradient-flow ${className}`}>
      <div className="gradient-flow__blob gradient-flow__blob--a" />
      <div className="gradient-flow__blob gradient-flow__blob--b" />
      <div className="gradient-flow__blob gradient-flow__blob--c" />
    </div>
  );
}
