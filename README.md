# Exigences consolidées — Site « Quantum Dynamics »

## Identité
- Association étudiante « Quantum Dynamics » : concours/compétitions d'ingénierie, conceptions et prototypes (transports, industrie, énergie).
- SIRET : 993 125 129 00011 — Siège : 50 rue de Sèvres, 92410 Ville d'Avray (à afficher dans le footer + mentions légales).
- Contact association : quantumdynamics.asso@gmail.com
- Logo : fourni plus tard par le client → prévoir un emplacement logo (placeholder SVG sobre « QD ») facilement remplaçable (`public/logo.svg`).

## Architecture du site (multi-pages, onglets barre supérieure)
1. **Accueil** — Hero simple, moderne, explicite pour des novices (qui sommes-nous, ce que l'on fait, 3 domaines : transports / industrie / énergie) + bouton « Rejoindre l'association » menant au formulaire. Sections : domaines d'activité, concours, chiffres clés, CTA.
2. **L'association (Présentation)** — objectifs, histoire, bureau et membres (cartes avec rôles : Président, Vice-président, Trésorier, Secrétaire, etc. — contenu placeholder réaliste modifiable via l'admin).
3. **Newsletter** — publications mensuelles (PDF) : liste des éditions, visualisation du PDF directement dans le site au clic (lecteur intégré) + bouton télécharger.
4. **Documents (Bureau)** — documents officiels : procès-verbaux, assemblées générales, partenariats/financements, bilans comptables. Fonctions : téléchargement, filtres par catégorie (cases à cocher, menu déroulant), barre de recherche par nom.
5. **Rejoindre** — formulaire : nom, prénom, études, motivation (optionnelle), email → bouton « Envoyer ». Les candidatures sont stockées et consultables dans l'espace admin ; un module email (prêt à activer avec mot de passe d'application Gmail) notifiera quantumdynamics.asso@gmail.com.
6. **Espace Admin (connexion)** — identifiant + mot de passe (configurés par le client via variables d'environnement, jamais codés en dur). Tableau de bord : publier une newsletter (upload PDF), ajouter/filtrer/supprimer des documents, voir les candidatures, gérer les membres du bureau.
7. **Pages légales** — Politique de confidentialité (RGPD) + Conditions générales d'utilisation, liées en bas à gauche du footer.

## Footer (toutes les pages)
- Liens de navigation (mêmes onglets que la barre supérieure).
- À gauche : Politique de confidentialité + CGU.
- À droite : logo de l'association.
- SIRET + adresse du siège + email de contact.

## Technique / sécurité
- Full-stack : React+Vite frontend + backend (auth admin, base de données, upload PDF, candidatures).
- Sécurité exigée : mots de passe hashés, sessions sécurisées, validation des entrées, protection XSS/injection, rate limiting sur login et formulaire, headers de sécurité, upload limité aux PDF.
- Design : sobre, moderne, professionnel, faible saturation, pas de dégradés bleu-violet « IA ». Site entièrement en français.
