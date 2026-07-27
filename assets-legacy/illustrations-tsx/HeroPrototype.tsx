/**
 * FIG. 01 — Véhicule prototype en vue latérale, style flat design :
 * silhouette pleine encre, roues pleines, flux d'air en aplats energy,
 * touches signal. Aucune photo, aucun dégradé, aucun trait blueprint.
 */
export default function HeroPrototype({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      className={className}
      role="img"
      aria-labelledby="hero-proto-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="hero-proto-title">
        Véhicule prototype stylisé en aplats : silhouette pleine, roues et flux
        d'air géométriques
      </title>

      {/* Fond papier + grand disque poster */}
      <rect width="600" height="400" fill="var(--paper)" />
      <circle cx="470" cy="150" r="180" fill="var(--paper-2)" />
      <circle cx="70" cy="360" r="110" fill="var(--paper-2)" />

      {/* Flux d'air — rubans pleins energy qui enveloppent le véhicule */}
      <path
        d="M 20 118 C 160 84 380 78 580 112 C 380 100 170 108 20 148 Z"
        fill="var(--energy)"
      />
      <path
        d="M 40 168 C 180 140 360 136 540 162 C 360 156 190 160 40 190 Z"
        fill="var(--energy)"
        opacity="0.55"
      />

      {/* Sol — bande pleine */}
      <rect x="0" y="312" width="600" height="10" fill="var(--ink)" />
      <rect x="0" y="322" width="600" height="78" fill="var(--paper-2)" />

      {/* Silhouette du prototype — aplat encre avec arches de roues */}
      <path
        d="M 64 312
           C 72 268 104 240 168 232
           C 214 226 244 190 316 182
           C 388 174 446 192 496 210
           C 534 224 556 250 560 282
           L 560 312
           L 506 312
           A 58 58 0 0 0 390 312
           L 226 312
           A 58 58 0 0 0 110 312
           Z"
        fill="var(--ink)"
      />

      {/* Canopée — aplat energy */}
      <path
        d="M 296 188 C 350 180 402 190 440 204 L 428 228 L 306 230 Z"
        fill="var(--energy)"
      />

      {/* Prise d'air latérale — aplat papier découpé dans la silhouette */}
      <path
        d="M 470 232 L 528 244 C 540 248 548 258 550 268 L 474 262 Z"
        fill="var(--paper)"
      />

      {/* Feu avant — touche signal */}
      <circle cx="548" cy="252" r="7" fill="var(--signal)" />

      {/* Roues pleines : pneu encre, jante papier, moyeu energy */}
      <g>
        <circle cx="168" cy="312" r="46" fill="var(--ink)" />
        <circle cx="168" cy="312" r="22" fill="var(--paper)" />
        <circle cx="168" cy="312" r="8" fill="var(--energy)" />
        <circle cx="448" cy="312" r="46" fill="var(--ink)" />
        <circle cx="448" cy="312" r="22" fill="var(--paper)" />
        <circle cx="448" cy="312" r="8" fill="var(--energy)" />
      </g>

      {/* Aileron arrière — aplat energy */}
      <path d="M 64 232 L 116 226 L 108 244 L 60 250 Z" fill="var(--energy)" />
      <rect x="92" y="244" width="10" height="30" fill="var(--ink)" />

      {/* Marque poster — pastille signal */}
      <circle cx="540" cy="60" r="10" fill="var(--signal)" />
    </svg>
  );
}
