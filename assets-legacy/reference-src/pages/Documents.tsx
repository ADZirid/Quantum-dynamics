import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  FolderOpen,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/providers/trpc'
import { CategoryTag } from '@/components/docs/PdfReaderShell'
import {
  CATEGORY_META,
  DOC_CATEGORIES,
  fileUrl,
  formatDateFR,
  formatFileSize,
  type DocCategory,
} from '@/components/docs/docs-utils'

type SortKey = 'recent' | 'oldest' | 'az' | 'za'

type DocItem = {
  id: number
  title: string
  category: DocCategory
  fileSize: number
  createdAt: Date
}

/* ------------------------------------------------------------------ */
/*  Menu déroulant de catégories à cases à cocher                      */
/* ------------------------------------------------------------------ */

function CategoryDropdown({
  selected,
  counts,
  onToggle,
  onSelectAll,
  onClearAll,
}: {
  selected: Set<DocCategory>
  counts: Partial<Record<DocCategory, number>>
  onToggle: (cat: DocCategory) => void
  onSelectAll: () => void
  onClearAll: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Fermeture par Échap + restitution du focus au bouton
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded border bg-white px-4 py-2.5 text-sm font-medium transition-colors md:w-auto',
          open ? 'border-energy text-ink' : 'border-line text-ink-2 hover:border-ink-3 hover:text-ink',
        )}
      >
        Catégories
        <span className="font-mono text-xs text-ink-3">
          {selected.size}/{DOC_CATEGORIES.length}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-ink-3 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Filtrer par catégorie"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 z-50 mt-2 w-72 origin-top-left rounded border border-line bg-white p-2 shadow-hover md:left-auto md:right-0 md:origin-top-right"
          >
            <fieldset>
              <legend className="sr-only">Catégories de documents</legend>
              {DOC_CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat]
                const checked = selected.has(cat)
                return (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-paper-2"
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      onChange={() => onToggle(cat)}
                    />
                    {/* Case custom : 16px, cochée = fond energy + coche blanche */}
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-energy',
                        checked ? 'border-energy bg-energy' : 'border-ink-3 bg-white',
                      )}
                      aria-hidden="true"
                    >
                      {checked && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.15 }}
                          className="flex"
                        >
                          <Check className="h-3 w-3 text-paper" strokeWidth={3} aria-hidden="true" />
                        </motion.span>
                      )}
                    </span>
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dotClass)} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{meta.label}</span>
                    <span className="ml-auto font-mono text-xs text-ink-3">({counts[cat] ?? 0})</span>
                  </label>
                )
              })}
            </fieldset>
            <div className="mt-1 flex items-center justify-between border-t border-line px-2 pt-2">
              <button
                type="button"
                className="text-[13px] font-medium text-energy underline-offset-2 hover:underline"
                onClick={onSelectAll}
              >
                Tout cocher
              </button>
              <button
                type="button"
                className="text-[13px] font-medium text-ink-3 underline-offset-2 hover:text-ink hover:underline"
                onClick={onClearAll}
              >
                Tout décocher
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Ligne de document (tableau-liste)                                  */
/* ------------------------------------------------------------------ */

function DocumentRow({ doc, index }: { doc: DocItem; index: number }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.5),
        ease: [0.16, 1, 0.3, 1],
        layout: { duration: 0.25 },
      }}
      className="group relative border-b border-line transition-colors hover:bg-paper-2"
    >
      {/* Filet gauche energy au survol */}
      <span
        className="absolute inset-y-0 left-0 w-0.5 bg-energy opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_200px_130px_230px] md:items-center md:gap-4">
        {/* Icône + nom + méta */}
        <div className="flex min-w-0 items-start gap-3">
          <FileText className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-3" aria-hidden="true" />
          <div className="min-w-0">
            <Link
              to={`/documents/${doc.id}`}
              className="block truncate text-[15px] font-medium text-ink transition-colors after:absolute after:inset-0 hover:text-energy"
            >
              {doc.title}
            </Link>
            <p className="mt-0.5 font-mono text-xs text-ink-3">
              Ajouté le {formatDateFR(doc.createdAt)} · PDF · {formatFileSize(doc.fileSize)}
            </p>
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <CategoryTag category={doc.category} short className="md:hidden" />
          <CategoryTag category={doc.category} className="hidden md:inline-flex" />
        </div>

        {/* Date */}
        <p className="hidden font-mono text-[13px] text-ink-2 md:block">
          {formatDateFR(doc.createdAt)}
        </p>

        {/* Actions (au-dessus du lien étiré) */}
        <div className="relative z-10 flex items-center gap-2 md:justify-end">
          <Link to={`/documents/${doc.id}`} className="btn-quiet px-3 py-1.5">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Voir
          </Link>
          <a
            href={fileUrl('document', doc.id, true)}
            download
            className="btn-quiet px-3 py-1.5"
            aria-label={`Télécharger ${doc.title} (PDF, ${formatFileSize(doc.fileSize)})`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Télécharger
          </a>
        </div>
      </div>
    </motion.li>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Documents                                                     */
/* ------------------------------------------------------------------ */

export default function Documents() {
  const rootRef = useRef<HTMLDivElement>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<DocCategory>>(() => new Set(DOC_CATEGORIES))
  const [sort, setSort] = useState<SortKey>('recent')

  // Recherche côté serveur, déclenchée après 300 ms d'inactivité
  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const allSelected = selected.size === DOC_CATEGORIES.length

  // Liste filtrée (recherche + catégories côté serveur)
  const queryInput = useMemo(
    () => ({
      categories: allSelected ? undefined : Array.from(selected),
      search: search || undefined,
    }),
    [allSelected, selected, search],
  )
  const listQuery = trpc.documents.list.useQuery(queryInput, {
    enabled: selected.size > 0,
    placeholderData: (prev) => prev,
  })

  // Totaux par catégorie (compteurs du dropdown), indépendants des filtres
  const allQuery = trpc.documents.list.useQuery(undefined, {
    placeholderData: (prev) => prev,
  })
  const counts = useMemo(() => {
    const acc: Partial<Record<DocCategory, number>> = {}
    for (const d of allQuery.data ?? []) {
      const cat = d.category as DocCategory
      acc[cat] = (acc[cat] ?? 0) + 1
    }
    return acc
  }, [allQuery.data])

  // Tri côté client
  const docs = useMemo(() => {
    const rows = [...((listQuery.data ?? []) as DocItem[])]
    switch (sort) {
      case 'oldest':
        return rows.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
      case 'az':
        return rows.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
      case 'za':
        return rows.sort((a, b) => b.title.localeCompare(a.title, 'fr'))
      default:
        return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    }
  }, [listQuery.data, sort])

  const filtersActive = search !== '' || !allSelected

  const toggleCategory = (cat: DocCategory) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setSelected(new Set(DOC_CATEGORIES))
    setSort('recent')
  }

  // Résumé des filtres actifs pour le compteur de résultats
  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (search) parts.push(`recherche « ${search} »`)
    if (!allSelected) {
      const labels = Array.from(selected).map((c) => CATEGORY_META[c].short)
      parts.push(selected.size > 0 ? `catégories : ${labels.join(', ')}` : 'aucune catégorie')
    }
    return parts.join(' · ')
  }, [search, allSelected, selected])

  /* Contenu toujours visible : aucune animation d'opacité au chargement. */

  const totalPublished = allQuery.data?.length ?? 0
  const nothingPublished =
    !allQuery.isLoading && !listQuery.isLoading && !filtersActive && totalPublished === 0

  return (
    <div ref={rootRef}>
      {/* ============ Section 1 — En-tête ============ */}
      <section className="relative overflow-hidden border-b border-line bg-paper py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url(/texture-grid.svg)', backgroundSize: '512px 512px' }}
          aria-hidden="true"
        />
        <div className="container-qd relative">
          <p className="docs-label label-mono text-energy">[ Documents officiels ]</p>
          <h1 className="docs-title mt-5 max-w-[18ch] font-display text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
            Les documents de l'association
          </h1>
          <p className="docs-lead mt-6 max-w-[62ch] text-[17px] leading-relaxed text-ink-2 md:text-xl">
            Procès-verbaux, assemblées générales, partenariats, bilans comptables : le bureau
            publie ici les documents officiels de Quantum Dynamics, en toute transparence.
            Filtrez par catégorie ou recherchez par nom.
          </p>
        </div>
      </section>

      {/* ============ Section 2 — Barre de recherche & filtres (sticky) ============ */}
      <div className="sticky top-16 z-40 border-b border-line bg-paper/95 backdrop-blur-[8px]">
        <div className="container-qd flex flex-col gap-3 py-4 md:flex-row md:items-center">
          {/* Recherche par nom */}
          <div className="relative min-w-[260px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
            <label htmlFor="recherche-document" className="sr-only">
              Rechercher un document par son nom
            </label>
            <input
              id="recherche-document"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un document par son nom…"
              className="w-full rounded border border-line bg-white py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-ink-3 focus:border-energy"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Effacer la recherche"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-ink-3 transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Catégories (dropdown à cases à cocher) + pastilles */}
          <div className="flex flex-wrap items-center gap-2">
            <CategoryDropdown
              selected={selected}
              counts={counts}
              onToggle={toggleCategory}
              onSelectAll={() => setSelected(new Set(DOC_CATEGORIES))}
              onClearAll={() => setSelected(new Set())}
            />
            <AnimatePresence>
              {!allSelected &&
                Array.from(selected).map((cat) => (
                  <motion.span
                    key={cat}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em]',
                      CATEGORY_META[cat].tagClass,
                    )}
                  >
                    {CATEGORY_META[cat].short}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      aria-label={`Retirer le filtre ${CATEGORY_META[cat].label}`}
                      className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-ink/10"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>

          {/* Tri */}
          <div className="relative">
            <label htmlFor="tri-documents" className="sr-only">
              Trier les documents
            </label>
            <select
              id="tri-documents"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full appearance-none rounded border border-line bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-ink-2 md:w-auto"
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="az">Nom A→Z</option>
              <option value="za">Nom Z→A</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* ============ Section 3 — Liste des documents ============ */}
      <section className="bg-paper py-10 md:py-14" aria-labelledby="titre-liste">
        <div className="container-qd">
          <h2 id="titre-liste" className="sr-only">
            Liste des documents
          </h2>

          {/* Erreur réseau */}
          {listQuery.isError && (
            <div className="mx-auto max-w-xl rounded border border-danger/40 bg-white p-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
              <p className="mt-4 font-display text-lg font-medium text-ink">
                Impossible de charger les documents.
              </p>
              <button type="button" className="btn-secondary mt-6" onClick={() => listQuery.refetch()}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Réessayer
              </button>
            </div>
          )}

          {/* Chargement : 5 lignes squelettes */}
          {!listQuery.isError && listQuery.isLoading && (
            <ul aria-busy="true" aria-label="Chargement des documents">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-center gap-4 border-b border-line px-4 py-4">
                  <div className="h-[18px] w-[18px] animate-pulse rounded bg-paper-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/5 animate-pulse rounded bg-paper-2" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-paper-2" />
                  </div>
                  <div className="hidden h-6 w-28 animate-pulse rounded bg-paper-2 md:block" />
                  <div className="hidden h-4 w-20 animate-pulse rounded bg-paper-2 md:block" />
                </li>
              ))}
            </ul>
          )}

          {/* Liste vide absolue (aucun document publié) */}
          {!listQuery.isError && nothingPublished && (
            <div className="flex flex-col items-center rounded border border-dashed border-line bg-paper-2 p-10 text-center">
              <FolderOpen className="h-10 w-10 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-4 font-display text-lg font-medium text-ink">
                Les premiers documents seront publiés après la prochaine assemblée générale.
              </p>
            </div>
          )}

          {/* Résultats */}
          {!listQuery.isError && !listQuery.isLoading && !nothingPublished && (
            <>
              {/* Compteur de résultats + réinitialisation */}
              <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-mono text-[13px] text-ink-3" role="status">
                  {docs.length} document{docs.length > 1 ? 's' : ''}
                  {filterSummary ? ` — ${filterSummary}` : ''}
                </p>
                {filtersActive && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[13px] font-medium text-energy underline-offset-2 hover:underline"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>

              {docs.length > 0 ? (
                <>
                  {/* En-tête de liste (desktop) */}
                  <div
                    className="hidden grid-cols-[minmax(0,1fr)_200px_130px_230px] gap-4 border-b border-line px-4 pb-2 md:grid"
                    aria-hidden="true"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Document</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Catégorie</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Date</span>
                    <span className="text-right font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Actions</span>
                  </div>
                  <motion.ul layout className="border-t border-line md:border-t-0">
                    <AnimatePresence mode="popLayout">
                      {docs.map((doc, i) => (
                        <DocumentRow key={doc.id} doc={doc} index={i} />
                      ))}
                    </AnimatePresence>
                  </motion.ul>
                </>
              ) : (
                /* Aucun résultat (filtres actifs) */
                <div className="flex flex-col items-center rounded border border-dashed border-line bg-white p-10 text-center">
                  <FolderOpen className="h-10 w-10 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-4 font-display text-lg font-medium text-ink">
                    Aucun document ne correspond à votre recherche.
                  </p>
                  <button type="button" className="btn-quiet mt-5" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
