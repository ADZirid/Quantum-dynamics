/**
 * Domaine Industrie — engrenages pleins en flat design :
 * grand pignon encre, pignon energy en prise, écrou signal.
 * Formes pleines uniquement.
 */
export default function DomaineIndustrie({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-labelledby="dom-industrie-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="dom-industrie-title">
        Deux engrenages pleins en prise avec un écrou, style flat design
      </title>

      {/* Fond + panneau papier */}
      <rect width="400" height="300" fill="var(--paper-2)" />
      <rect x="36" y="30" width="328" height="240" rx="16" fill="var(--paper)" />

      {/* Grand engrenage encre — 8 dents pleines + corps plein */}
      <g fill="var(--ink)">
        <g>
          <rect x="141" y="38" width="18" height="26" rx="4" />
          <rect x="141" y="38" width="18" height="26" rx="4" transform="rotate(45 150 130)" />
          <rect x="141" y="38" width="18" height="26" rx="4" transform="rotate(90 150 130)" />
          <rect x="141" y="38" width="18" height="26" rx="4" transform="rotate(135 150 130)" />
          <rect x="141" y="38" width="18" height="26" rx="4" transform="rotate(180 150 130)" />
          <rect x="141" y="38" width="18" height="26" rx="4" transform="rotate(225 150 130)" />
          <rect x="141" y="38" width="18" height="26" rx="4" transform="rotate(270 150 130)" />
          <rect x="141" y="38" width="18" height="26" rx="4" transform="rotate(315 150 130)" />
        </g>
        <circle cx="150" cy="130" r="62" />
      </g>
      <circle cx="150" cy="130" r="26" fill="var(--paper-2)" />
      <circle cx="150" cy="130" r="10" fill="var(--energy)" />

      {/* Petit engrenage energy — en prise avec le grand */}
      <g fill="var(--energy)">
        <g>
          <rect x="275" y="132" width="14" height="20" rx="4" />
          <rect x="275" y="132" width="14" height="20" rx="4" transform="rotate(45 282 188)" />
          <rect x="275" y="132" width="14" height="20" rx="4" transform="rotate(90 282 188)" />
          <rect x="275" y="132" width="14" height="20" rx="4" transform="rotate(135 282 188)" />
          <rect x="275" y="132" width="14" height="20" rx="4" transform="rotate(180 282 188)" />
          <rect x="275" y="132" width="14" height="20" rx="4" transform="rotate(225 282 188)" />
          <rect x="275" y="132" width="14" height="20" rx="4" transform="rotate(270 282 188)" />
          <rect x="275" y="132" width="14" height="20" rx="4" transform="rotate(315 282 188)" />
        </g>
        <circle cx="282" cy="188" r="42" />
      </g>
      <circle cx="282" cy="188" r="17" fill="var(--paper)" />
      <circle cx="282" cy="188" r="6" fill="var(--ink)" />

      {/* Écrou signal — hexagone plein percé */}
      <path
        d="M 320 66 L 344 80 L 344 108 L 320 122 L 296 108 L 296 80 Z"
        fill="var(--signal)"
      />
      <circle cx="320" cy="94" r="10" fill="var(--paper)" />

      {/* Bielle / élément mécanique — barre pleine encre avec axes */}
      <rect x="56" y="216" width="180" height="20" rx="10" fill="var(--ink)" />
      <circle cx="66" cy="226" r="15" fill="var(--ink)" />
      <circle cx="66" cy="226" r="6" fill="var(--paper-2)" />
      <circle cx="226" cy="226" r="15" fill="var(--ink)" />
      <circle cx="226" cy="226" r="6" fill="var(--paper-2)" />

      {/* Pastille signal d'assemblage */}
      <circle cx="340" cy="240" r="9" fill="var(--signal)" />
    </svg>
  );
}
