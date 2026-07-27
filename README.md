
# Quantum Dynamics — Site Web

Site web officiel de l'association étudiante **Quantum Dynamics**, dédiée aux concours et compétitions d'ingénierie dans les domaines des transports, de l'industrie et de l'énergie.

## Fonctionnalités

| Page | Description |
|------|-------------|
| **Accueil** | Hero, domaines d'activité, compétitions, chiffres clés, CTA |
| **L'association** | Présentation, histoire, bureau et membres |
| **Newsletter** | Publications mensuelles (PDF) avec lecteur intégré |
| **Documents** | Documents officiels avec filtres et recherche |
| **Rejoindre** | Formulaire de candidature (stocké en base) |
| **Espace admin** | Gestion des newsletters, documents, candidatures et membres |
| **Pages légales** | Politique de confidentialité (RGPD) + CGU |

## Stack technique

- **Backend** : Python 3 / Django 5
- **Frontend** : HTML (Django templates) / Tailwind CSS / JavaScript vanilla
- **Base de données** : SQLite (développement) / MySQL (production)
- **Serveur** : Gunicorn + WhiteNoise (statiques)
- **Conteneurisation** : Docker

## Installation locale

### Prérequis

- Python 3.10+
- pip

### Setup

```bash
# Cloner le dépôt
git clone https://github.com/ADZirid/Quantum-dynamics.git
cd Quantum-dynamics/app

# Installer les dépendances
pip install -r requirements.txt

# Lancer les migrations
python manage.py migrate

# Créer un superutilisateur admin
python manage.py createsuperuser

# Lancer le serveur de développement
python manage.py runserver
```

Le site est accessible sur `http://127.0.0.1:8000`.

## Lancement avec Docker

```bash
cd app
docker build -t quantum-dynamics .
docker run -p 3000:3000 quantum-dynamics
```

Le site est accessible sur `http://localhost:3000`.

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SECRET_KEY` | Clé secrète Django | Générée automatiquement |
| `DEBUG` | Mode debug (`true`/`false`) | `false` |
| `PORT` | Port du serveur | `3000` |
| `DATABASE_URL` | URL de la base de données | SQLite locale |
| `ADMIN_PASSWORD` | Mot de passe du compte admin `bureau` | Généré au boot |

## Structure du projet

```
app/
├── accounts_app/     # Authentification et espace admin
├── config/           # Configuration Django (settings, URLs, WSGI)
├── core/             # Modèles, management commands, middleware
├── library/          # Gestion newsletters et documents
├── website/          # Pages publiques (accueil, association, rejoindre)
├── templates/        # Templates HTML
├── static/           # Fichiers statiques (CSS, JS, images, SVG)
├── styles/           # Source Tailwind CSS
├── manage.py         # CLI Django
├── requirements.txt  # Dépendances Python
├── Dockerfile        # Image Docker
└── entrypoint.sh     # Script de démarrage
```

## Licence

Projet privé — Association Quantum Dynamics.
