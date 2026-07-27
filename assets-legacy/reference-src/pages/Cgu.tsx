import { Link } from 'react-router'
import { LegalPage } from '@/pages/PolitiqueConfidentialite'
import type { LegalSection } from '@/pages/PolitiqueConfidentialite'

const SECTIONS: LegalSection[] = [
  {
    id: 'objet',
    title: 'Objet',
    content: (
      <p>
        Les présentes conditions générales d'utilisation (CGU) encadrent l'accès et l'utilisation
        du site de <strong className="font-medium text-ink">Quantum Dynamics</strong>. Elles
        s'appliquent aux espaces publics du site — newsletter, documents officiels, formulaire
        d'adhésion — ainsi qu'à l'espace réservé aux membres. En naviguant sur ce site, vous
        acceptez ces conditions.
      </p>
    ),
  },
  {
    id: 'editeur',
    title: 'Éditeur & identification',
    content: (
      <ul className="space-y-1.5">
        <li>
          <strong className="font-medium text-ink">Éditeur :</strong> Quantum Dynamics, association
          étudiante régie par la loi du 1ᵉʳ juillet 1901
        </li>
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
    ),
  },
  {
    id: 'acces',
    title: 'Accès au site',
    content: (
      <>
        <p>
          L'accès aux espaces publics du site (présentation, newsletter, documents, formulaire
          d'adhésion) est <strong className="font-medium text-ink">gratuit</strong> et ouvert à
          toute personne.
        </p>
        <p>
          L'espace membres est réservé aux personnes autorisées par le bureau de l'association.
          Toute tentative d'accès non autorisé à cet espace est interdite et pourra donner lieu aux
          poursuites prévues par la loi.
        </p>
      </>
    ),
  },
  {
    id: 'propriete-intellectuelle',
    title: 'Propriété intellectuelle',
    content: (
      <p>
        L'ensemble des contenus du site — textes, journaux, documents, images et prototypes
        présentés — est la propriété de Quantum Dynamics, sauf mention contraire. Le téléchargement
        des documents est autorisé pour un usage personnel et d'information. Toute reproduction ou
        diffusion publique des contenus est soumise à l'autorisation écrite préalable du bureau.
      </p>
    ),
  },
  {
    id: 'documents-officiels',
    title: 'Documents officiels',
    content: (
      <p>
        Les procès-verbaux, bilans et conventions publiés sur ce site le sont à titre de
        transparence envers les membres et les partenaires de l'association.{' '}
        <strong className="font-medium text-ink">
          Seules les versions signées, conservées par le bureau, font foi.
        </strong>
      </p>
    ),
  },
  {
    id: 'responsabilite',
    title: 'Responsabilité',
    content: (
      <>
        <p>
          Les informations publiées sur ce site sont fournies à titre indicatif ; l'association
          s'efforce d'en garantir l'exactitude sans pouvoir l'assurer en permanence.
        </p>
        <p>
          Les liens externes éventuellement présents sur le site ne relèvent pas de la
          responsabilité de Quantum Dynamics. L'association ne garantit pas une disponibilité
          continue et ininterrompue du site et ne saurait être tenue responsable des interruptions
          de service.
        </p>
      </>
    ),
  },
  {
    id: 'donnees-personnelles',
    title: 'Données personnelles',
    content: (
      <p>
        Le traitement des données personnelles collectées via ce site est décrit dans la{' '}
        <Link
          to="/politique-de-confidentialite"
          className="font-medium text-energy underline underline-offset-2 transition-colors hover:text-energy-deep"
        >
          politique de confidentialité
        </Link>
        , qui fait partie intégrante des présentes conditions.
      </p>
    ),
  },
  {
    id: 'modification',
    title: 'Modification des CGU',
    content: (
      <p>
        Quantum Dynamics peut modifier les présentes conditions à tout moment ; la date de dernière
        mise à jour est affichée en haut de cette page. Pour toute question relative à ces
        conditions, contactez le bureau à{' '}
        <a
          href="mailto:quantumdynamics.asso@gmail.com"
          className="text-energy underline underline-offset-2 transition-colors hover:text-energy-deep"
        >
          quantumdynamics.asso@gmail.com
        </a>
        .
      </p>
    ),
  },
]

export default function Cgu() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      updatedAt="15 janvier 2025"
      intro={
        <p>
          Les présentes conditions régissent l'utilisation du site de Quantum Dynamics. Merci de
          les lire attentivement avant d'utiliser les espaces publics ou l'espace membres.
        </p>
      }
      sections={SECTIONS}
    />
  )
}
