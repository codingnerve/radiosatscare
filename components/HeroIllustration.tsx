/**
 * Original vector illustration: a windscreen view of an open road under a satellite orbit,
 * above a dashboard head unit showing a healthy signal. Drawn for this site; no third-party art.
 */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 470"
      className={className}
      role="img"
      aria-label="Illustration of a car dashboard radio showing a strong satellite signal on an open road"
    >
      <defs>
        <linearGradient id="hi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1b3d" />
          <stop offset="1" stopColor="#2a5090" />
        </linearGradient>
        <linearGradient id="hi-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b3c72" />
          <stop offset="1" stopColor="#0d2247" />
        </linearGradient>
        <linearGradient id="hi-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#fdba74" />
        </linearGradient>
        <clipPath id="hi-clip">
          <rect width="560" height="470" rx="28" />
        </clipPath>
      </defs>

      <g clipPath="url(#hi-clip)">
        <rect width="560" height="470" fill="url(#hi-sky)" />

        {/* stars */}
        <g fill="#fff" opacity=".55">
          <circle cx="60" cy="48" r="1.6" />
          <circle cx="132" cy="92" r="1.2" />
          <circle cx="470" cy="40" r="1.6" />
          <circle cx="515" cy="110" r="1.2" />
          <circle cx="395" cy="78" r="1.2" />
          <circle cx="215" cy="30" r="1.2" />
        </g>

        {/* orbit + satellite */}
        <path d="M-20 150C120 20 400 10 580 120" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="1.6" strokeDasharray="3 7" />
        <g transform="translate(332 36) rotate(18)">
          <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#f97316" />
          <rect x="-26" y="-4" width="17" height="8" rx="1.5" fill="#c7d4ea" />
          <rect x="9" y="-4" width="17" height="8" rx="1.5" fill="#c7d4ea" />
        </g>
        {/* signal beam to the car */}
        <path d="M332 48 280 196" stroke="url(#hi-glow)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" opacity=".9" />

        {/* hills */}
        <path d="M0 210c60-34 120-36 190-12s120 8 170-10 130-14 200 12v50H0z" fill="#112a54" />
        <path d="M0 225c80-20 150-18 230-4s190 6 330-8v45H0z" fill="#0d2247" />

        {/* road */}
        <path d="M262 214h36l140 56H122z" fill="url(#hi-road)" />
        <path d="M280 216v54" stroke="#f97316" strokeWidth="3" strokeDasharray="7 9" />

        {/* dashboard */}
        <path d="M0 262c120-22 300-22 560 0V470H0z" fill="#060f24" />
        <path d="M0 262c120-22 300-22 560 0" fill="none" stroke="#2a5090" strokeOpacity=".7" strokeWidth="2" />

        {/* vents */}
        <g stroke="#1b3c72" strokeWidth="3" strokeLinecap="round">
          <path d="M34 322h56M34 336h56M34 350h56" />
          <path d="M470 322h56M470 336h56M470 350h56" />
        </g>

        {/* head unit */}
        <rect x="132" y="284" width="296" height="160" rx="20" fill="#0a1b3d" stroke="#2a5090" strokeWidth="2" />
        <rect x="148" y="300" width="264" height="128" rx="12" fill="#060f24" />

        {/* status pill */}
        <rect x="162" y="312" width="58" height="18" rx="9" fill="#f97316" />
        <rect x="174" y="319" width="34" height="4" rx="2" fill="#060f24" />
        <circle cx="395" cy="321" r="4" fill="#4ade80" />

        {/* signal arcs */}
        <g transform="translate(184 408)" fill="none" strokeLinecap="round" strokeWidth="5">
          <circle r="5" fill="#f97316" stroke="none" />
          <path d="M0-20a20 20 0 0 1 20 20" stroke="#fff" />
          <path d="M0-38a38 38 0 0 1 38 38" stroke="#fff" strokeOpacity=".7" />
          <path d="M0-56a56 56 0 0 1 56 56" stroke="#f97316" />
        </g>

        {/* station list */}
        <g fill="#c7d4ea">
          <rect x="262" y="346" width="120" height="8" rx="4" opacity=".95" />
          <rect x="262" y="366" width="88" height="8" rx="4" opacity=".55" />
          <rect x="262" y="386" width="104" height="8" rx="4" opacity=".4" />
        </g>

        {/* signal strength */}
        <g fill="#4ade80">
          <rect x="350" y="404" width="8" height="8" rx="2" />
          <rect x="362" y="400" width="8" height="12" rx="2" />
          <rect x="374" y="396" width="8" height="16" rx="2" />
          <rect x="386" y="392" width="8" height="20" rx="2" />
          <rect x="398" y="388" width="8" height="24" rx="2" fill="#2a5090" />
        </g>

        {/* knobs */}
        <g>
          <circle cx="100" cy="414" r="22" fill="#112a54" stroke="#2a5090" strokeWidth="2" />
          <path d="M100 398v10" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <circle cx="460" cy="414" r="22" fill="#112a54" stroke="#2a5090" strokeWidth="2" />
          <path d="M460 398v10" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
