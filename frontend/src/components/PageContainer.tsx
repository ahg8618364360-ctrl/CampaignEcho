import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "compact";
}

export function PageContainer({
  children,
  className = "",
  size = "default",
}: PageContainerProps) {
  const sizeClasses = {
    compact: "max-w-4xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  }[size];

  return (
    <div className={`w-full ${sizeClasses} mx-auto space-y-6 pb-8 ${className}`}>
      {children}
    </div>
  );
}
