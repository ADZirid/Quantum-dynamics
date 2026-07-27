import { Link, useParams } from 'react-router'
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import PdfReaderShell, {
  CategoryTag,
  ReaderNotFound,
  ReaderSkeleton,
} from '@/components/docs/PdfReaderShell'
import {
  formatDateFR,
  formatFileSize,
  type DocCategory,
} from '@/components/docs/docs-utils'

/**
 * Lecteur de document officiel (/documents/:id).
 * Identique au lecteur de newsletter, avec tag de catégorie coloré.
 */
export default function DocumentReader() {
  const { id: rawId } = useParams()
  const id = Number(rawId)
  const validId = Number.isInteger(id) && id > 0

  const query = trpc.documents.get.useQuery({ id }, { enabled: validId, retry: false })

  if (!validId) {
    return (
      <ReaderNotFound
        message="Ce document est introuvable."
        backTo="/documents"
        backLabel="Retour aux documents"
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
          message="Ce document est introuvable."
          backTo="/documents"
          backLabel="Retour aux documents"
        />
      )
    }
    return (
      <section className="container-qd flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
          Impossible de charger ce document.
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-secondary" onClick={() => query.refetch()}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réessayer
          </button>
          <Link to="/documents" className="btn-quiet">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour aux documents
          </Link>
        </div>
      </section>
    )
  }

  const doc = query.data
  if (!doc) {
    return (
      <ReaderNotFound
        message="Ce document est introuvable."
        backTo="/documents"
        backLabel="Retour aux documents"
      />
    )
  }

  return (
    <PdfReaderShell
      kind="document"
      id={doc.id}
      title={doc.title}
      tag={<CategoryTag category={doc.category as DocCategory} className="shrink-0" />}
      metaLine={`Ajouté le ${formatDateFR(doc.createdAt)} · PDF · ${formatFileSize(doc.fileSize)}`}
      backTo="/documents"
      backLabel="Retour aux documents"
    />
  )
}
