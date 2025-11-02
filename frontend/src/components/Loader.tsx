import React from "react";

interface LoaderProps {
  size?: number;
  centered?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 32, centered = false }) => {
  const strokeWidth = 4;
  const radius = 16 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.28;

  const loader = (
    <svg
      role="status"
      aria-live="polite"
      aria-label="Loading"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className="animate-spin"
    >
      <circle
        cx="16"
        cy="16"
        r={radius}
        stroke="#dbe3f0"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx="16"
        cy="16"
        r={radius}
        stroke="#f59e0b"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${circumference}`}
        strokeDashoffset={circumference - arcLength}
        fill="none"
      />
    </svg>
  );

  if (centered) {
    return <div className="flex justify-center items-center w-full h-full">{loader}</div>;
  }

  return loader;
};
