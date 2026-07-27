import { Link } from "react-router";
import { Instagram } from "lucide-react";
import DiscordIcon from "@/components/DiscordIcon";
import { DISCORD_URL, INSTAGRAM_URL } from "@/lib/socials";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/association", label: "L'association" },
  { to: "/newsletter", label: "Newsletter" },
  { to: "/documents", label: "Documents" },
  { to: "/rejoindre", label: "Rejoindre" },
  { to: "/espace-membres", label: "Espace membres" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-[#F2F1EC]">
      <div className="container-qd grid gap-12 py-16 md:grid-cols-3 md:gap-8">
        {/* Gauche — Légal */}
        <div>
          <p className="label-mono text-[11px] text-energy-light">Légal</p>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                to="/politique-de-confidentialite"
                className="text-sm text-[#9AA39E] underline-offset-4 transition-colors hover:text-[#F2F1EC] hover:underline"
              >
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link
                to="/cgu"
                className="text-sm text-[#9AA39E] underline-offset-4 transition-colors hover:text-[#F2F1EC] hover:underline"
              >
                Conditions générales d'utilisation
              </Link>
            </li>
          </ul>
          <address className="mt-6 space-y-1 font-mono text-xs not-italic text-ink-3">
            <p>SIRET 993 125 129 00011</p>
            <p>50 rue de Sèvres, 92410 Ville d'Avray</p>
            <p>
              <a
                href="mailto:quantumdynamics.asso@gmail.com"
                className="transition-colors hover:text-[#F2F1EC]"
              >
                quantumdynamics.asso@gmail.com
              </a>
            </p>
          </address>
        </div>

        {/* Centre — Navigation */}
        <nav aria-label="Navigation de pied de page">
          <p className="label-mono text-[11px] text-energy-light">Navigation</p>
          <ul className="mt-4 space-y-2">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-[#9AA39E] underline-offset-4 transition-colors hover:text-[#F2F1EC] hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Droite — Logo + baseline + réseaux */}
        <div className="md:justify-self-end md:text-right">
          <img
            src="/logo-full-light.png"
            alt="Logo Quantum Dynamics"
            className="h-12 w-auto md:ml-auto"
            width={135}
            height={48}
          />
          <p className="mt-3 text-sm text-[#9AA39E]">
            Concevoir. Prototyper. Concourir.
          </p>

          {/* Réseaux sociaux officiels */}
          <p className="label-mono mt-8 text-[11px] text-energy-light">
            Suivez-nous
          </p>
          <div className="mt-3 flex gap-3 md:justify-end">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Quantum Dynamics"
              className="flex h-10 w-10 items-center justify-center rounded border border-line-dark text-[#9AA39E] transition-colors hover:border-[#F2F1EC] hover:text-[#F2F1EC]"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord de Quantum Dynamics"
              className="flex h-10 w-10 items-center justify-center rounded border border-line-dark text-[#9AA39E] transition-colors hover:border-[#F2F1EC] hover:text-[#F2F1EC]"
            >
              <DiscordIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bas de footer */}
      <div className="border-t border-line-dark">
        <div className="container-qd py-6">
          <p className="text-xs text-[#9AA39E]">
            © {year} Quantum Dynamics — Association étudiante d'ingénierie.
          </p>
        </div>
      </div>
    </footer>
  );
}
