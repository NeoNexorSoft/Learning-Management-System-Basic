"use client";

// Shown on the right panel when there is not enough content to preview yet.
// A teacher figure writing on paper, built with SVG and CSS animations.

export default function PreviewPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 select-none">
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Desk surface */}
        <rect
          x="20"
          y="155"
          width="180"
          height="8"
          rx="4"
          fill="#d1d5db"
        />

        {/* Paper on desk */}
        <rect
          x="52"
          y="95"
          width="116"
          height="65"
          rx="3"
          fill="#f9fafb"
          stroke="#d1d5db"
          strokeWidth="1.5"
        />

        {/* Animated lines being written on paper */}
        <line
          x1="64"
          y1="112"
          x2="152"
          y2="112"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ animation: "writeLine1 2.4s ease-in-out infinite" }}
        />
        <line
          x1="64"
          y1="124"
          x2="140"
          y2="124"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ animation: "writeLine2 2.4s ease-in-out infinite 0.3s" }}
        />
        <line
          x1="64"
          y1="136"
          x2="148"
          y2="136"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ animation: "writeLine3 2.4s ease-in-out infinite 0.6s" }}
        />
        <line
          x1="64"
          y1="148"
          x2="120"
          y2="148"
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ animation: "writeLine4 2.4s ease-in-out infinite 0.9s" }}
        />

        {/* Teacher body */}
        {/* Torso */}
        <rect
          x="86"
          y="52"
          width="48"
          height="48"
          rx="8"
          fill="#3b82f6"
        />

        {/* Head */}
        <circle cx="110" cy="34" r="18" fill="#fbbf24" />

        {/* Eyes */}
        <circle cx="104" cy="32" r="2.5" fill="#1e293b" />
        <circle cx="116" cy="32" r="2.5" fill="#1e293b" />

        {/* Smile */}
        <path
          d="M104 40 Q110 45 116 40"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left arm resting on desk */}
        <path
          d="M86 75 Q60 95 58 130"
          stroke="#3b82f6"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right arm holding pen - animated writing motion */}
        <g style={{ animation: "writeArm 1.2s ease-in-out infinite alternate" }}>
          <path
            d="M134 75 Q158 95 148 130"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          {/* Pen */}
          <g transform="translate(140, 122) rotate(-30)">
            <rect x="-3" y="-16" width="6" height="20" rx="2" fill="#1e293b" />
            <polygon points="0,-16 -3,-23 3,-23" fill="#dc2626" />
            <polygon points="-3,4 3,4 0,9" fill="#1e293b" />
          </g>
        </g>

        {/* Keyframe animations injected via style tag */}
        <style>{`
          @keyframes writeArm {
            from { transform: translateX(0px); }
            to   { transform: translateX(8px); }
          }
          @keyframes writeLine1 {
            0%   { clip-path: inset(0 100% 0 0); }
            40%  { clip-path: inset(0 0% 0 0); }
            100% { clip-path: inset(0 0% 0 0); }
          }
          @keyframes writeLine2 {
            0%   { clip-path: inset(0 100% 0 0); }
            10%  { clip-path: inset(0 100% 0 0); }
            50%  { clip-path: inset(0 0% 0 0); }
            100% { clip-path: inset(0 0% 0 0); }
          }
          @keyframes writeLine3 {
            0%   { clip-path: inset(0 100% 0 0); }
            20%  { clip-path: inset(0 100% 0 0); }
            60%  { clip-path: inset(0 0% 0 0); }
            100% { clip-path: inset(0 0% 0 0); }
          }
          @keyframes writeLine4 {
            0%   { clip-path: inset(0 100% 0 0); }
            30%  { clip-path: inset(0 100% 0 0); }
            70%  { clip-path: inset(0 0% 0 0); }
            100% { clip-path: inset(0 0% 0 0); }
          }
        `}</style>
      </svg>

      <div className="text-center space-y-1 px-6">
        <p className="text-sm font-medium text-gray-500">
          প্রশ্নপত্র তৈরি শুরু করুন
        </p>
        <p className="text-xs text-gray-400">
          বাম পাশে তথ্য পূরণ করলে এখানে লাইভ প্রিভিউ দেখা যাবে
        </p>
      </div>
    </div>
  );
}
