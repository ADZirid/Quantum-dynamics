/**
 * FIG. 02 — Piste de compétition en flat design sur fond sombre :
 * anneau de piste clair plein, intérieur energy, ligne d'arrivée à damier,
 * drapeau damier et véhicule plein. Formes pleines uniquement.
 */
export default function ConcoursPiste({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 840 400"
      className={className}
      role="img"
      aria-labelledby="concours-piste-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="concours-piste-title">
        Piste de course stylisée en aplats clairs avec ligne d'arrivée et
        drapeau à damier
      </title>

      {/* Fond sombre */}
      <rect width="840" height="400" fill="#161D1A" />

      {/* Intérieur du circuit — aplat energy */}
      <rect x="180" y="150" width="480" height="100" rx="50" fill="var(--energy)" />

      {/* Anneau de piste — ruban clair plein arrondi (evenodd) */}
      <path
        fill="#F2F1EC"
        fillRule="evenodd"
        d="M 180 80 H 660 A 120 120 0 0 1 780 200 A 120 120 0 0 1 660 320 H 180 A 120 120 0 0 1 60 200 A 120 120 0 0 1 180 80 Z
           M 230 150 H 610 A 50 50 0 0 1 660 200 A 50 50 0 0 1 610 250 H 230 A 50 50 0 0 1 180 200 A 50 50 0 0 1 230 150 Z"
      />

      {/* Ligne d'arrivée — damier encre sur le ruban clair (côté droit) */}
      <g fill="#161D1A">
        <rect x="660" y="180" width="15" height="15" />
        <rect x="690" y="180" width="15" height="15" />
        <rect x="720" y="180" width="15" height="15" />
        <rect x="750" y="180" width="15" height="15" />
        <rect x="675" y="195" width="15" height="15" />
        <rect x="705" y="195" width="15" height="15" />
        <rect x="735" y="195" width="15" height="15" />
        <rect x="765" y="195" width="15" height="15" />
        <rect x="660" y="210" width="15" height="15" />
        <rect x="690" y="210" width="15" height="15" />
        <rect x="720" y="210" width="15" height="15" />
        <rect x="750" y="210" width="15" height="15" />
        <rect x="675" y="225" width="15" height="15" />
        <rect x="705" y="225" width="15" height="15" />
        <rect x="735" y="225" width="15" height="15" />
        <rect x="765" y="225" width="15" height="15" />
      </g>

      {/* Véhicule plein sur la piste (ruban du bas) */}
      <g>
        <rect x="288" y="264" width="64" height="24" rx="12" fill="#161D1A" />
        <rect x="304" y="252" width="30" height="16" rx="8" fill="#161D1A" />
        <rect x="308" y="255" width="22" height="10" rx="5" fill="var(--energy)" />
        <circle cx="308" cy="290" r="9" fill="#161D1A" />
        <circle cx="308" cy="290" r="3.5" fill="#F2F1EC" />
        <circle cx="336" cy="290" r="9" fill="#161D1A" />
        <circle cx="336" cy="290" r="3.5" fill="#F2F1EC" />
        <circle cx="352" cy="272" r="4" fill="var(--signal)" />
      </g>

      {/* Drapeau à damier — mât clair + damier plein */}
      <rect x="744" y="44" width="7" height="118" rx="3.5" fill="#F2F1EC" />
      <rect x="751" y="44" width="75" height="60" fill="#F2F1EC" />
      <g fill="#161D1A">
        <rect x="751" y="44" width="15" height="15" />
        <rect x="781" y="44" width="15" height="15" />
        <rect x="811" y="44" width="15" height="15" />
        <rect x="766" y="59" width="15" height="15" />
        <rect x="796" y="59" width="15" height="15" />
        <rect x="751" y="74" width="15" height="15" />
        <rect x="781" y="74" width="15" height="15" />
        <rect x="811" y="74" width="15" height="15" />
        <rect x="766" y="89" width="15" height="15" />
        <rect x="796" y="89" width="15" height="15" />
      </g>

      {/* Marqueurs de virage — touches signal */}
      <circle cx="110" cy="200" r="11" fill="var(--signal)" />
      <circle cx="146" cy="200" r="6" fill="var(--signal)" />

      {/* Pastilles décoratives claires */}
      <circle cx="60" cy="52" r="5" fill="#F2F1EC" />
      <circle cx="780" cy="356" r="5" fill="#F2F1EC" />
      <circle cx="60" cy="356" r="5" fill="var(--energy)" />
    </svg>
  );
}
