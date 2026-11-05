import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`max-w-5xl mx-auto space-y-8 pb-12 ${className}`}>
      {children}
    </div>
  );
}

