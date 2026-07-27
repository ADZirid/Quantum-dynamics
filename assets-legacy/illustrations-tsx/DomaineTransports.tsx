/**
 * Domaine Transports — pictogramme mobilité en flat design :
 * véhicule stylisé plein sur disque energy, trajectoire en ruban plein,
 * touche signal. Formes pleines uniquement.
 */
export default function DomaineTransports({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-labelledby="dom-transports-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="dom-transports-title">
        Véhicule stylisé en aplats avec sa trajectoire, style flat design
      </title>

      {/* Fond + grand disque energy */}
      <rect width="400" height="300" fill="var(--paper-2)" />
      <circle cx="200" cy="150" r="118" fill="var(--energy)" />
      <circle cx="200" cy="150" r="118" fill="none" stroke="var(--paper)" strokeWidth="6" />

      {/* Trajectoire — ruban plein papier qui traverse le disque */}
      <path
        d="M -20 236 C 90 210 130 176 166 120 C 196 74 268 44 420 30
           L 420 58 C 280 72 218 96 190 136 C 154 188 108 226 -20 262 Z"
        fill="var(--paper)"
      />

      {/* Véhicule — silhouette pleine encre, vue latérale */}
      <g>
        {/* Carrosserie */}
        <path
          d="M 96 196
             C 100 172 122 160 158 156
             C 178 154 192 136 224 132
             C 256 128 286 138 308 148
             C 332 158 344 172 346 188
             L 346 196
             L 306 196
             A 34 34 0 0 0 238 196
             L 176 196
             A 34 34 0 0 0 108 196
             Z"
          fill="var(--ink)"
        />
        {/* Canopée papier */}
        <path
          d="M 214 138 C 244 134 272 142 292 150 L 284 166 L 220 166 Z"
          fill="var(--paper)"
        />
        {/* Feu avant signal */}
        <circle cx="338" cy="176" r="6" fill="var(--signal)" />
        {/* Roues pleines */}
        <circle cx="142" cy="196" r="28" fill="var(--ink)" />
        <circle cx="142" cy="196" r="12" fill="var(--paper)" />
        <circle cx="142" cy="196" r="5" fill="var(--signal)" />
        <circle cx="272" cy="196" r="28" fill="var(--ink)" />
        <circle cx="272" cy="196" r="12" fill="var(--paper)" />
        <circle cx="272" cy="196" r="5" fill="var(--signal)" />
      </g>

      {/* Lignes de vitesse — aplats energy derrière le véhicule */}
      <rect x="34" y="150" width="42" height="10" rx="5" fill="var(--ink)" />
      <rect x="22" y="170" width="54" height="10" rx="5" fill="var(--ink)" />
      <rect x="38" y="190" width="34" height="10" rx="5" fill="var(--ink)" />
    </svg>
  );
}
