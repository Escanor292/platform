import React from 'react';

interface TreeProps {
  className?: string;
}

// Mầm hy vọng (0-32%)
export const SeedlingTree: React.FC<TreeProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 60 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Extended Stem - dài xuống */}
    <path
      d="M30 100 L30 45"
      stroke="#86EFAC"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-[sway_3s_ease-in-out_infinite]"
    />
    {/* First leaf */}
    <ellipse
      cx="30"
      cy="42"
      rx="5"
      ry="7"
      fill="#86EFAC"
      className="animate-[float_2.5s_ease-in-out_infinite]"
      style={{ transformOrigin: '30px 42px' }}
    />
    {/* Second leaf */}
    <ellipse
      cx="30"
      cy="48"
      rx="4"
      ry="6"
      fill="#BBF7D0"
      className="animate-[float_2.5s_ease-in-out_infinite_0.3s]"
      style={{ transformOrigin: '30px 48px' }}
    />
    {/* Glow */}
    <circle
      cx="30"
      cy="45"
      r="10"
      fill="url(#seedlingGlow)"
      opacity="0.3"
      className="animate-pulse"
    />
    <defs>
      <radialGradient id="seedlingGlow">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="100%" stopColor="#86EFAC" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Đang lớn mạnh (33-65%)
export const GrowingTree: React.FC<TreeProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 60 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Extended Trunk */}
    <path
      d="M30 100 L30 38"
      stroke="#22C55E"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Left branch */}
    <path
      d="M30 48 Q24 46 20 43"
      stroke="#22C55E"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-[sway_3s_ease-in-out_infinite]"
    />
    {/* Right branch */}
    <path
      d="M30 48 Q36 46 40 43"
      stroke="#22C55E"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-[sway_3s_ease-in-out_infinite_0.5s]"
    />
    {/* Top leaves */}
    <circle
      cx="30"
      cy="33"
      r="9"
      fill="#22C55E"
      className="animate-[breathe_2s_ease-in-out_infinite]"
    />
    <circle
      cx="25"
      cy="36"
      r="6"
      fill="#4ADE80"
      className="animate-[breathe_2s_ease-in-out_infinite_0.2s]"
    />
    <circle
      cx="35"
      cy="36"
      r="6"
      fill="#4ADE80"
      className="animate-[breathe_2s_ease-in-out_infinite_0.4s]"
    />
    {/* Left leaves */}
    <circle
      cx="20"
      cy="43"
      r="4"
      fill="#86EFAC"
      className="animate-[float_2.5s_ease-in-out_infinite]"
    />
    {/* Right leaves */}
    <circle
      cx="40"
      cy="43"
      r="4"
      fill="#86EFAC"
      className="animate-[float_2.5s_ease-in-out_infinite_0.3s]"
    />
    {/* Glow */}
    <circle
      cx="30"
      cy="40"
      r="18"
      fill="url(#growingGlow)"
      opacity="0.2"
      className="animate-pulse"
    />
    <defs>
      <radialGradient id="growingGlow">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Sắp đơm trái (66-99%)
export const MatureTree: React.FC<TreeProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 60 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Extended Trunk */}
    <path
      d="M30 100 L30 35"
      stroke="#16A34A"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Branches */}
    <path
      d="M30 45 Q20 43 12 40"
      stroke="#16A34A"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-[sway_3s_ease-in-out_infinite]"
    />
    <path
      d="M30 45 Q40 43 48 40"
      stroke="#16A34A"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-[sway_3s_ease-in-out_infinite_0.5s]"
    />
    {/* Canopy - layered circles */}
    <circle
      cx="30"
      cy="28"
      r="14"
      fill="#16A34A"
      className="animate-[breathe_2s_ease-in-out_infinite]"
    />
    <circle
      cx="22"
      cy="32"
      r="10"
      fill="#22C55E"
      className="animate-[breathe_2s_ease-in-out_infinite_0.2s]"
    />
    <circle
      cx="38"
      cy="32"
      r="10"
      fill="#22C55E"
      className="animate-[breathe_2s_ease-in-out_infinite_0.4s]"
    />
    <circle
      cx="30"
      cy="35"
      r="9"
      fill="#4ADE80"
      className="animate-[breathe_2s_ease-in-out_infinite_0.3s]"
    />
    {/* Side leaves */}
    <circle
      cx="12"
      cy="40"
      r="6"
      fill="#86EFAC"
      className="animate-[float_2.5s_ease-in-out_infinite]"
    />
    <circle
      cx="48"
      cy="40"
      r="6"
      fill="#86EFAC"
      className="animate-[float_2.5s_ease-in-out_infinite_0.3s]"
    />
    {/* Enhanced glow */}
    <circle
      cx="30"
      cy="35"
      r="25"
      fill="url(#matureGlow)"
      opacity="0.25"
      className="animate-pulse"
    />
    <defs>
      <radialGradient id="matureGlow">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

// Đã kết trái (100%+)
export const FruitingTree: React.FC<TreeProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 60 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Extended Trunk */}
    <path
      d="M30 100 L30 35"
      stroke="#15803D"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Branches */}
    <path
      d="M30 45 Q20 43 12 40"
      stroke="#15803D"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-[sway_3s_ease-in-out_infinite]"
    />
    <path
      d="M30 45 Q40 43 48 40"
      stroke="#15803D"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-[sway_3s_ease-in-out_infinite_0.5s]"
    />
    {/* Full canopy */}
    <circle
      cx="30"
      cy="28"
      r="14"
      fill="#15803D"
      className="animate-[breathe_2s_ease-in-out_infinite]"
    />
    <circle
      cx="22"
      cy="32"
      r="10"
      fill="#16A34A"
      className="animate-[breathe_2s_ease-in-out_infinite_0.2s]"
    />
    <circle
      cx="38"
      cy="32"
      r="10"
      fill="#16A34A"
      className="animate-[breathe_2s_ease-in-out_infinite_0.4s]"
    />
    <circle
      cx="30"
      cy="35"
      r="9"
      fill="#22C55E"
      className="animate-[breathe_2s_ease-in-out_infinite_0.3s]"
    />
    {/* Fruits - golden/orange */}
    <circle
      cx="25"
      cy="30"
      r="3"
      fill="#F59E0B"
      className="animate-[bounce_2s_ease-in-out_infinite]"
    />
    <circle
      cx="35"
      cy="30"
      r="3"
      fill="#F59E0B"
      className="animate-[bounce_2s_ease-in-out_infinite_0.2s]"
    />
    <circle
      cx="30"
      cy="33"
      r="3"
      fill="#FBBF24"
      className="animate-[bounce_2s_ease-in-out_infinite_0.4s]"
    />
    {/* Side leaves */}
    <circle
      cx="12"
      cy="40"
      r="6"
      fill="#4ADE80"
      className="animate-[float_2.5s_ease-in-out_infinite]"
    />
    <circle
      cx="48"
      cy="40"
      r="6"
      fill="#4ADE80"
      className="animate-[float_2.5s_ease-in-out_infinite_0.3s]"
    />
    {/* Celebration glow */}
    <circle
      cx="30"
      cy="35"
      r="28"
      fill="url(#fruitGlow)"
      opacity="0.3"
      className="animate-[pulse_1.5s_ease-in-out_infinite]"
    />
    {/* Sparkles */}
    <circle
      cx="18"
      cy="25"
      r="1.5"
      fill="#FCD34D"
      className="animate-[twinkle_1.5s_ease-in-out_infinite]"
    />
    <circle
      cx="42"
      cy="25"
      r="1.5"
      fill="#FCD34D"
      className="animate-[twinkle_1.5s_ease-in-out_infinite_0.5s]"
    />
    <circle
      cx="30"
      cy="20"
      r="1.5"
      fill="#FCD34D"
      className="animate-[twinkle_1.5s_ease-in-out_infinite_1s]"
    />
    <defs>
      <radialGradient id="fruitGlow">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="50%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);
