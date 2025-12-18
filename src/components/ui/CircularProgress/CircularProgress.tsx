import { HTMLAttributes } from 'react';

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  className = '',
  ...props
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center ${className}`} {...props}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#22c55e"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(value)}%
            </div>
          </div>
        </div>
      </div>
      {label && (
        <div className="mt-2 text-sm text-gray-600 font-medium">
          {label}
        </div>
      )}
    </div>
  );
}

export default CircularProgress;
