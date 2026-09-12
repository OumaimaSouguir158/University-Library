# 🟢 Projet 1 — Système de gestion de bibliothèque universitaire

> **Statut** : Réalisé | **Niveau** : Intermédiaire | **Durée** : 4-6 semaines

## Objectif
Gérer le catalogue d'ouvrages, les réservations et les rôles d'une bibliothèque
universitaire via une application web complète.

## Stack technique
| Couche | Technologie |
|--------|------------|
| Backend | Node.js / Express — API REST |
| Auth | JWT (JSON Web Tokens) |
| Base de données | PostgreSQL |
| Frontend | Angular (responsive) |
| Conteneurisation | Docker & docker-compose |

## Démarrage rapide
```bash
git clone <url-du-repo>
cd projet-01-bibliotheque
cp .env.example .env
docker-compose up --build
```

### URLs
- **API** : http://localhost:3000
- **Frontend** : http://localhost:4200
- **Docs API** : http://localhost:3000/api-docs

## Architecture en couches
```
frontend/          # Application Angular
backend/
  src/
    config/        # Connexion BDD
    middleware/    # Auth JWT + autorisation par rôle
    routes/        # Définition des endpoints
    controllers/   # Logique métier
    models/        # (optionnel) ORM simple
init.sql           # Schéma + données de démo
docker-compose.yml
```

## Rôles utilisateur
| Rôle | Droits |
|------|--------|
| `admin` | Tout — CRUD livres, utilisateurs, réservations |
| `librarian` | Gérer livres et réservations |
| `student` | Rechercher, réserver, voir ses emprunts |

## Question d'entretien
> **Comment avez-vous géré les autorisations selon les rôles dans votre API ?**
>
> Via deux middlewares chaînés :
> 1. `authenticate` — vérifie et décode le JWT Bearer, injecte `req.user`
> 2. `authorize(...roles)` — compare `req.user.role` avec les rôles autorisés
>    sur la route. Usage déclaratif : `router.post('/', authenticate, authorize('admin', 'librarian'), controller.create)`

## Ligne CV
> « Système de gestion de bibliothèque universitaire — conception UML, API REST
> sécurisée JWT, front Angular, PostgreSQL, Docker. »
