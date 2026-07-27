import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { ArrowRight, Instagram, Loader2 } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import RejoindreSide from '@/components/illustrations/RejoindreSide'
import DiscordIcon from '@/components/DiscordIcon'
import { DISCORD_URL, INSTAGRAM_URL } from '@/lib/socials'

/* ---------- Validation client (messages en français) ---------- */

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Fields = {
  lastName: string
  firstName: string
  email: string
  studies: string
  motivation: string
  consent: boolean
  website: string // honeypot — doit rester vide
}

type FieldErrors = Partial<Record<keyof Fields, string>>

function validateName(value: string, label: string): string | undefined {
  const v = value.trim()
  if (!v) return `Merci d'indiquer votre ${label}.`
  if (v.length < 2 || v.length > 60) return `Le ${label} doit contenir entre 2 et 60 caractères.`
  if (!NAME_PATTERN.test(v)) return `Le ${label} ne doit contenir que des lettres, espaces ou tirets.`
  return undefined
}

function validateField(name: keyof Fields, fields: Fields): string | undefined {
  switch (name) {
    case 'lastName':
      return validateName(fields.lastName, 'nom')
    case 'firstName':
      return validateName(fields.firstName, 'prénom')
    case 'email': {
      const v = fields.email.trim()
      if (!v) return "Merci d'indiquer votre adresse email."
      if (v.length > 120) return "L'adresse email ne doit pas dépasser 120 caractères."
      if (!EMAIL_PATTERN.test(v)) return "Merci d'indiquer une adresse email valide."
      return undefined
    }
    case 'studies': {
      const v = fields.studies.trim()
      if (!v) return 'Merci d\'indiquer vos études.'
      if (v.length < 2 || v.length > 120) return 'Le champ études doit contenir entre 2 et 120 caractères.'
      return undefined
    }
    case 'motivation': {
      if (fields.motivation.length > 1000) return 'Votre message ne doit pas dépasser 1000 caractères.'
      return undefined
    }
    case 'consent': {
      if (!fields.consent) return 'Merci de cocher la case de consentement pour envoyer votre candidature.'
      return undefined
    }
    default:
      return undefined
  }
}

function validateAll(fields: Fields): FieldErrors {
  const errors: FieldErrors = {}
  ;(['lastName', 'firstName', 'email', 'studies', 'motivation', 'consent'] as const).forEach((key) => {
    const error = validateField(key, fields)
    if (error) errors[key] = error
  })
  return errors
}

/* ---------- Styles communs des champs ---------- */

const inputBase =
  'w-full rounded border bg-white px-[14px] py-3 text-base text-ink transition-colors placeholder:text-ink-3 focus:border-energy focus:outline-none focus:ring-2 focus:ring-energy/30'

function fieldClass(hasError: boolean) {
  return cn(inputBase, hasError ? 'border-danger' : 'border-line')
}

/* ---------- Page ---------- */

export default function Rejoindre() {
  const successRef = useRef<HTMLDivElement>(null)

  const [fields, setFields] = useState<Fields>({
    lastName: '',
    firstName: '',
    email: '',
    studies: '',
    motivation: '',
    consent: false,
    website: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [serverError, setServerError] = useState<'generic' | 'rate' | null>(null)
  const [sent, setSent] = useState<{ firstName: string; email: string } | null>(null)

  const lastNameRef = useRef<HTMLInputElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const studiesRef = useRef<HTMLInputElement>(null)
  const motivationRef = useRef<HTMLTextAreaElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const fieldRefs = {
    lastName: lastNameRef,
    firstName: firstNameRef,
    email: emailRef,
    studies: studiesRef,
    motivation: motivationRef,
    consent: consentRef,
  }

  const submit = trpc.applications.submit.useMutation({
    onSuccess: () => {
      setSent({ firstName: fields.firstName.trim(), email: fields.email.trim() })
    },
    onError: (error) => {
      const code = error.data?.code
      if (code === 'TOO_MANY_REQUESTS' || /trop de candidatures/i.test(error.message)) {
        setServerError('rate')
      } else {
        setServerError('generic')
      }
    },
  })

  const setField = <K extends keyof Fields>(name: K, value: Fields[K]) => {
    const next = { ...fields, [name]: value }
    setFields(next)
    if (serverError) setServerError(null)
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, next) }))
    }
  }

  const handleBlur = (name: keyof Fields) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, fields) }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validation = validateAll(fields)
    setErrors(validation)
    setTouched({
      lastName: true,
      firstName: true,
      email: true,
      studies: true,
      motivation: true,
      consent: true,
    })

    const order: (keyof typeof fieldRefs)[] = ['lastName', 'firstName', 'email', 'studies', 'motivation', 'consent']
    const firstError = order.find((key) => validation[key])
    if (firstError) {
      fieldRefs[firstError]?.current?.focus()
      return
    }

    submit.mutate({
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      email: fields.email.trim(),
      studies: fields.studies.trim(),
      motivation: fields.motivation.trim() ? fields.motivation.trim() : undefined,
      website: fields.website ? fields.website : undefined,
    })
  }

  /* --- Coche de confirmation qui se trace (0.5 s, après envoi réussi) --- */
  useEffect(() => {
    if (!sent || !successRef.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const path = successRef.current.querySelector<SVGPathElement>('.check-path')
    if (!path) return
    if (reduced) {
      gsap.set(path, { strokeDashoffset: 0 })
    } else {
      gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' })
    }
  }, [sent])

  const onTextChange =
    (name: 'lastName' | 'firstName' | 'email' | 'studies' | 'motivation' | 'website') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(name, event.target.value)

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] bg-paper lg:grid-cols-12">
      {/* ============ Colonne gauche (7) — contenu + formulaire ============ */}
      <div className="lg:col-span-7">
        {/* Aligné sur le container 1200px du site sur les très grands écrans */}
        <div className="px-6 py-16 md:px-12 md:py-24 lg:pl-[max(3rem,calc((100vw-1200px)/2+3rem))] lg:pr-10">
          <p className="join-label label-mono text-energy">[ Nous rejoindre ]</p>
          <h1 className="join-title mt-5 font-display text-[36px] font-bold leading-[1.05] tracking-[-0.02em] text-ink md:text-[48px]">
            Rejoignez l'atelier.
          </h1>
          <p className="join-lead mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-2 md:text-xl">
            Envie de concevoir, fabriquer et concourir avec nous ? Remplissez ce formulaire — le
            bureau reçoit votre candidature par email et vous répond sous quelques jours. Toutes
            les filières sont les bienvenues.
          </p>

          {sent ? (
            /* ---------- Panneau de confirmation ---------- */
            <div
              ref={successRef}
              className="mt-10 max-w-[560px] rounded border border-ok bg-white p-8 text-center"
              role="status"
            >
              <svg
                viewBox="0 0 48 48"
                className="mx-auto h-16 w-16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="24" cy="24" r="22" stroke="#2E7D5B" strokeWidth="2" />
                <path
                  className="check-path"
                  d="M14 24.5 L21 31 L34 17.5"
                  stroke="#2E7D5B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                />
              </svg>
              <h2 className="mt-6 font-display text-2xl font-medium tracking-[-0.02em] text-ink">
                Candidature envoyée !
              </h2>
              <p className="mx-auto mt-4 max-w-[46ch] text-base leading-relaxed text-ink-2">
                Merci {sent.firstName} ! Votre candidature a bien été transmise au bureau de
                Quantum Dynamics. Vous recevrez une réponse à l'adresse {sent.email} sous quelques
                jours.
              </p>
              <Link to="/" className="btn-secondary mt-8">
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            /* ---------- Formulaire de candidature ---------- */
            <form className="mt-10 max-w-[560px] space-y-5" onSubmit={handleSubmit} noValidate>
              {serverError && (
                <div className="rounded border border-danger bg-white p-4 text-sm leading-relaxed text-danger" role="alert">
                  {serverError === 'rate'
                    ? 'Vous avez déjà envoyé plusieurs candidatures. Réessayez dans un moment.'
                    : "L'envoi a échoué. Réessayez dans un instant — si le problème persiste, écrivez-nous à quantumdynamics.asso@gmail.com."}
                </div>
              )}

              {/* Nom + Prénom côte à côte (desktop) */}
              <div className="join-field grid gap-5 sm:grid-cols-2">
                <div className="group">
                  <label
                    htmlFor="lastName"
                    className="label-mono block text-ink-2 transition-colors duration-200 group-focus-within:text-energy"
                  >
                    Nom
                  </label>
                  <input
                    ref={lastNameRef}
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    maxLength={60}
                    value={fields.lastName}
                    onChange={onTextChange('lastName')}
                    onBlur={() => handleBlur('lastName')}
                    className={cn(fieldClass(Boolean(errors.lastName)), 'mt-2')}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="mt-1.5 text-[13px] text-danger" role="alert">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div className="group">
                  <label
                    htmlFor="firstName"
                    className="label-mono block text-ink-2 transition-colors duration-200 group-focus-within:text-energy"
                  >
                    Prénom
                  </label>
                  <input
                    ref={firstNameRef}
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    maxLength={60}
                    value={fields.firstName}
                    onChange={onTextChange('firstName')}
                    onBlur={() => handleBlur('firstName')}
                    className={cn(fieldClass(Boolean(errors.firstName)), 'mt-2')}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="mt-1.5 text-[13px] text-danger" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="join-field group">
                <label
                  htmlFor="email"
                  className="label-mono block text-ink-2 transition-colors duration-200 group-focus-within:text-energy"
                >
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={120}
                  value={fields.email}
                  onChange={onTextChange('email')}
                  onBlur={() => handleBlur('email')}
                  className={cn(fieldClass(Boolean(errors.email)), 'mt-2')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-[13px] text-danger" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Études */}
              <div className="join-field group">
                <label
                  htmlFor="studies"
                  className="label-mono block text-ink-2 transition-colors duration-200 group-focus-within:text-energy"
                >
                  Études
                </label>
                <input
                  ref={studiesRef}
                  id="studies"
                  name="studies"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="Ex. : BUT Génie Mécanique, 2ᵉ année"
                  value={fields.studies}
                  onChange={onTextChange('studies')}
                  onBlur={() => handleBlur('studies')}
                  className={cn(fieldClass(Boolean(errors.studies)), 'mt-2')}
                  aria-invalid={Boolean(errors.studies)}
                  aria-describedby={errors.studies ? 'studies-error' : undefined}
                />
                {errors.studies && (
                  <p id="studies-error" className="mt-1.5 text-[13px] text-danger" role="alert">
                    {errors.studies}
                  </p>
                )}
              </div>

              {/* Motivation (facultative) */}
              <div className="join-field group">
                <div className="flex items-baseline justify-between gap-4">
                  <label
                    htmlFor="motivation"
                    className="label-mono text-ink-2 transition-colors duration-200 group-focus-within:text-energy"
                  >
                    Pourquoi rejoindre l'association ?{' '}
                    <span className="normal-case text-ink-3">(facultatif)</span>
                  </label>
                  <span className="font-mono text-xs text-ink-3" aria-hidden="true">
                    {fields.motivation.length}/1000
                  </span>
                </div>
                <textarea
                  ref={motivationRef}
                  id="motivation"
                  name="motivation"
                  rows={5}
                  maxLength={1000}
                  value={fields.motivation}
                  onChange={onTextChange('motivation')}
                  onBlur={() => handleBlur('motivation')}
                  className={cn(fieldClass(Boolean(errors.motivation)), 'mt-2 resize-y')}
                  aria-invalid={Boolean(errors.motivation)}
                  aria-describedby={errors.motivation ? 'motivation-error' : undefined}
                />
                {errors.motivation && (
                  <p id="motivation-error" className="mt-1.5 text-[13px] text-danger" role="alert">
                    {errors.motivation}
                  </p>
                )}
              </div>

              {/* Honeypot invisible anti-bot — doit rester vide */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Site web</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={fields.website}
                  onChange={onTextChange('website')}
                />
              </div>

              {/* Consentement RGPD */}
              <div className="join-field">
                <div className="flex items-start gap-3">
                  <input
                    ref={consentRef}
                    id="consent"
                    name="consent"
                    type="checkbox"
                    required
                    checked={fields.consent}
                    onChange={(event) => setField('consent', event.target.checked)}
                    onBlur={() => handleBlur('consent')}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-energy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-energy"
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? 'consent-error' : undefined}
                  />
                  <label htmlFor="consent" className="text-[13px] leading-relaxed text-ink-2">
                    J'accepte que mes informations soient transmises au bureau de Quantum Dynamics
                    pour traiter ma demande. Voir la{' '}
                    <Link
                      to="/politique-de-confidentialite"
                      className="font-medium text-energy underline underline-offset-2 transition-colors hover:text-energy-deep"
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </label>
                </div>
                {errors.consent && (
                  <p id="consent-error" className="mt-1.5 text-[13px] text-danger" role="alert">
                    {errors.consent}
                  </p>
                )}
              </div>

              {/* Bouton d'envoi */}
              <div className="join-field">
                <button type="submit" className="btn-signal group w-full justify-center" disabled={submit.isPending}>
                  {submit.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      Envoyer ma candidature
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
                <p className="mt-3 text-center font-mono text-xs text-ink-3">
                  Envoyé au bureau — quantumdynamics.asso@gmail.com
                </p>
              </div>
            </form>
          )}

          {/* ---------- Réseaux sociaux ---------- */}
          <div className="mt-12 max-w-[560px] border-t border-line pt-6">
            <p className="label-mono text-ink-2">Rejoins-nous aussi sur</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet"
                aria-label="Instagram de Quantum Dynamics"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                Instagram
              </a>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet"
                aria-label="Discord de Quantum Dynamics"
              >
                <DiscordIcon className="h-4 w-4" />
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Colonne droite (5) — image pleine hauteur (cachée < 1024px) ============ */}
      <div className="join-figure relative hidden border-l border-line lg:col-span-5 lg:block">
        <figure className="sticky top-16 h-[calc(100dvh-4rem)]">
          <RejoindreSide className="h-full w-full" />
          {/* Croix de cadrage */}
          <span className="absolute left-4 top-4 h-5 w-5 border-l border-t border-[#F2F1EC]/70" aria-hidden="true" />
          <span className="absolute right-4 top-4 h-5 w-5 border-r border-t border-[#F2F1EC]/70" aria-hidden="true" />
          <span className="absolute bottom-4 left-4 h-5 w-5 border-b border-l border-[#F2F1EC]/70" aria-hidden="true" />
          <span className="absolute bottom-4 right-4 h-5 w-5 border-b border-r border-[#F2F1EC]/70" aria-hidden="true" />
          <figcaption className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-[#F2F1EC] [text-shadow:0_1px_2px_rgba(22,29,26,.6)]">
            FIG. 04 — De l'idée au prototype
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
