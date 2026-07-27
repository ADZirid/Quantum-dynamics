/** Tailwind — build Django (templates server-rendu). Mêmes tokens que
    l'ancien tailwind.config.js React. Compilation :
    tailwindcss -c tailwind.django.config.js -i styles/input.css -o static/css/main.css --minify */
module.exports = {
  content: ['./templates/**/*.html'],
  /* Classes de composants du contrat CSS à conserver même si aucune page ne
     les utilise encore (ex. btn-primary pour les espace membres / admin). */
  safelist: ['btn-primary'],
  theme: {
    extend: {
      colors: {
        /* Palette « carnet d'ingénierie » — Quantum Dynamics */
        paper: "#F7F6F2",
        "paper-2": "#EFEDE6",
        ink: "#161D1A",
        "ink-2": "#3D4844",
        "ink-3": "#6B7570",
        line: "#DEDBD2",
        "line-dark": "#2A332F",
        energy: "#1D7A5F",
        "energy-deep": "#145C47",
        "energy-light": "#3FA383",
        signal: "#D08A2E",
        "signal-deep": "#B3731F",
        danger: "#B4473C",
        ok: "#2E7D5B",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        hover: "0 1px 2px rgba(22,29,26,.06)",
      },
    },
  },
  plugins: [],
}
