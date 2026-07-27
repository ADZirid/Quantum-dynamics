import { Link } from "react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import HeroCanvas from "@/components/home/HeroCanvas";
import HeroPrototype from "@/components/illustrations/HeroPrototype";
import DomaineTransports from "@/components/illustrations/DomaineTransports";
import DomaineIndustrie from "@/components/illustrations/DomaineIndustrie";
import DomaineEnergie from "@/components/illustrations/DomaineEnergie";
import ConcoursPiste from "@/components/illustrations/ConcoursPiste";

/* Descriptions volontairement génériques : aucun projet précis n'est cité. */
const DOMAINES = [
  {
    num: "01",
    titre: "Transports",
    Illustration: DomaineTransports,
    texte:
      "Conception et prototypage autour de la mobilité : véhicules, propulsion, aérodynamique.",
  },
  {
    num: "02",
    titre: "Industrie",
    Illustration: DomaineIndustrie,
    texte:
      "Mécanique, fabrication et automatisation : de la pièce au système complet.",
  },
  {
    num: "03",
    titre: "Énergie",
    Illustration: DomaineEnergie,
    texte:
      "Efficacité énergétique et systèmes d'alimentation pour des prototypes durables.",
  },
];

/* Types de compétitions visés par l'association — formulation générique,
   sans nom d'événement ni résultat tant que rien n'est vérifiable. */
const COMPETITIONS = [
  "Courses d'efficience énergétique",
  "Concours de robotique et de fabrication",
  "Challenges d'innovation énergétique",
];

/* DATA-SLOT: les 3 éditions les plus récentes seront alimentées par le backend.
   État vide prévu par le design : « La première édition arrive bientôt. » */
type Edition = {
  id: string;
  titre: string;
  date: string;
  extrait: string;
  vignette: string;
};
const EDITIONS: Edition[] = [];

export default function Home() {
  return (
    <div>
      {/* ============ Section 1 — Hero ============ */}
      <section
        className="relative flex min-h-[92dvh] items-center overflow-hidden border-b border-line bg-paper"
        aria-label="Présentation de Quantum Dynamics"
      >
        {/* Fallback CSS : grille statique (visible aussi sans JS / reduced-motion) */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "url(/texture-grid.svg)",
            backgroundSize: "512px 512px",
          }}
          aria-hidden="true"
        />
        <HeroCanvas />

        <div className="container-qd relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:gap-8">
          {/* Gauche (7 col) — texte */}
          <div className="lg:col-span-7">
            <p className="hero-label label-mono text-energy">
              [ Association étudiante d'ingénierie — Ville d'Avray ]
            </p>
            <h1 className="hero-title mt-5 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-[64px]">
              Concevoir. Prototyper.{" "}
              <span className="text-energy">Concourir.</span>
            </h1>
            <p className="hero-lead mt-6 max-w-[52ch] text-[17px] leading-relaxed text-ink-2 md:text-xl">
              Quantum Dynamics est une association étudiante qui conçoit et
              construit des prototypes dans les domaines des{" "}
              <strong className="font-semibold text-ink">transports</strong>, de{" "}
              <strong className="font-semibold text-ink">l'industrie</strong> et
              de <strong className="font-semibold text-ink">l'énergie</strong>,
              puis les présente en compétitions d'ingénierie.
            </p>
            <div className="hero-cta mt-8 flex flex-wrap items-center gap-4">
              <Link to="/rejoindre" className="btn-signal group">
                Rejoindre l'association
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link to="/association" className="btn-secondary">
                Découvrir l'association
              </Link>
            </div>
          </div>

          {/* Droite (5 col) — image cadrée */}
          <div className="lg:col-span-5">
            <figure className="hero-figure">
              <div className="relative border border-line bg-white p-2">
                {/* Croix de cadrage aux 4 coins (repère blueprint) */}
                <span
                  className="absolute -left-2 -top-2 h-4 w-4 border-l border-t border-ink-3"
                  aria-hidden="true"
                />
                <span
                  className="absolute -right-2 -top-2 h-4 w-4 border-r border-t border-ink-3"
                  aria-hidden="true"
                />
                <span
                  className="absolute -bottom-2 -left-2 h-4 w-4 border-b border-l border-ink-3"
                  aria-hidden="true"
                />
                <span
                  className="absolute -bottom-2 -right-2 h-4 w-4 border-b border-r border-ink-3"
                  aria-hidden="true"
                />
                <HeroPrototype className="aspect-[3/2] w-full" />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-ink-3">
                FIG. 01 — Prototype, vue latérale (schéma)
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Indicateur scroll */}
        <div
          className="animate-scroll-hint absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-ink-3 md:flex"
          aria-hidden="true"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.08em]">
            Scroll
          </span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* ============ Section 2 — Bandeau « En une phrase » ============ */}
      <section className="phrase-band border-b border-line bg-paper-2 py-20 md:py-24">
        <div className="container-qd text-center">
          <p className="label-mono text-energy">
            [ 00 — Qui sommes-nous ]
          </p>
          <p className="mx-auto mt-6 max-w-[70ch] font-display text-xl font-medium leading-snug tracking-[-0.02em] text-ink md:text-2xl">
            « Nous sommes des étudiants qui transforment des{" "}
            <span className="relative inline-block">
              idées en machines
              <span
                className="phrase-mark absolute inset-x-0 bottom-0 h-[2px] bg-energy"
                aria-hidden="true"
              />
            </span>{" "}
            — et qui les testent en compétition face à d'autres équipes
            étudiantes. »
          </p>
        </div>
      </section>

      {/* ============ Section 3 — Trois domaines d'activité ============ */}
      <section
        className="border-b border-line bg-white py-16 md:py-24"
        aria-labelledby="titre-domaines"
      >
        <div className="container-qd">
          <div>
            <p className="label-mono text-energy">[ 01 — Nos domaines ]</p>
            <h2
              id="titre-domaines"
              className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
            >
              Trois terrains d'expérimentation
            </h2>
            <p className="mt-3 max-w-[60ch] text-base text-ink-2">
              Chaque domaine réunit une équipe projet dédiée, de la première
              esquisse au prototype présenté en compétition.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {DOMAINES.map(domaine => (
              <article
                key={domaine.num}
                className="group flex flex-col rounded border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-energy hover:shadow-hover"
              >
                <div className="overflow-hidden border-b border-line">
                  <domaine.Illustration className="aspect-[4/3] w-full transition-transform [transition-duration:400ms] ease-out group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-energy">
                    {domaine.num}
                  </p>
                  <h3 className="mt-2 font-display text-[19px] font-medium tracking-[-0.02em] text-ink md:text-[22px]">
                    {domaine.titre}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">
                    {domaine.texte}
                  </p>
                  <Link
                    to="/association#domaines"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-energy transition-colors hover:text-energy-deep"
                  >
                    Voir les projets
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Section 4 — Concours & compétitions ============ */}
      <section
        className="concours-section border-b border-line-dark bg-ink py-16 text-[#F2F1EC] md:py-24"
        aria-labelledby="titre-concours"
      >
        <div className="container-qd grid items-center gap-12 lg:grid-cols-12">
          {/* Gauche (5 col) — texte */}
          <div className="lg:col-span-5">
            <p className="label-mono text-energy-light">
              [ 02 — Compétitions ]
            </p>
            <h2
              id="titre-concours"
              className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] md:text-[40px]"
            >
              Nous mesurer aux meilleurs
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#9AA39E]">
              L'association participe à des compétitions d'ingénierie
              étudiantes. C'est là que les conceptions sont testées,
              chronométrées, éprouvées — et que l'équipe grandit.
            </p>
            <ul className="mt-8">
              {COMPETITIONS.map(item => (
                <li
                  key={item}
                  className="border-t border-line-dark py-3 font-mono text-[13px] text-[#F2F1EC] last:border-b"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/newsletter"
              className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-energy-light transition-colors hover:text-[#F2F1EC]"
            >
              Suivre nos actualités
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Droite (7 col) — image avec parallaxe */}
          <div className="lg:col-span-7">
            <figure>
              <div className="relative overflow-hidden border border-line-dark">
                {/* Croix de cadrage claires */}
                <span
                  className="absolute left-3 top-3 z-10 h-4 w-4 border-l border-t border-[#F2F1EC]/70"
                  aria-hidden="true"
                />
                <span
                  className="absolute right-3 top-3 z-10 h-4 w-4 border-r border-t border-[#F2F1EC]/70"
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-3 left-3 z-10 h-4 w-4 border-b border-l border-[#F2F1EC]/70"
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-3 right-3 z-10 h-4 w-4 border-b border-r border-[#F2F1EC]/70"
                  aria-hidden="true"
                />
                <ConcoursPiste className="aspect-[21/10] w-full" />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-[#9AA39E]">
                FIG. 02 — Piste type, trajectoire optimale
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ Section 5 — Dernières newsletters (aperçu) ============ */}
      <section
        className="border-b border-line bg-paper py-16 md:py-24"
        aria-labelledby="titre-actus"
      >
        <div className="container-qd">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono text-energy">[ 03 — Actualités ]</p>
              <h2
                id="titre-actus"
                className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
              >
                Le journal de l'atelier
              </h2>
            </div>
            <Link
              to="/newsletter"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-energy transition-colors hover:text-energy-deep"
            >
              Toutes les éditions
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          {EDITIONS.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {EDITIONS.map(edition => (
                <article
                  key={edition.id}
                  className="group flex flex-col rounded border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-energy"
                >
                  <img
                    src={edition.vignette}
                    alt={`Vignette de ${edition.titre}`}
                    className="aspect-[4/3] w-full border-b border-line object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-energy">
                      Newsletter
                    </p>
                    <h3 className="mt-2 font-display text-lg font-medium text-ink">
                      {edition.titre}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-ink-3">
                      {edition.date}
                    </p>
                    <p className="mt-2 flex-1 text-sm text-ink-2">
                      {edition.extrait}
                    </p>
                    <Link
                      to={`/newsletter/${edition.id}`}
                      className="btn-quiet mt-4 self-start"
                    >
                      Lire
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-12 rounded border border-dashed border-line bg-white p-8 text-center text-sm text-ink-3">
              La première édition arrive bientôt.
            </p>
          )}
        </div>
      </section>

      {/* ============ Section 6 — CTA final « Rejoindre » ============ */}
      <section
        className="bg-paper-2 py-16 md:py-24"
        aria-labelledby="titre-rejoindre"
      >
        <div className="container-qd text-center">
          <p className="label-mono text-energy">
            [ 04 — Nous rejoindre ]
          </p>
          <h2
            id="titre-rejoindre"
            className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
          >
            Envie de construire avec nous ?
          </h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-base leading-relaxed text-ink-2">
            Toutes les filières sont les bienvenues — ingénierie, mais aussi
            design, communication ou gestion de projet. Remplissez le
            formulaire, le bureau vous répond sous quelques jours.
          </p>
          <div className="mt-8">
            <Link
              to="/rejoindre"
              className="btn-signal group px-8 py-4 text-base transition-transform duration-200 hover:scale-[1.02] hover:shadow-hover"
            >
              Remplir le formulaire d'adhésion
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
