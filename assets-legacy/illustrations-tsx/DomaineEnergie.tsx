/**
 * Domaine Énergie — éolienne et éclair en flat design :
 * collines energy pleines, éolienne encre pleine, éclair signal plein.
 * Formes pleines uniquement.
 */
export default function DomaineEnergie({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-labelledby="dom-energie-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="dom-energie-title">
        Éolienne pleine sur des collines avec un éclair, style flat design
      </title>

      {/* Ciel papier + soleil energy */}
      <rect width="400" height="300" fill="var(--paper)" />
      <circle cx="322" cy="64" r="34" fill="var(--energy)" />
      <circle cx="322" cy="64" r="46" fill="none" stroke="var(--energy)" strokeWidth="5" strokeDasharray="10 12" />

      {/* Collines — aplats superposés */}
      <path
        d="M 0 300 L 0 226 C 70 196 150 190 220 210 C 290 230 350 224 400 200 L 400 300 Z"
        fill="var(--energy)"
      />
      <path
        d="M 0 300 L 0 262 C 90 238 190 240 270 258 C 330 272 370 268 400 254 L 400 300 Z"
        fill="var(--ink)"
      />

      {/* Éolienne — mât plein + 3 pales pleines */}
      <g fill="var(--ink)">
        <path d="M 190 262 L 196 138 L 204 138 L 210 262 Z" />
        {/* Pales (hub en 200,132) */}
        <path d="M 200 132 L 192 58 C 191 48 209 48 208 58 Z" />
        <path d="M 200 132 L 268 166 C 276 172 266 186 258 179 Z" />
        <path d="M 200 132 L 132 166 C 124 172 134 186 142 179 Z" />
        <circle cx="200" cy="132" r="14" />
      </g>
      <circle cx="200" cy="132" r="5" fill="var(--paper)" />

      {/* Éclair signal — aplat plein */}
      <path
        d="M 96 52 L 62 120 L 84 120 L 58 188 L 116 106 L 92 106 L 118 52 Z"
        fill="var(--signal)"
      />

      {/* Petit vent — rubans papier-2 pleins */}
      <path d="M 250 96 C 280 88 306 90 326 98 C 306 96 282 98 254 108 Z" fill="var(--paper-2)" />
      <path d="M 60 232 C 86 226 108 228 124 234 C 106 232 84 234 62 242 Z" fill="var(--paper)" />
    </svg>
  );
}
