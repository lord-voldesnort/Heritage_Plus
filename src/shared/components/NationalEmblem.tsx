import React from 'react';

interface NationalEmblemProps {
  className?: string;
  size?: number;
}

export const NationalEmblem: React.FC<NationalEmblemProps> = ({ className = 'h-9 w-9', size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Heritage Plus National Directorate Emblem"
    >
      <rect width="48" height="48" rx="10" fill="#ea580c" />
      <path
        d="M24 8L36 18V38C36 39.1046 35.1046 40 34 40H14C12.8954 40 12 39.1046 12 38V18L24 8Z"
        stroke="white"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M24 16V26" stroke="#fed7aa" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="32" r="2.5" fill="#38bdf8" />
      <path d="M18 22H30" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 40V30H28V40" stroke="white" strokeWidth="2" />
    </svg>
  );
};
