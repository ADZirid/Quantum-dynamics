import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ArrowRight, UserRound } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MemberAvatar from "@/components/MemberAvatar";
import DomaineTransports from "@/components/illustrations/DomaineTransports";
import DomaineIndustrie from "@/components/illustrations/DomaineIndustrie";
import DomaineEnergie from "@/components/illustrations/DomaineEnergie";
import AtelierEtabli from "@/components/illustrations/AtelierEtabli";

const OBJECTIFS = [
  {
    titre: "Concevoir",
    texte: "transformer des idées en plans, maquettes et simulations.",
  },
  {
    titre: "Prototyper",
    texte: "fabriquer, tester, itérer dans notre atelier.",
  },
  {
    titre: "Concourir",
    texte: "présenter nos réalisations aux concours d’ingénierie étudiants.",
  },
  {
    titre: "Transmettre",
    texte:
      "former chaque nouvelle génération de membres aux outils et méthodes de l’atelier.",
  },
  {
    titre: "Ouvrir",
    texte:
      "accueillir toutes les filières, du génie mécanique à la communication.",
  },
];

/* Descriptions volontairement génériques : aucun projet précis n'est cité. */
const DOMAINES = [
  {
    num: "01",
    titre: "Transports",
    Illustration: DomaineTransports,
    texte:
      "Conception et prototypage autour de la mobilité : véhicules, propulsion, aérodynamique — de l'esquisse au prototype.",
  },
  {
    num: "02",
    titre: "Industrie",
    Illustration: DomaineIndustrie,
    texte:
      "Mécanique, fabrication et automatisation : de la pièce au système complet, chaque projet confronte les plans à la réalité de l'atelier.",
  },
  {
    num: "03",
    titre: "Énergie",
    Illustration: DomaineEnergie,
    texte:
      "Efficacité énergétique et systèmes d'alimentation pour des prototypes durables, de la mesure à la gestion de l'énergie.",
  },
];

/** Cartes neutres affichées tant qu'aucun membre n'est enregistré dans l'espace admin. */
const BUREAU_PLACEHOLDERS = [
  { role: "Président·e", initiales: "PR" },
  { role: "Vice-président·e", initiales: "VP" },
  { role: "Trésorier·ère", initiales: "TR" },
  { role: "Secrétaire", initiales: "SE" },
  { role: "Responsable technique", initiales: "RT" },
  { role: "Chargé·e de communication", initiales: "CC" },
];

/** Squelette de chargement d'une carte membre du bureau. */
function MemberCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded border border-line bg-white"
      aria-hidden="true"
    >
      <div className="aspect-square w-full bg-paper-2" />
      <div className="space-y-3 p-6">
        <div className="h-4 w-2/3 rounded-sm bg-paper-2" />
        <div className="h-3 w-1/3 rounded-sm bg-paper-2" />
        <div className="h-3 w-full rounded-sm bg-paper-2" />
      </div>
    </div>
  );
}

export default function Association() {
  const location = useLocation();

  const members = trpc.members.list.useQuery();

  // Défilement vers l'ancre #domaines (lien depuis l'accueil)
  useEffect(() => {
    if (location.hash === "#domaines") {
      const el = document.getElementById("domaines");
      if (el) {
        // Laisse le temps au rendu initial avant de défiler
        const t = window.setTimeout(
          () => el.scrollIntoView({ behavior: "smooth" }),
          100
        );
        return () => window.clearTimeout(t);
      }
    }
  }, [location.hash]);

  return (
    <div>
      {/* ============ Section 1 — En-tête de page ============ */}
      <section className="relative overflow-hidden border-b border-line bg-paper py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "url(/texture-grid.svg)",
            backgroundSize: "512px 512px",
          }}
          aria-hidden="true"
        />
        <div className="container-qd relative">
          <p className="asso-label label-mono text-energy">[ L'association ]</p>
          <h1 className="asso-title mt-5 font-display text-[38px] font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
            Une équipe, un atelier, des prototypes.
          </h1>
          <p className="asso-lead mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-2 md:text-xl">
            Quantum Dynamics est née d'une conviction simple : on apprend
            l'ingénierie en construisant. Présentation de notre mission, de nos
            objectifs et des personnes qui font tourner l'atelier.
          </p>
        </div>
      </section>

      {/* ============ Section 2 — Mission & objectifs ============ */}
      <section
        className="border-b border-line bg-white py-16 md:py-24"
        aria-labelledby="titre-mission"
      >
        <div className="container-qd grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Gauche (4 col, sticky) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <p className="label-mono text-energy">[ 01 — Notre mission ]</p>
              <h2
                id="titre-mission"
                className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
              >
                Apprendre en construisant
              </h2>
            </div>
          </div>

          {/* Droite (8 col) */}
          <div className="lg:col-span-8">
            <p className="text-[17px] leading-relaxed text-ink-2 md:text-lg">
              Quantum Dynamics réunit des étudiantes et étudiants autour d'un
              atelier partagé. Chaque année, l'association choisit des défis —
              un véhicule plus efficient, une machine plus précise, un système
              énergétique plus sobre — puis les conçoit, les fabrique et les
              présente en compétition.
            </p>

            <ol className="objectifs-list mt-10 border-t border-line">
              {OBJECTIFS.map((objectif, i) => (
                <li
                  key={objectif.titre}
                  className="objectif-item flex items-baseline gap-6 border-b border-line py-5"
                >
                  <span
                    className="font-mono text-sm text-energy"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base leading-relaxed text-ink-2">
                    <strong className="font-display text-[19px] font-medium tracking-[-0.02em] text-ink">
                      {objectif.titre}
                    </strong>{" "}
                    — {objectif.texte}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ Section 3 — Domaines ============ */}
      <section
        id="domaines"
        className="scroll-mt-16 border-b border-line bg-paper-2 py-16 md:py-24"
        aria-labelledby="titre-domaines"
      >
        <div className="container-qd">
          <div>
            <p className="label-mono text-energy">[ 02 — Domaines ]</p>
            <h2
              id="titre-domaines"
              className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
            >
              Nos trois terrains de jeu
            </h2>
          </div>

          <div className="domaines-grid mt-12 grid gap-6 md:grid-cols-3">
            {DOMAINES.map(domaine => (
              <article
                key={domaine.num}
                className="domaine-card group flex flex-col rounded border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-energy hover:shadow-hover"
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
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Section 4 — Histoire (section sombre) ============ */}
      <section
        className="histoire-section overflow-hidden border-b border-line-dark bg-ink py-16 text-[#F2F1EC] md:py-24"
        aria-labelledby="titre-histoire"
      >
        <div className="container-qd grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Gauche (6 col) — présentation */}
          <div className="lg:col-span-6">
            <div>
              <p className="label-mono text-energy-light">
                [ 03 — Notre démarche ]
              </p>
              <h2
                id="titre-histoire"
                className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] md:text-[40px]"
              >
                De la théorie à la pratique
              </h2>
            </div>

            <div className="mt-10 space-y-6 text-base leading-relaxed text-[#9AA39E]">
              <p>
                Quantum Dynamics est née de la volonté d'étudiantes et
                d'étudiants en ingénierie de passer de la théorie à la pratique
                : concevoir de vraies machines, les fabriquer de leurs mains,
                puis les confronter à la réalité d'une compétition.
              </p>
              <p>
                Au fil des projets, l'association s'est organisée autour de
                trois pôles techniques — transports, industrie et énergie —
                réunis dans un même atelier. Chaque génération de membres
                transmet à la suivante ses méthodes, ses outils et ses retours
                d'expérience.
              </p>
              <p>
                L'atelier reste le cœur de l'association : un lieu ouvert à
                toutes les filières, où chaque idée peut devenir un prototype.
              </p>
            </div>
          </div>

          {/* Droite (6 col) — image cadrée */}
          <div className="lg:col-span-6">
            <figure>
              <div className="relative overflow-hidden border border-line-dark bg-[#1B2320] p-2">
                <span
                  className="absolute -left-0.5 -top-0.5 z-10 h-4 w-4 border-l border-t border-[#9AA39E]"
                  aria-hidden="true"
                />
                <span
                  className="absolute -right-0.5 -top-0.5 z-10 h-4 w-4 border-r border-t border-[#9AA39E]"
                  aria-hidden="true"
                />
                <span
                  className="absolute -bottom-0.5 -left-0.5 z-10 h-4 w-4 border-b border-l border-[#9AA39E]"
                  aria-hidden="true"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 z-10 h-4 w-4 border-b border-r border-[#9AA39E]"
                  aria-hidden="true"
                />
                <AtelierEtabli className="aspect-[12/5] w-full" />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-[#9AA39E]">
                FIG. 03 — L'atelier, plan type
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ Section 5 — Le bureau ============ */}
      <section
        className="border-b border-line bg-paper py-16 md:py-24"
        aria-labelledby="titre-bureau"
      >
        <div className="container-qd">
          <div>
            <p className="label-mono text-energy">[ 04 — Le bureau ]</p>
            <h2
              id="titre-bureau"
              className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
            >
              Les personnes derrière les prototypes
            </h2>
            <p className="mt-3 max-w-[60ch] text-base text-ink-2">
              Le bureau est élu chaque année en assemblée générale.
            </p>
          </div>

          {members.isLoading ? (
            <div
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              role="status"
              aria-label="Chargement du bureau"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <MemberCardSkeleton key={i} />
              ))}
              <span className="sr-only">Chargement des membres du bureau…</span>
            </div>
          ) : members.isError ? (
            <p className="mt-12 rounded border border-line bg-white p-6 text-sm text-ink-2">
              La composition du bureau n'a pas pu être chargée pour le moment.
              Réessayez un peu plus tard.
            </p>
          ) : members.data && members.data.length > 0 ? (
            <div className="bureau-grid mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.data.map(membre => (
                <article
                  key={membre.id}
                  className="bureau-card group rounded border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-energy hover:shadow-hover"
                >
                  <div className="overflow-hidden border-b border-line">
                    <MemberAvatar
                      name={membre.name}
                      photoUrl={membre.photoUrl}
                      alt={`Portrait de ${membre.name}, ${membre.role} de Quantum Dynamics`}
                      className="aspect-square w-full"
                      imgClassName="object-cover transition-transform [transition-duration:400ms] ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-[19px] font-medium tracking-[-0.02em] text-ink">
                      {membre.name}
                    </h3>
                    <p className="mt-2 inline-block rounded border border-energy px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-energy transition-transform duration-200 group-hover:-translate-y-0.5">
                      {membre.role}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-2">
                      {membre.bio}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Aucun membre enregistré : placeholders neutres (aucun nom, aucune photo) */
            <div className="bureau-grid mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {BUREAU_PLACEHOLDERS.map(poste => (
                <article
                  key={poste.role}
                  className="bureau-card rounded border border-dashed border-line bg-white"
                >
                  <div className="flex aspect-square w-full flex-col items-center justify-center gap-4 border-b border-line bg-paper-2">
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-white text-ink-3"
                      aria-hidden="true"
                    >
                      <UserRound className="h-8 w-8" />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
                      {poste.initiales}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-[19px] font-medium tracking-[-0.02em] text-ink">
                      {poste.role}
                    </h3>
                    <p className="mt-2 inline-block rounded border border-line px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
                      À compléter via l'espace membres
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ Section 6 — Bandeau CTA ============ */}
      <section
        className="bg-paper-2 py-16 md:py-24"
        aria-labelledby="titre-cta"
      >
        <div className="container-qd text-center">
          <h2
            id="titre-cta"
            className="font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
          >
            Convaincu·e ?
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/rejoindre" className="btn-signal group">
              Rejoindre l'association
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/newsletter"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-energy transition-colors hover:text-energy-deep"
            >
              Lire notre newsletter
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
