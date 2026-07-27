import { useRef } from 'react'
import type { ReactNode } from 'react'

export type LegalSection = {
  id: string
  title: string
  content: ReactNode
}

type LegalPageProps = {
  title: string
  updatedAt: string
  intro?: ReactNode
  sections: LegalSection[]
}

/**
 * Gabarit éditorial commun aux pages légales (legal.md) :
 * en-tête sobre, sommaire discret, sections numérotées séparées par des filets.
 */
export function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  /* Contenu toujours visible : aucune animation d'opacité au scroll/chargement. */

  return (
    <div ref={rootRef} className="bg-paper py-16 md:py-24">
      <div className="container-qd">
        {/* En-tête */}
        <header className="legal-header max-w-[720px]">
          <p className="label-mono text-energy">[ Légal ]</p>
          <h1 className="mt-5 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-ink md:text-[44px]">
            {title}
          </h1>
          <p className="mt-4 font-mono text-[13px] text-ink-3">
            Dernière mise à jour : {updatedAt}
          </p>
          {intro && <div className="mt-6 text-base leading-[1.7] text-ink-2">{intro}</div>}
        </header>

        {/* Sommaire */}
        <nav aria-label="Sommaire" className="mt-10 max-w-[720px] rounded border border-line bg-white p-6">
          <p className="label-mono text-[11px] text-ink-3">Sommaire</p>
          <ol className="mt-3 space-y-2">
            {sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm font-medium text-energy underline-offset-4 transition-colors hover:text-energy-deep hover:underline"
                >
                  {String(i + 1).padStart(2, '0')} — {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Corps */}
        <div className="mt-12 max-w-[720px]">
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className="legal-section scroll-mt-24 border-t border-line py-10 first:border-t-0 first:pt-0"
              aria-labelledby={`${section.id}-titre`}
            >
              <h2
                id={`${section.id}-titre`}
                className="flex items-baseline gap-4 font-display text-[22px] font-medium tracking-[-0.02em] text-ink"
              >
                <span className="font-mono text-sm text-energy" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {section.title}
              </h2>
              <div className="mt-5 space-y-4 text-base leading-[1.7] text-ink-2">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- Contenu — Politique de confidentialité ---------- */

const SECTIONS: LegalSection[] = [
  {
    id: 'editeur',
    title: 'Éditeur du site',
    content: (
      <>
        <p>
          Le site est édité par <strong className="font-semibold text-ink">Quantum Dynamics</strong>,
          association étudiante régie par la loi du 1ᵉʳ juillet 1901.
        </p>
        <ul className="space-y-1.5">
          <li>
            <strong className="font-medium text-ink">Siège :</strong> 50 rue de Sèvres, 92410 Ville
            d'Avray
          </li>
          <li>
            <strong className="font-medium text-ink">SIRET :</strong>{' '}
            <span className="font-mono text-[15px]">993 125 129 00011</span>
          </li>
          <li>
            <strong className="font-medium text-ink">Contact :</strong>{' '}
            <a
              href="mailto:quantumdynamics.asso@gmail.com"
              className="text-energy underline underline-offset-2 transition-colors hover:text-energy-deep"
            >
              quantumdynamics.asso@gmail.com
            </a>
          </li>
        </ul>
        <p>
          Quantum Dynamics est le responsable du traitement des données personnelles collectées sur
          ce site, au sens du Règlement général sur la protection des données (RGPD).
        </p>
      </>
    ),
  },
  {
    id: 'donnees-collectees',
    title: 'Données collectées',
    content: (
      <>
        <p>Nous collectons uniquement les données nécessaires au fonctionnement de l'association :</p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>
            <strong className="font-medium text-ink">Formulaire d'adhésion :</strong> nom, prénom,
            adresse email, études suivies et message de motivation (facultatif).
          </li>
          <li>
            <strong className="font-medium text-ink">Espace membres :</strong> données techniques de
            session nécessaires à la connexion sécurisée.
          </li>
        </ul>
        <p>
          Aucune donnée de navigation n'est collectée à des fins publicitaires, et aucun outil de
          mesure d'audience tiers n'est utilisé.
        </p>
      </>
    ),
  },
  {
    id: 'finalites',
    title: 'Finalités du traitement',
    content: (
      <>
        <p>Les données collectées sont utilisées exclusivement pour :</p>
        <ul className="list-disc space-y-1.5 pl-6">
          <li>le traitement des candidatures d'adhésion et la réponse du bureau ;</li>
          <li>la gestion des membres et la diffusion de la newsletter ;</li>
          <li>la publication des documents officiels et des éditions mensuelles.</li>
        </ul>
        <p>
          Ces traitements reposent sur votre <strong className="font-medium text-ink">consentement</strong>{' '}
          (case à cocher du formulaire d'adhésion) et sur l'
          <strong className="font-medium text-ink">intérêt légitime</strong> de l'association à gérer
          sa vie associative.
        </p>
      </>
    ),
  },
  {
    id: 'destinataires',
    title: 'Destinataires des données',
    content: (
      <p>
        Vos données sont accessibles aux <strong className="font-medium text-ink">membres du bureau
        uniquement</strong>. Les candidatures sont notifiées par email à l'adresse du bureau
        (quantumdynamics.asso@gmail.com). Aucune donnée n'est vendue, cédée ou transmise à des tiers
        à quelque fin que ce soit.
      </p>
    ),
  },
  {
    id: 'duree-conservation',
    title: 'Durée de conservation',
    content: (
      <ul className="list-disc space-y-1.5 pl-6">
        <li>
          <strong className="font-medium text-ink">Candidatures :</strong> 12 mois maximum après
          réception, puis suppression.
        </li>
        <li>
          <strong className="font-medium text-ink">Données de session :</strong> durée de la session
          uniquement.
        </li>
        <li>
          <strong className="font-medium text-ink">Documents publics :</strong> durée de vie de
          l'association (archives associatives).
        </li>
      </ul>
    ),
  },
  {
    id: 'droits',
    title: 'Vos droits (RGPD)',
    content: (
      <>
        <p>
          Conformément au RGPD, vous disposez des droits d'
          <strong className="font-medium text-ink">accès</strong>, de{' '}
          <strong className="font-medium text-ink">rectification</strong>, d'
          <strong className="font-medium text-ink">effacement</strong>, d'
          <strong className="font-medium text-ink">opposition</strong> et de{' '}
          <strong className="font-medium text-ink">portabilité</strong> concernant vos données
          personnelles.
        </p>
        <p>
          Pour exercer ces droits, écrivez à{' '}
          <a
            href="mailto:quantumdynamics.asso@gmail.com"
            className="text-energy underline underline-offset-2 transition-colors hover:text-energy-deep"
          >
            quantumdynamics.asso@gmail.com
          </a>
          . Nous répondons à toute demande sous 30 jours. Vous pouvez également saisir la CNIL (
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noreferrer"
            className="text-energy underline underline-offset-2 transition-colors hover:text-energy-deep"
          >
            cnil.fr
          </a>
          ) si vous estimez que vos droits ne sont pas respectés.
        </p>
      </>
    ),
  },
  {
    id: 'securite',
    title: 'Sécurité',
    content: (
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos
        données : chiffrement des échanges (HTTPS), mots de passe hashés, accès restreint à
        l'espace d'administration et limitation du nombre d'envois des formulaires.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    content: (
      <>
        <p>
          Ce site n'utilise qu'un <strong className="font-medium text-ink">cookie technique de
          session</strong>, strictement nécessaire au fonctionnement de l'espace membres. Aucun
          cookie publicitaire, de mesure d'audience ou de traçage tiers n'est déposé.
        </p>
        <p>
          Ce cookie technique étant exempté de consentement, aucune bannière de consentement n'est
          requise sur ce site.
        </p>
      </>
    ),
  },
]

export default function PolitiqueConfidentialite() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="15 janvier 2025"
      intro={
        <p>
          Cette page explique quelles données personnelles Quantum Dynamics collecte, pourquoi, et
          comment exercer vos droits. Pour toute question, contactez le bureau à{' '}
          <a
            href="mailto:quantumdynamics.asso@gmail.com"
            className="text-energy underline underline-offset-2 transition-colors hover:text-energy-deep"
          >
            quantumdynamics.asso@gmail.com
          </a>
          .
        </p>
      }
      sections={SECTIONS}
    />
  )
}
