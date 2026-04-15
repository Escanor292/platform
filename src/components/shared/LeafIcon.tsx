export default function LeafIcon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 160 160" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2E8B57', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#6BCB77', stopOpacity: 0.8 }} />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="sparkle" cx="35%" cy="35%">
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      
      {/* Stem */}
      <path 
        d="M80 130V35" 
        stroke="url(#stemGrad)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        filter="url(#glow)" 
        opacity="0.95" 
      />
      
      {/* Left leaf */}
      <path 
        d="M80 35C58 8 12 25 20 55C28 80 64 72 80 35Z" 
        fill="#2E8B57" 
        opacity="0.9" 
        filter="url(#glow)" 
      />
      
      {/* Right leaf */}
      <path 
        d="M80 35C102 8 148 25 140 55C132 80 96 72 80 35Z" 
        fill="#6BCB77" 
        opacity="0.8" 
        filter="url(#glow)" 
      />
      
      {/* Decorative nodes */}
      <circle cx="50" cy="110" r="4.5" fill="#2F80ED" opacity="0.5" filter="url(#glow)" />
      <circle cx="110" cy="95" r="3.5" fill="#6BCB77" opacity="0.6" filter="url(#glow)" />
      <circle cx="80" cy="135" r="3" fill="#8B6B4A" opacity="0.4" filter="url(#glow)" />
      
      {/* Shine effect */}
      <ellipse cx="65" cy="55" rx="8" ry="15" fill="url(#sparkle)" opacity="0.3" />
    </svg>
  );
}
