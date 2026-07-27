/**
 * FIG. 03 — L'atelier en flat design sur fond sombre :
 * panneau d'outils clair, suspension signal, établi energy plein,
 * engrenage et pile de livres. Formes pleines uniquement.
 */
export default function AtelierEtabli({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 960 400"
      className={className}
      role="img"
      aria-labelledby="atelier-title"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="atelier-title">
        Établi d'atelier stylisé en aplats clairs avec outils, lampe et
        engrenage
      </title>

      {/* Fond sombre */}
      <rect width="960" height="400" fill="#161D1A" />

      {/* Panneau d'outils — grand aplat clair à gauche */}
      <rect x="56" y="56" width="304" height="212" rx="12" fill="#F2F1EC" />

      {/* Clé à molette — silhouette encre pleine */}
      <g fill="#161D1A">
        <circle cx="120" cy="116" r="24" />
        <rect x="108" y="128" width="24" height="96" rx="12" />
        <rect x="132" y="96" width="26" height="16" rx="8" transform="rotate(35 132 96)" />
      </g>
      <circle cx="120" cy="200" r="8" fill="#F2F1EC" />

      {/* Marteau — tête energy, manche encre */}
      <rect x="188" y="88" width="72" height="26" rx="10" fill="var(--energy)" />
      <rect x="216" y="110" width="16" height="112" rx="8" fill="#161D1A" />

      {/* Tournevis — manche signal, tige encre */}
      <rect x="292" y="92" width="26" height="62" rx="13" fill="var(--signal)" />
      <rect x="301" y="150" width="8" height="58" fill="#161D1A" />
      <path d="M 297 208 L 313 208 L 305 226 Z" fill="#161D1A" />

      {/* Suspension — câble, abat-jour signal, ampoule claire */}
      <rect x="494" y="0" width="6" height="86" fill="#F2F1EC" />
      <path d="M 462 86 L 534 86 L 556 140 L 440 140 Z" fill="var(--signal)" />
      <circle cx="498" cy="152" r="12" fill="#F2F1EC" />

      {/* Établi — plateau energy plein sur toute la largeur */}
      <rect x="56" y="288" width="848" height="22" rx="6" fill="var(--energy)" />
      {/* Pieds clairs + traverse */}
      <rect x="104" y="310" width="22" height="66" fill="#F2F1EC" />
      <rect x="834" y="310" width="22" height="66" fill="#F2F1EC" />
      <rect x="104" y="340" width="752" height="12" rx="6" fill="#F2F1EC" />

      {/* Caisse à outils sous l'établi */}
      <rect x="196" y="322" width="90" height="54" rx="6" fill="var(--signal)" />
      <rect x="228" y="312" width="26" height="12" rx="6" fill="var(--signal)" />
      <rect x="196" y="344" width="90" height="8" fill="#161D1A" />

      {/* Engrenage clair posé sur l'établi (droite) */}
      <g fill="#F2F1EC">
        <g>
          <rect x="651" y="150" width="16" height="22" rx="4" />
          <rect x="651" y="150" width="16" height="22" rx="4" transform="rotate(45 659 208)" />
          <rect x="651" y="150" width="16" height="22" rx="4" transform="rotate(90 659 208)" />
          <rect x="651" y="150" width="16" height="22" rx="4" transform="rotate(135 659 208)" />
          <rect x="651" y="150" width="16" height="22" rx="4" transform="rotate(180 659 208)" />
          <rect x="651" y="150" width="16" height="22" rx="4" transform="rotate(225 659 208)" />
          <rect x="651" y="150" width="16" height="22" rx="4" transform="rotate(270 659 208)" />
          <rect x="651" y="150" width="16" height="22" rx="4" transform="rotate(315 659 208)" />
        </g>
        <circle cx="659" cy="208" r="46" />
      </g>
      <circle cx="659" cy="208" r="18" fill="#161D1A" />
      <circle cx="659" cy="208" r="7" fill="var(--energy)" />

      {/* Pile de livres sur l'établi */}
      <rect x="756" y="262" width="96" height="16" rx="4" fill="#F2F1EC" />
      <rect x="764" y="244" width="80" height="16" rx="4" fill="var(--signal)" />
      <rect x="772" y="226" width="64" height="16" rx="4" fill="#F2F1EC" />

      {/* Mug energy sur l'établi */}
      <rect x="556" y="252" width="34" height="36" rx="6" fill="var(--energy)" />
      <path
        d="M 590 258 C 606 258 606 280 590 280 L 590 272 C 597 272 597 266 590 266 Z"
        fill="var(--energy)"
      />

      {/* Pastilles décoratives */}
      <circle cx="908" cy="84" r="6" fill="#F2F1EC" />
      <circle cx="884" cy="120" r="4" fill="var(--signal)" />
      <circle cx="420" cy="208" r="5" fill="#F2F1EC" />
    </svg>
  );
}
