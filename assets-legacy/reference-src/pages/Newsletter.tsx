import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Download,
  FileText,
  Newspaper,
  RotateCcw,
  Search,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  fileUrl,
  formatDateFR,
  formatFileSize,
} from "@/components/docs/docs-utils";

const PAGE_SIZE = 9;

type EditionItem = {
  id: number;
  title: string;
  edition: string;
  summary: string;
  fileSize: number;
  publishedAt: Date;
};

/** Vignette de remplacement « blueprint » (édition sans miniature dédiée). */
function PlaceholderVignette({
  edition,
  large = false,
}: {
  edition: string;
  large?: boolean;
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-paper-2"
      style={{
        backgroundImage: "url(/texture-grid.svg)",
        backgroundSize: "256px 256px",
      }}
      aria-hidden="true"
    >
      <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-ink-3/60" />
      <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-ink-3/60" />
      <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-ink-3/60" />
      <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-ink-3/60" />
      <FileText
        className={large ? "h-10 w-10 text-ink-3" : "h-7 w-7 text-ink-3"}
        strokeWidth={1.5}
      />
      <span className="max-w-[80%] truncate px-3 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
        {edition}
      </span>
    </div>
  );
}

/** Carte d'édition dans la grille d'archives (Framer Motion : layout uniquement,
    jamais d'animation d'opacité — le contenu reste toujours visible). */
function ArchiveCard({ item }: { item: EditionItem }) {
  return (
    <motion.article
      layout
      transition={{
        layout: { duration: 0.3 },
      }}
      className="group relative flex flex-col rounded border border-line bg-white transition-[border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-energy hover:shadow-hover"
    >
      {/* Vignette */}
      <div className="aspect-[4/3] overflow-hidden border-b border-line">
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]">
          <PlaceholderVignette edition={item.edition} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-energy">
          Newsletter
        </p>
        <h3 className="mt-2 font-display text-lg font-medium tracking-[-0.02em] text-ink">
          {/* Lien étiré : toute la carte ouvre le lecteur */}
          <Link
            to={`/newsletter/${item.id}`}
            className="after:absolute after:inset-0"
          >
            {item.title}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-xs text-ink-3">
          {formatDateFR(item.publishedAt)} · PDF ·{" "}
          {formatFileSize(item.fileSize)}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-energy">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Lire
          </span>
          {/* Au-dessus du lien étiré : téléchargement direct sans ouvrir le lecteur */}
          <a
            href={fileUrl("newsletter", item.id, true)}
            download
            className="btn-quiet relative z-10 px-3 py-1.5"
            aria-label={`Télécharger ${item.title} (PDF, ${formatFileSize(item.fileSize)})`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default function Newsletter() {
  const listQuery = trpc.newsletters.list.useQuery();

  const [search, setSearch] = useState("");
  const [year, setYear] = useState<"all" | number>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const editions = useMemo(
    () => (listQuery.data ?? []) as EditionItem[],
    [listQuery.data]
  );
  const featured = editions[0];

  // Années disponibles, dérivées des données (tri décroissant)
  const years = useMemo(
    () =>
      Array.from(
        new Set(editions.map(e => new Date(e.publishedAt).getFullYear()))
      ).sort((a, b) => b - a),
    [editions]
  );

  // Recherche / filtre par année — côté client
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return editions.filter(e => {
      if (year !== "all" && new Date(e.publishedAt).getFullYear() !== year)
        return false;
      if (!term) return true;
      return (
        e.title.toLowerCase().includes(term) ||
        e.edition.toLowerCase().includes(term) ||
        e.summary.toLowerCase().includes(term)
      );
    });
  }, [editions, search, year]);

  const visible = filtered.slice(0, visibleCount);

  const resetFilters = () => {
    setSearch("");
    setYear("all");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div>
      {/* ============ Section 1 — En-tête ============ */}
      <section className="relative overflow-hidden border-b border-line bg-paper py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "url(/texture-grid.svg)",
            backgroundSize: "512px 512px",
          }}
          aria-hidden="true"
        />
        <div className="container-qd relative">
          <p className="nl-label label-mono text-energy">[ Newsletter ]</p>
          <h1 className="nl-title mt-5 max-w-[16ch] font-display text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
            Le journal de l'atelier
          </h1>
          <p className="nl-lead mt-6 max-w-[62ch] text-[17px] leading-relaxed text-ink-2 md:text-xl">
            Chaque mois, le bureau publie une édition : activités organisées,
            projets en cours, coulisses des compétitions et toutes les
            informations de la vie associative. Cliquez sur une édition pour la
            lire ici même, ou téléchargez-la.
          </p>
        </div>
      </section>

      {/* ============ États de chargement / erreur ============ */}
      {listQuery.isLoading && (
        <section
          className="bg-paper py-16 md:py-24"
          aria-busy="true"
          aria-label="Chargement des éditions"
        >
          <div className="container-qd">
            <div className="grid gap-8 rounded border border-line bg-white p-6 lg:grid-cols-12">
              <div className="aspect-[3/4] animate-pulse rounded bg-paper-2 lg:col-span-5" />
              <div className="flex flex-col gap-4 lg:col-span-7">
                <div className="h-4 w-40 animate-pulse rounded bg-paper-2" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-paper-2" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-paper-2" />
                <div className="h-20 w-full animate-pulse rounded bg-paper-2" />
                <div className="mt-auto flex gap-3">
                  <div className="h-11 w-48 animate-pulse rounded bg-paper-2" />
                  <div className="h-11 w-48 animate-pulse rounded bg-paper-2" />
                </div>
              </div>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded border border-line bg-white">
                  <div className="aspect-[4/3] animate-pulse bg-paper-2" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-24 animate-pulse rounded bg-paper-2" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-paper-2" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-paper-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {listQuery.isError && (
        <section className="bg-paper py-16 md:py-24">
          <div className="container-qd">
            <div className="mx-auto max-w-xl rounded border border-danger/40 bg-white p-8 text-center">
              <AlertTriangle
                className="mx-auto h-8 w-8 text-danger"
                aria-hidden="true"
              />
              <p className="mt-4 font-display text-lg font-medium text-ink">
                Impossible de charger les éditions.
              </p>
              <p className="mt-1 text-sm text-ink-3">
                Vérifiez votre connexion puis réessayez.
              </p>
              <button
                type="button"
                className="btn-secondary mt-6"
                onClick={() => listQuery.refetch()}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Réessayer
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============ Section 2 — Édition à la une ============ */}
      {!listQuery.isLoading && !listQuery.isError && (
        <>
          {featured ? (
            <section
              className="bg-paper py-16 md:py-24"
              aria-labelledby="titre-une"
            >
              <div className="container-qd">
                <div className="grid gap-8 rounded border border-line bg-white p-6 md:p-8 lg:grid-cols-12">
                  {/* Gauche — vignette (première page du PDF, ratio 3:4) */}
                  <div className="lg:col-span-5">
                    <figure className="featured-fig">
                      <Link
                        to={`/newsletter/${featured.id}`}
                        className="group relative block border border-line"
                        aria-label={`Lire ${featured.title} dans le navigateur`}
                      >
                        <div className="aspect-[3/4] w-full overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                          {/* Rendu natif de la 1ʳᵉ page ; repli = vignette blueprint */}
                          <object
                            data={`${fileUrl("newsletter", featured.id)}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                            type="application/pdf"
                            className="pointer-events-none h-full w-full"
                            aria-hidden="true"
                          >
                            <PlaceholderVignette
                              edition={featured.edition}
                              large
                            />
                          </object>
                        </div>
                      </Link>
                      <figcaption className="mt-3 font-mono text-xs text-ink-3">
                        {featured.edition} — première page
                      </figcaption>
                    </figure>
                  </div>

                  {/* Droite — métadonnées + actions */}
                  <div className="featured-txt flex flex-col lg:col-span-7">
                    <p className="label-mono text-signal">
                      [ Dernière édition ]
                    </p>
                    <h2
                      id="titre-une"
                      className="mt-3 font-display text-[24px] font-medium leading-snug tracking-[-0.02em] text-ink md:text-[28px]"
                    >
                      {featured.title}
                    </h2>
                    <p className="mt-2 font-mono text-[13px] text-ink-3">
                      Publiée le {formatDateFR(featured.publishedAt)}
                    </p>
                    <p className="mt-4 line-clamp-3 text-base leading-relaxed text-ink-2">
                      {featured.summary}
                    </p>
                    <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-ink-3">
                      PDF · {formatFileSize(featured.fileSize)}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        to={`/newsletter/${featured.id}`}
                        className="btn-primary"
                      >
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        Lire dans le navigateur
                      </Link>
                      <a
                        href={fileUrl("newsletter", featured.id, true)}
                        download
                        className="btn-secondary"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Télécharger le PDF
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* État vide — aucune édition publiée */
            <section className="bg-paper py-16 md:py-24">
              <div className="container-qd">
                <div className="mx-auto flex max-w-xl flex-col items-center rounded border border-line bg-paper-2 p-10 text-center">
                  <Newspaper
                    className="h-10 w-10 text-ink-3"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="mt-5 font-display text-xl font-medium tracking-[-0.02em] text-ink">
                    La première édition arrive bientôt.
                  </p>
                  <p className="mt-2 text-sm text-ink-3">
                    La première édition est en cours de rédaction — revenez
                    bientôt.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ============ Section 3 — Archives ============ */}
          {editions.length > 0 && (
            <section
              className="border-t border-line bg-paper pb-16 md:pb-24"
              aria-labelledby="titre-archives"
            >
              <div className="container-qd pt-16 md:pt-24">
                <div className="nl-reveal flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="label-mono text-energy">[ Archives ]</p>
                    <h2
                      id="titre-archives"
                      className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]"
                    >
                      Toutes les éditions
                    </h2>
                  </div>
                  <p className="font-mono text-[13px] text-ink-3">
                    {editions.length} édition{editions.length > 1 ? "s" : ""}{" "}
                    publiée
                    {editions.length > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Barre d'outils : recherche + filtre année */}
                <div className="nl-reveal mt-8 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                      aria-hidden="true"
                    />
                    <label htmlFor="recherche-edition" className="sr-only">
                      Rechercher une édition
                    </label>
                    <input
                      id="recherche-edition"
                      type="search"
                      value={search}
                      onChange={e => {
                        setSearch(e.target.value);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      placeholder="Rechercher une édition…"
                      className="w-full rounded border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-energy"
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="filtre-annee" className="sr-only">
                      Filtrer par année
                    </label>
                    <select
                      id="filtre-annee"
                      value={year}
                      onChange={e => {
                        setYear(
                          e.target.value === "all"
                            ? "all"
                            : Number(e.target.value)
                        );
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className="w-full appearance-none rounded border border-line bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-ink-2 sm:w-auto"
                    >
                      <option value="all">Toutes les années</option>
                      {years.map(y => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Grille des éditions */}
                {visible.length > 0 ? (
                  <>
                    <motion.div
                      layout
                      className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                      <AnimatePresence mode="popLayout">
                        {visible.map(item => (
                          <ArchiveCard key={item.id} item={item} />
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {filtered.length > visibleCount && (
                      <div className="mt-10 text-center">
                        <button
                          type="button"
                          className="btn-quiet"
                          onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                        >
                          Charger plus d'éditions
                          <span className="font-mono text-xs text-ink-3">
                            ({filtered.length - visibleCount} restantes)
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-10 flex flex-col items-center rounded border border-dashed border-line bg-white p-10 text-center">
                    <Search
                      className="h-8 w-8 text-ink-3"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <p className="mt-4 font-display text-lg font-medium text-ink">
                      Aucune édition ne correspond à votre recherche.
                    </p>
                    <button
                      type="button"
                      className="btn-quiet mt-5"
                      onClick={resetFilters}
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
