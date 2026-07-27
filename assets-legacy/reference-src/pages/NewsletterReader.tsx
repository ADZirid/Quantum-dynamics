import { Link, useNavigate, useParams } from 'react-router'
import { AlertTriangle, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import PdfReaderShell, {
  ReaderNotFound,
  ReaderSkeleton,
} from '@/components/docs/PdfReaderShell'
import { formatDateFR, formatFileSize } from '@/components/docs/docs-utils'

/**
 * Lecteur d'édition de newsletter (/newsletter/:id).
 * Clavier : Échap → archives ; ← édition précédente ; → édition suivante.
 */
export default function NewsletterReader() {
  const { id: rawId } = useParams()
  const navigate = useNavigate()
  const id = Number(rawId)
  const validId = Number.isInteger(id) && id > 0

  const query = trpc.newsletters.get.useQuery(
    { id },
    { enabled: validId, retry: false },
  )
  // Liste pour la navigation précédente / suivante (triée : plus récente d'abord)
  const listQuery = trpc.newsletters.list.useQuery(undefined, { enabled: validId })

  if (!validId) {
    return (
      <ReaderNotFound
        message="Cette édition est introuvable."
        backTo="/newsletter"
        backLabel="Retour aux éditions"
      />
    )
  }

  if (query.isLoading) {
    return <ReaderSkeleton />
  }

  if (query.isError) {
    const notFound = query.error?.data?.code === 'NOT_FOUND'
    if (notFound) {
      return (
        <ReaderNotFound
          message="Cette édition est introuvable."
          backTo="/newsletter"
          backLabel="Retour aux éditions"
        />
      )
    }
    return (
      <section className="container-qd flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
          Impossible de charger cette édition.
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-secondary" onClick={() => query.refetch()}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réessayer
          </button>
          <Link to="/newsletter" className="btn-quiet">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour aux éditions
          </Link>
        </div>
      </section>
    )
  }

  const edition = query.data
  if (!edition) {
    return (
      <ReaderNotFound
        message="Cette édition est introuvable."
        backTo="/newsletter"
        backLabel="Retour aux éditions"
      />
    )
  }

  // Précédente = publiée avant (plus ancienne) ; suivante = plus récente
  const list = listQuery.data ?? []
  const index = list.findIndex((n) => n.id === edition.id)
  const older = index >= 0 ? list[index + 1] : undefined
  const newer = index > 0 ? list[index - 1] : undefined

  return (
    <PdfReaderShell
      kind="newsletter"
      id={edition.id}
      title={edition.title}
      tag={
        <span className="inline-flex shrink-0 items-center rounded border border-energy px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-energy">
          Newsletter
        </span>
      }
      metaLine={`${edition.edition} · Publiée le ${formatDateFR(edition.publishedAt)} · PDF · ${formatFileSize(edition.fileSize)}`}
      backTo="/newsletter"
      backLabel="Retour aux éditions"
      onPrev={older ? () => navigate(`/newsletter/${older.id}`) : undefined}
      onNext={newer ? () => navigate(`/newsletter/${newer.id}`) : undefined}
      footerNav={
        <nav
          className="mt-10 grid gap-4 border-y border-line py-5 sm:grid-cols-2"
          aria-label="Navigation entre éditions"
        >
          {older ? (
            <Link to={`/newsletter/${older.id}`} className="group min-w-0">
              <span className="inline-flex items-center gap-1.5 font-mono text-[13px] text-ink-3 transition-colors group-hover:text-energy">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Édition précédente
              </span>
              <span className="mt-1 block truncate text-sm font-medium text-ink transition-colors group-hover:text-energy">
                {older.title}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {newer ? (
            <Link to={`/newsletter/${newer.id}`} className="group min-w-0 sm:text-right">
              <span className="inline-flex items-center gap-1.5 font-mono text-[13px] text-ink-3 transition-colors group-hover:text-energy sm:flex-row-reverse">
                Édition suivante
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="mt-1 block truncate text-sm font-medium text-ink transition-colors group-hover:text-energy">
                {newer.title}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      }
    />
  )
}
